import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from 'bot/.env' or '../.env'
// We'll try to load from root if bot is run from root or bot folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also try local .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Parse DATABASE_URL if present, or use individual vars
// DATABASE_URL=mysql://user:pass@host:port/db
let dbConfig = {};
if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    dbConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.replace('/', ''),
        port: parseInt(url.port) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
} else {
    // Fallback if no DATABASE_URL
    dbConfig = {
        host: process.env.MYSQL_HOST || 'db',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'haberfoni',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
}

const pool = mysql.createPool(dbConfig);

export const db = pool; // Export generic pool if needed

/**
 * Checks if a news item already exists based on its Original URL.
 * @param {string} originalUrl 
 * @returns {Promise<Object|null>}
 */
export async function checkNewsExists(originalUrl) {
    if (!originalUrl) return null;

    try {
        const [rows] = await pool.execute(
            'SELECT id, content FROM news WHERE original_url = ? LIMIT 1',
            [originalUrl]
        );
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error checking duplicate:', error);
        return null;
    }
}

/**
 * Gets the settings for a specific bot source (e.g. 'IHA').
 * @param {string} sourceName 
 * @returns {Promise<Object>}
 */
export async function getBotSettings(sourceName) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM bot_settings WHERE source_name = ? LIMIT 1',
            [sourceName]
        );
        if (rows.length === 0) {
            return { auto_publish: false, is_active: true };
        }
        return rows[0];
    } catch (e) {
        // console.warn('Bot settings fetch error (using defaults):', e.message);
        return { auto_publish: false, is_active: true };
    }
}

/**
 * Gets active mappings for a specific bot source (e.g. 'AA').
 * @param {string} sourceName 
 * @returns {Promise<Array>}
 */
export async function getBotMappings(sourceName) {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM bot_category_mappings WHERE source_name = ? AND is_active = 1',
            [sourceName]
        );
        return rows;
    } catch (e) {
        console.error('Exception fetching bot mappings:', e);
        return [];
    }
}

/**
 * Gets category ID by slug
 * @param {string} slug 
 * @returns {Promise<number|null>}
 */
export async function getCategoryIdBySlug(slug) {
    try {
        const [rows] = await pool.execute(
            'SELECT id FROM categories WHERE slug = ? LIMIT 1',
            [slug]
        );
        if (rows.length === 0) {
            console.warn(`Category not found for slug: ${slug}`);
            return null;
        }
        return rows[0].id;
    } catch (e) {
        console.error(`Error fetching category ID for ${slug}:`, e);
        return null;
    }
}

// --- HİBRİT AI MANTIĞI ---
async function tryGemini(prompt, apiKey) {
    // Using gemini-1.5-flash for maximum compatibility with v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
        const response = await axios.post(url, { 
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 2048,
            }
        }, { timeout: 20000 });
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) {
        const status = e.response?.status;
        const data = e.response?.data;
        console.error(`[Gemini Error] ${status || e.message}`, JSON.stringify(data || {}));
        throw e;
    }
}

async function tryGroq(prompt, apiKey) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    try {
        const response = await axios.post(url, {
            model: "llama-3.3-70b-versatile", // Use a more modern/active model
            messages: [{ role: "user", content: prompt }]
        }, { headers: { 'Authorization': `Bearer ${apiKey.trim()}` }, timeout: 20000 });
        return response.data?.choices?.[0]?.message?.content;
    } catch (e) {
        const status = e.response?.status;
        const data = e.response?.data;
        console.error(`[Groq Error] ${status || e.message}`, JSON.stringify(data || {}));
        throw e;
    }
}

async function tryOpenAI(prompt, apiKey) {
    const url = 'https://api.openai.com/v1/chat/completions';
    try {
        const response = await axios.post(url, {
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }]
        }, { headers: { 'Authorization': `Bearer ${apiKey}` }, timeout: 20000 });
        return response.data?.choices?.[0]?.message?.content;
    } catch (e) {
        console.error(`[OpenAI Error] ${e.response?.status || e.message}`);
        throw e;
    }
}

