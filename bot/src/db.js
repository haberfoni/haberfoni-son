import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from 'bot/.env' (relative to this file: ../.env)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Checks if a news item already exists based on its Original URL.
 * @param {string} originalUrl 
 * @returns {Promise<Object|null>}
 */
export async function checkNewsExists(originalUrl) {
    if (!originalUrl) return null;

    const { data, error } = await supabase
        .from('news')
        .select('id, content')
        .eq('original_url', originalUrl)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is 'Row not found'
        console.error('Error checking duplicate:', error);
        return null;
    }

    return data || null;
}

/**
 * Gets the settings for a specific bot source (e.g. 'IHA').
 * Used to determine if news should be auto-published.
 * @param {string} sourceName 
 * @returns {Promise<Object>}
 */
export async function getBotSettings(sourceName) {
    // If table doesn't exist yet (before migration), return default
    try {
        const { data, error } = await supabase
            .from('bot_settings')
            .select('*')
            .eq('source_name', sourceName)
            .single();

        if (error) {
            // If table missing or source missing, return default
            // console.warn('Bot settings fetch error (using defaults):', error.message);
            return { auto_publish: false, is_active: true };
        }
        return data;
    } catch (e) {
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
        const { data, error } = await supabase
            .from('bot_category_mappings')
            .select('*')
            .eq('source_name', sourceName)
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching bot mappings:', error);
            return [];
        }
        return data;
    } catch (e) {
        console.error('Exception fetching bot mappings:', e);
        return [];
    }
}

/**
 * Gets category ID by slug
 * @param {string} slug 
 * @returns {Promise<string|null>}
 */
export async function getCategoryIdBySlug(slug) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', slug)
            .single();

        if (error || !data) {
            console.warn(`Category not found for slug: ${slug}`);
            return null;
        }
        return data.id;
    } catch (e) {
        console.error(`Error fetching category ID for ${slug}:`, e);
        return null;
    }
}

/**
 * Saves a news item to Supabase.
 * @param {Object} newsItem 
 * @returns {Promise<boolean>} success
 */
export async function saveNews(newsItem) {
    try {
        // 1. Check duplicate / existing
        const existing = await checkNewsExists(newsItem.original_url);

        if (existing) {
            const hasExistingContent = existing.content && existing.content.trim().length > 0;
            const hasNewContent = newsItem.content && newsItem.content.trim().length > 0;

            // If existing has content, we skip (it's a true duplicate)
            if (hasExistingContent) {
                console.log(`[SKIP] Exists: ${newsItem.title}`);
                return false;
            }

            // Condition 1: Existing has NO content, but new item HAS content -> UPDATE it!
            // Condition 2: Existing has SHORT content (likely truncated/meta desc), new item has LONG content -> UPDATE it!
            const isExistingShort = !hasExistingContent || existing.content.trim().length < 400;
            const isNewLong = hasNewContent && newsItem.content.trim().length > 400;

            if (isExistingShort && isNewLong) {
                console.log(`[UPDATE] Updating short/empty content (${existing.content ? existing.content.length : 0} chars) for: ${newsItem.title}`);
                const { data: updatedData, error: updateError } = await supabase
                    .from('news')
                    .update({
                        content: newsItem.content,
                        summary: newsItem.summary, // Update summary too just in case
                        updated_at: new Date().toISOString() // Try ISO string explicitly
                    })
                    .eq('id', existing.id)
                    .select(); // Add select to verify update

                if (updateError) {
                    console.error('Error updating news content:', updateError);
                    return false;
                }
                console.log(`[UPDATE] Success. Updated rows: ${updatedData ? updatedData.length : 0}`);
                return true;
            }

            // Both empty or some other case -> Skip
            console.log(`[SKIP] Exists (No content update): ${newsItem.title}`);
            return false;
        }

        // 2. Get Settings
        const settings = await getBotSettings(newsItem.source || 'TEST');

        if (settings && !settings.is_active) {
            console.log(`[SKIP] Source ${newsItem.source} is inactive.`);
            return false;
        }

        const shouldPublish = settings ? settings.auto_publish : false;

        // 3. Prepare Payload
        const slug = newsItem.slug || slugify(newsItem.title);

        // Map category slug to category_id
        const categorySlug = newsItem.category || 'gundem';
        const categoryId = await getCategoryIdBySlug(categorySlug);

        const payload = {
            title: newsItem.title,
            slug: slug,
            summary: newsItem.summary,
            content: newsItem.content,
            image_url: newsItem.image_url,
            category: categorySlug,
            category_id: categoryId, // Map slug to ID
            original_url: newsItem.original_url,
            source: newsItem.source,
            author: newsItem.author, // Save extracted author
            published_at: shouldPublish ? new Date() : null,
            is_active: true,

            // Map SEO fields (best effort)
            seo_title: newsItem.title,
            seo_description: newsItem.summary,
            seo_keywords: newsItem.keywords || ''
        };

        // 4. Insert
        const { data, error } = await supabase
            .from('news')
            .insert(payload)
            .select();

        if (error) {
            if (error.code === '23505') { // Unique violation (slug or original_url)
                console.log(`[SKIP] Duplicate (DB constraint): ${newsItem.title}`);
                return false;
            }
            console.error('Error saving news:', error);
            return false;
        }

        console.log(`[SAVE] Saved (${shouldPublish ? 'Published' : 'Draft'}): ${newsItem.title}`);
        return true;

    } catch (error) {
        console.error('Exception in saveNews:', error);
        return false;
    }
}

// Simple slugify helper
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '')             // Trim - from end of text
        + '-' + Math.floor(Math.random() * 1000); // Add random suffix to reduce collision chance for bot
}
export async function updateBotMappingStatus(sourceUrl, status, count) {
    try {
        const { data, error } = await supabase
            .from('bot_category_mappings')
            .update({
                last_scraped_at: new Date(),
                last_status: status,
                last_item_count: count
            })
            .eq('source_url', sourceUrl)
            .select();

        if (error) {
            console.error('SERVER ERROR updating mapping status:', error.message);
        } else if (!data || data.length === 0) {
            console.warn('WARNING: No mapping found to update for URL:', sourceUrl);
        } else {
            console.log(`Updated status for ${sourceUrl}: ${status}`);
        }
    } catch (error) {
        console.error('EXCEPTION updating mapping status:', error);
    }
}
