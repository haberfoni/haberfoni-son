import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private settingsService: SettingsService) { }

  async rewriteNews(title: string, summary: string, content: string): Promise<{ title: string; summary: string; content: string; model: string } | null> {
    const dbApiKey = await this.settingsService.findOne('AI_API_KEY');
    const dbApiUrl = await this.settingsService.findOne('AI_API_URL');

    const apiKey = dbApiKey?.value || process.env.AI_API_KEY;
    const apiUrl = dbApiUrl?.value || process.env.AI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent';

    if (!apiKey) {
      this.logger.warn('AI_API_KEY is not set (neither in DB nor in ENV). Skipping AI rewrite.');
      return null;
    }

    try {
      this.logger.log(`AI Rewriting attempt for news: ${title.substring(0, 50)}...`);
      
      const prompt = `
      Aşağıdaki haberi profesyonel bir haber editörü gibi, SEO dostu, özgün ve ilgi çekici bir şekilde yeniden yaz.
      Haberin özünü ve doğruluğunu bozma. 
      Lütfen yanıtında SADECE şu formatı kullan (başka açıklama ekleme):
      BAŞLIK: [Yeni Başlık]
      ÖZET: [Yeni Özet]
      İÇERİK: [Yeni İçerik (HTML formatında p ve h3 tagları ile)]

      ORİJİNAL HABER:
      BAŞLIK: ${title}
      ÖZET: ${summary}
      İÇERİK: ${content}
      `;

      let attempts = 0;
      const maxAttempts = 3;
      let response;

      while (attempts < maxAttempts) {
        try {
          response = await axios.post(`${apiUrl}?key=${apiKey}`, {
            contents: [{
              parts: [{ text: prompt }]
            }]
          }, {
            timeout: 30000 
          });
          break; // Success
        } catch (error) {
          attempts++;
          if (error.response?.status === 429 && attempts < maxAttempts) {
            const waitTime = attempts * 3000;
            this.logger.warn(`AI Rate Limit (429) hit. Retrying in ${waitTime}ms... (Attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else if (error.response?.status === 503 && attempts < maxAttempts) {
            this.logger.warn(`AI Service Unavailable (503). Retrying... (Attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw error;
          }
        }
      }

      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) {
        this.logger.error('AI Response is empty or invalid structure');
        return null;
      }

      this.logger.debug(`AI Raw Response: ${aiText.substring(0, 100)}...`);

      const titleMatch = aiText.match(/BAŞLIK:\s*(.*)/i);
      const summaryMatch = aiText.match(/ÖZET:\s*([\s\S]*?)(?=İÇERİK:|$)/i);
      const contentMatch = aiText.match(/İÇERİK:\s*([\s\S]*)/i);

      const newTitle = titleMatch?.[1]?.trim() || title;
      const newSummary = summaryMatch?.[1]?.trim() || summary;
      let newContent = contentMatch?.[1]?.trim() || content;

      newContent = newContent.replace(/^```html\n?/, '').replace(/\n?```$/, '');

      this.logger.log(`AI Successfully rewrote news: ${newTitle.substring(0, 50)}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        title: newTitle,
        summary: newSummary,
        content: newContent,
        model: apiUrl.includes('openai') ? 'GPT' : (apiUrl.includes('groq') ? 'Groq' : 'Gemini')
      };
    } catch (error) {
      if (error.response) {
        this.logger.error(`AI API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(`Error in AI rewrite: ${error.message}`);
      }
      return null;
    }
  }

  async rewriteVisualContent(title: string, description: string): Promise<{ 
    title: string; 
    description: string; 
    seo_title: string; 
    seo_description: string; 
    seo_keywords: string;
    model: string;
  } | null> {
    const dbApiKey = await this.settingsService.findOne('AI_API_KEY');
    const dbApiUrl = await this.settingsService.findOne('AI_API_URL');

    const apiKey = dbApiKey?.value || process.env.AI_API_KEY;
    const apiUrl = dbApiUrl?.value || process.env.AI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent';

    if (!apiKey) {
        this.logger.warn('AI_API_KEY is not set for visual rewrite. Skipping.');
        return null;
    }

    try {
      this.logger.log(`AI Rewriting attempt for visual content: ${title.substring(0, 50)}...`);
      
      const prompt = `
      Aşağıdaki video veya galeri içeriğini profesyonel bir editör gibi, SEO dostu ve ilgi çekici bir şekilde yeniden yaz.
      Lütfen yanıtında SADECE şu formatı kullan (başka açıklama ekleme):
      BAŞLIK: [Yeni Başlık]
      AÇIKLAMA: [Yeni Açıklama (HTML içermesin, düz metin)]
      SEO_BASLIK: [SEO Başlığı]
      SEO_ACIKLAMA: [SEO Açıklaması (max 160 karakter)]
      ANAHTAR_KELIMELER: [Etiketler, virgülle ayrılmış]

      ORİJİNAL İÇERİK:
      BAŞLIK: ${title}
      AÇIKLAMA: ${description || 'Açıklama yok'}
      `;

      let attempts = 0;
      const maxAttempts = 3;
      let response;

      while (attempts < maxAttempts) {
        try {
          response = await axios.post(`${apiUrl}?key=${apiKey}`, {
            contents: [{
              parts: [{ text: prompt }]
            }]
          }, {
            timeout: 30000 
          });
          break; // Success
        } catch (error) {
          attempts++;
          if (error.response?.status === 429 && attempts < maxAttempts) {
            const waitTime = attempts * 3000;
            this.logger.warn(`AI Rate Limit (429) hit for visual content. Retrying in ${waitTime}ms... (Attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else if (error.response?.status === 503 && attempts < maxAttempts) {
            this.logger.warn(`AI Service Unavailable (503). Retrying... (Attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw error;
          }
        }
      }

      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) {
        this.logger.error('AI Response for visual content is empty');
        return null;
      }

      this.logger.debug(`AI Raw Visual Response: ${aiText.substring(0, 100)}...`);

      const titleMatch = aiText.match(/BAŞLIK:\s*(.*)/i);
      const descMatch = aiText.match(/AÇIKLAMA:\s*([\s\S]*?)(?=SEO_BASLIK:|$)/i);
      const seoTitleMatch = aiText.match(/SEO_BASLIK:\s*(.*)/i);
      const seoDescMatch = aiText.match(/SEO_ACIKLAMA:\s*(.*)/i);
      const keywordsMatch = aiText.match(/ANAHTAR_KELIMELER:\s*(.*)/i);

      const newTitle = titleMatch?.[1]?.trim() || title;
      const newDescription = descMatch?.[1]?.trim() || (description || '');
      const seoTitle = seoTitleMatch?.[1]?.trim() || newTitle;
      const seoDescription = seoDescMatch?.[1]?.trim() || (newDescription ? newDescription.substring(0, 160) : '');
      const seoKeywords = keywordsMatch?.[1]?.trim() || '';

      this.logger.log(`AI Successfully rewrote visual content: ${newTitle.substring(0, 50)}...`);
      return {
        title: newTitle,
        description: newDescription,
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
        model: apiUrl.includes('openai') ? 'GPT' : (apiUrl.includes('groq') ? 'Groq' : 'Gemini')
      };
    } catch (error) {
      if (error.response) {
        this.logger.error(`AI Visual API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(`Error in AI visual rewrite: ${error.message}`);
      }
      return null;
    }
  }
}