export async function rewriteWithAI(title, summary, content) {
    try {
        const [rows] = await pool.execute("SELECT `key`, value FROM site_settings WHERE `key` IN ('ai_api_key', 'groq_api_key', 'openai_api_key')");
        const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
        
        const geminiKey = settings.ai_api_key?.trim();
        const groqKey = settings.groq_api_key?.trim();
        const openaiKey = settings.openai_api_key?.trim();

        if (geminiKey) console.log(`[AI] Gemini Key found: ${geminiKey.substring(0, 5)}...`);
        if (groqKey) console.log(`[AI] Groq Key found: ${groqKey.substring(0, 5)}...`);
        if (openaiKey) console.log(`[AI] OpenAI Key found: ${openaiKey.substring(0, 5)}...`);

        const prompt = `Aşağıdaki haberi SEO dostu, özgün ve profesyonel bir haber dilinde yeniden yaz. 
Ayrıca haber için SEO meta verilerini de oluştur.

Yanıtını tam olarak şu formatta ver:
BAŞLIK: [Buraya özgün başlık]
ÖZET: [Buraya özgün kısa özet]
İÇERİK: [Buraya HTML formatında özgün içerik]
SEO_TITLE: [Haber için SEO başlığı - max 70 karakter]
SEO_DESC: [Haber için SEO açıklaması - max 160 karakter]
SEO_KEYS: [Virgülle ayrılmış 5-8 adet anahtar kelime]

HABER DETAYLARI:
BAŞLIK: ${title}
ÖZET: ${summary}
İÇERİK: ${content}`;

        let aiText = null;
        let provider = null;

        // 1. DENE: GEMINI
        if (geminiKey) {
            try { 
                console.log(`[AI] Trying Gemini...`);
                aiText = await tryGemini(prompt, geminiKey);
                provider = 'Gemini';
            } catch (e) { console.warn('[AI] Gemini failed...'); }
        }

        // 2. DENE: GROQ
        if (!aiText && groqKey) {
            try { 
                console.log(`[AI] Trying Groq (Llama 3)...`);
                aiText = await tryGroq(prompt, groqKey);
                provider = 'Groq';
            } catch (e) { console.warn('[AI] Groq failed...'); }
        }

        // 3. DENE: OPENAI
        if (!aiText && openaiKey) {
            try { 
                console.log(`[AI] Trying OpenAI (GPT-4o mini)...`);
                aiText = await tryOpenAI(prompt, openaiKey);
                provider = 'OpenAI';
            } catch (e) { console.error('[AI] OpenAI failed too.'); }
        }

        if (!aiText) return null;

        const tMatch = aiText.match(/BAŞLIK:\s*(.*)/i);
        const sMatch = aiText.match(/ÖZET:\s*([\s\S]*?)(?=İÇERİK:|$)/i);
        const cMatch = aiText.match(/İÇERİK:\s*([\s\S]*?)(?=SEO_TITLE:|$)/i);
        const stMatch = aiText.match(/SEO_TITLE:\s*(.*)/i);
        const sdMatch = aiText.match(/SEO_DESC:\s*(.*)/i);
        const skMatch = aiText.match(/SEO_KEYS:\s*([\s\S]*)/i); // Match until end of string to catch all tags

        const finalTags = skMatch?.[1]?.trim() || '';
        if (finalTags) console.log(`[AI TAGS] Extracted: ${finalTags.substring(0, 50)}...`);

        return {
            title: tMatch?.[1]?.trim() || title,
            summary: sMatch?.[1]?.trim() || summary,
            content: (cMatch?.[1]?.trim() || content).replace(/^[\\s\\S]*?<html>|^```html\n?|^```\n?/, '').split(/<\/html>|```/)[0],
            author: `Yapay Zeka Editörü`,
            ai_model: provider || 'Gemini',
            seo_title: stMatch?.[1]?.trim() || tMatch?.[1]?.trim() || title,
            seo_description: sdMatch?.[1]?.trim() || sMatch?.[1]?.trim() || summary,
            seo_keywords: finalTags
        };
    } catch (e) { 
        console.error('[AI Rewrite Exception]', e.message);
        return null; 
    }
}

/**
 * Saves a news item to MySQL with Hybrid AI support.
 * @param {Object} newsItem 
 * @returns {Promise<boolean>} success
 */
export async function saveNews(newsItem) {
    try {
        // 1. Check duplicate / existing
        const existing = await checkNewsExists(newsItem.original_url);
        if (existing) {
            // Existing logic kept for updates if needed...
            return false;
        }

        // 2. Get Settings
        const [botSet] = await pool.execute('SELECT use_ai_rewrite, auto_publish, is_active FROM bot_settings WHERE source_name = ?', [newsItem.source || 'TEST']);
        const settings = botSet?.[0] || { use_ai_rewrite: 1, auto_publish: 1, is_active: 1 };
        
        const isBotActive = settings.is_active == 1 || settings.is_active === true || settings.is_active === 'true';
        if (!isBotActive) {
            console.log(`[SKIP] Source ${newsItem.source} is inactive.`);
            return false;
        }

        const forceAI = settings.use_ai_rewrite == 1 || settings.use_ai_rewrite === true || settings.use_ai_rewrite === 'true';

        // 3. AI REWRITE (HYBRID)
        let { title, summary, content, author, seo_title, seo_description, seo_keywords } = newsItem;
        let aiModel = null;
        if (forceAI) {
            console.log(`[AI] Processing: ${title.substring(0, 50)}...`);
            const ai = await rewriteWithAI(title, summary, content);
            if (ai) {
                title = ai.title;
                summary = ai.summary;
                content = ai.content;
                author = ai.author;
                aiModel = ai.ai_model;
                seo_title = ai.seo_title;
                seo_description = ai.seo_description;
                seo_keywords = ai.seo_keywords;
                console.log(`[AI SUCCESS] Written by Yapay Zeka (${ai.ai_model})`);
            } else {
                console.warn(`[AI FAIL] Falling back to original content.`);
            }
        }

        // 4. Extract Tags (Don't add to HTML anymore, save to DB instead)
        let tagsRaw = newsItem.keywords || newsItem.tags || '';
        if (!tagsRaw && seo_keywords) tagsRaw = seo_keywords; // Fallback to AI-generated keywords
        
        const tagArray = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t.length > 1) : [];
        if (!seo_keywords && tagsRaw) seo_keywords = tagsRaw;

        const categorySlug = newsItem.category || 'gundem';
        const categoryId = await getCategoryIdBySlug(categorySlug);

        // 5. Insert
        const query = `
            INSERT INTO news 
            (title, slug, summary, content, image_url, category, category_id, original_url, source, author, ai_model, seo_title, seo_description, seo_keywords, published_at, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())
        `;

        const params = [
            title,
            slugify(title),
            summary,
            content,
            newsItem.image_url,
            categorySlug,
            categoryId,
            newsItem.original_url,
            newsItem.source,
            author || newsItem.source,
            aiModel,
            seo_title || title,
            (seo_description || summary || '').substring(0, 510),
            seo_keywords,
            settings.auto_publish ? new Date() : null,
            1 // is_active
        ];

        console.log(`[DEBUG] Inserting ${newsItem.source} news: ${title.substring(0, 30)}... (Cat: ${categorySlug})`);
        const [result] = await pool.execute(query, params);
        const newsId = result.insertId;

        // 6. Save Tags Relationships
        if (newsId && tagArray.length > 0) {
            await saveTagsForNews(newsId, tagArray);
        }

        console.log(`[SAVE] Saved: ${title} (Tags: ${tagArray.length})`);
        return true;

    } catch (error) {
        console.error('Error saving news:', error);
        return false;
    }
}

// Simple slugify helper
// Startup Maintenance: Ensure AI is enabled and clear some recent news to force re-processing
async function runStartupFix() {
    try {
        console.log('[STARTUP] Running database maintenance...');
        // Force AI on for all sources
        await pool.execute('UPDATE bot_settings SET use_ai_rewrite = 1');
        console.log('[STARTUP] AI Rewrite enabled for all sources.');
        
        // Delete last 5 items - success, commenting out for safety
        // const [del] = await pool.execute('DELETE FROM news ORDER BY id DESC LIMIT 5');
        // console.log(`[STARTUP] Deleted ${del.affectedRows} recent news items for re-processing.`);
    } catch (err) {
        console.error('[STARTUP ERROR]', err.message);
    }
}
runStartupFix();

function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

async function saveTagsForNews(newsId, tags) {
    for (const tagName of tags) {
        try {
            const tagSlug = slugify(tagName);
            if (!tagSlug) continue;

            // 1. Get or Create Tag
            let tagId;
            const [existing] = await pool.execute('SELECT id FROM tags WHERE name = ? OR slug = ?', [tagName, tagSlug]);
            
            if (existing.length > 0) {
                tagId = existing[0].id;
            } else {
                const [ins] = await pool.execute('INSERT INTO tags (name, slug, created_at) VALUES (?, ?, NOW())', [tagName, tagSlug]);
                tagId = ins.insertId;
            }

            // 2. Link to News
            if (tagId) {
                await pool.execute('INSERT IGNORE INTO news_tags (news_id, tag_id, created_at) VALUES (?, ?, NOW())', [newsId, tagId]);
            }
        } catch (e) {
            console.error(`Error saving tag "${tagName}":`, e.message);
        }
    }
}

export async function updateBotMappingStatus(sourceUrl, status, count) {
    try {
        await pool.execute(
            'UPDATE bot_category_mappings SET last_scraped_at = NOW(), last_status = ?, last_item_count = ?, updated_at = NOW() WHERE source_url = ?',
            [status, count, sourceUrl]
        );
    } catch (error) {
        console.error('EXCEPTION updating mapping status:', error);
    }
}
