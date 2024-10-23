import { GoogleGenerativeAI } from '@google/generative-ai';

export class ChatService {
  private model;
  private chatSession;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-8b",
    });
    
    this.chatSession = this.model.startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 20,
        maxOutputTokens: 8192,
      },
      history: [],
    });
  }

  async sendMessage(message: string, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const result = await this.chatSession.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      // Since Gemini doesn't support streaming yet, we'll simulate it
      const chunks = text.match(/.{1,20}/g) || [];
      for (const chunk of chunks) {
        onChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming delay
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}