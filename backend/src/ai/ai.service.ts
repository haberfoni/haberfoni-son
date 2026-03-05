import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.AI_API_KEY;
  private readonly apiUrl = process.env.AI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent';

  async rewriteNews(title: string, summary: string, content: string): Promise<{ title: string; summary: string; content: string } | null> {
    if (!this.apiKey) {
      this.logger.warn('AI_API_KEY is not set. Skipping AI rewrite.');
      return null;
    }

    try {
      this.logger.log(`AI Rewriting attempt for: ${title.substring(0, 50)}...`);
      
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

      const response = await axios.post(`${this.apiUrl}?key=${this.apiKey}`, {
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) {
        this.logger.error('AI Response is empty or invalid structure');
        return null;
      }

      this.logger.debug(`AI Raw Response: ${aiText.substring(0, 100)}...`);

      // More robust regex (case insensitive and supports various whitespace)
      const titleMatch = aiText.match(/BAŞLIK:\s*(.*)/i);
      const summaryMatch = aiText.match(/ÖZET:\s*([\s\S]*?)(?=İÇERİK:|$)/i);
      const contentMatch = aiText.match(/İÇERİK:\s*([\s\S]*)/i);

      const newTitle = titleMatch?.[1]?.trim() || title;
      const newSummary = summaryMatch?.[1]?.trim() || summary;
      let newContent = contentMatch?.[1]?.trim() || content;

      // Clean markdown code blocks if AI wrapped the HTML
      newContent = newContent.replace(/^```html\n?/, '').replace(/\n?```$/, '');

      this.logger.log(`AI Successfully rewrote: ${newTitle.substring(0, 50)}...`);

      return {
        title: newTitle,
        summary: newSummary,
        content: newContent
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
}
