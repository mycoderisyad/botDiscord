const { EmbedBuilder } = require('discord.js');
const GeminiAI = require('../../services/gemini');

module.exports = {
  data: {
    name: 'belajar',
    description: 'Mode pembelajaran dengan feedback grammar dan vocabulary menggunakan Gemini AI',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    
    if (args.length === 0) {
      return message.reply(`❌ Silakan berikan teks yang ingin dipelajari.\n**Contoh:**\n\`${prefix}belajar saya ingin membeli makanan\`\n\`${prefix}belajar I want to learn English\``);
    }

    const text = args.join(' ');
    
    if (text.length > 2000) {
      return message.reply('❌ Teks terlalu panjang. Maksimal 2000 karakter.');
    }

    const gemini = new GeminiAI();
    
    try {
      // Show typing indicator
      await message.channel.sendTyping();
      
      // Detect language for better learning experience
      const detectedLang = detectTextLanguage(text);
      const targetLang = getLanguageName(detectedLang);
      
      const response = await gemini.languageLearning(text, targetLang);
      
      if (!response.success) {
        throw new Error(response.error || 'Language learning processing failed');
      }
      
      const languageFlag = getLanguageFlag(detectedLang);
      
      const embed = new EmbedBuilder()
        .setColor(0x4285f4)
        .setTitle(`📚 Mode Pembelajaran ${languageFlag}`)
        .addFields(
          { name: '📝 Input Anda', value: text, inline: false },
          { name: '🎯 Feedback Pembelajaran', value: response.response || 'Tidak ada feedback tersedia', inline: false }
        )
        .setFooter({ text: 'Powered by Gemini AI Language Tutor' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Learning error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Error Mode Pembelajaran')
        .setDescription('Terjadi kesalahan saat memproses pembelajaran. Silakan coba lagi.')
        .addFields(
          { name: '🔍 Detail Error', value: error.message, inline: false }
        )
        .setTimestamp();
      
      await message.reply({ embeds: [errorEmbed] });
    }
  },
};

// Helper functions
function detectTextLanguage(text) {
  // Simple language detection based on character patterns
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
    return 'zh';
  }
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
  if (/[a-zA-Z]/.test(text) && !/[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]/.test(text)) return 'en';
  return 'id'; // default to Indonesian
}

function getLanguageName(langCode) {
  const names = {
    'id': 'Indonesian',
    'en': 'English', 
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese'
  };
  return names[langCode] || 'English';
}

function getLanguageFlag(langCode) {
  const flags = {
    'id': '🇮🇩',
    'en': '🇺🇸', 
    'ja': '🇯🇵',
    'ko': '🇰🇷',
    'zh': '🇨🇳'
  };
  return flags[langCode] || '🌍';
} 