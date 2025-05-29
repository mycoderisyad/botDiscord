const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAI {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.chatSessions = new Map(); // Store chat sessions for memory
  }

  async generateText(prompt, temperature = 0.7) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        content: text.trim(),
        tokenUsage: response.candidates?.[0]?.tokenCount || 0
      };
    } catch (error) {
      console.error('Gemini AI Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async translate(text, sourceLang = 'Indonesian', targetLang = 'English') {
    const prompt = `Translate the following text accurately from ${sourceLang} to ${targetLang}. Respond only with the translation:\n\n${text}`;
    
    const result = await this.generateText(prompt, 0.3);
    
    if (result.success) {
      return {
        success: true,
        translation: result.content,
        confidence: 95,
        originalText: text
      };
    } else {
      return {
        success: false,
        error: result.error,
        originalText: text
      };
    }
  }

  async grammarCheck(text, targetLang = 'English') {
    const prompt = `Check the following text for grammar errors and provide corrections and suggestions. Focus on grammar, vocabulary, and natural expression. Respond in ${targetLang}. If the text is correct, mention that it's grammatically correct.\n\nText to check: ${text}`;
    
    const result = await this.generateText(prompt, 0.3);
    
    if (result.success) {
      return {
        success: true,
        feedback: result.content,
        originalText: text
      };
    } else {
      return {
        success: false,
        error: result.error,
        originalText: text
      };
    }
  }

  async languageLearning(text, targetLang = 'English') {
    const prompt = `You are a helpful language tutor. The user has provided text. Please:
1. Provide a natural ${targetLang} response as if having a conversation
2. Translate their text to ${targetLang} if needed
3. Give grammar and vocabulary feedback
4. Suggest alternative expressions

Text from user: ${text}

Respond in a friendly, conversational way that helps with language learning.`;

    const result = await this.generateText(prompt, 0.7);
    
    if (result.success) {
      return {
        success: true,
        response: result.content,
        originalText: text
      };
    } else {
      return {
        success: false,
        error: result.error,
        originalText: text
      };
    }
  }

  async startChatSession(userId) {
    const chat = this.model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
    
    this.chatSessions.set(userId, chat);
    return chat;
  }

  async chatWithMemory(userId, message) {
    let chat = this.chatSessions.get(userId);
    
    if (!chat) {
      chat = await this.startChatSession(userId);
    }

    try {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        response: text.trim(),
        originalMessage: message
      };
    } catch (error) {
      console.error('Chat Error:', error.message);
      return {
        success: false,
        error: error.message,
        originalMessage: message
      };
    }
  }

  clearChatHistory(userId) {
    this.chatSessions.delete(userId);
    return true;
  }

  getChatHistory(userId) {
    const chat = this.chatSessions.get(userId);
    if (chat && chat.params && chat.params.history) {
      return chat.params.history;
    }
    return [];
  }
}

module.exports = GeminiAI; 