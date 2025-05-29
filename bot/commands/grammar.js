const { EmbedBuilder } = require('discord.js');
const GeminiAI = require('../../services/gemini');

module.exports = {
  data: {
    name: 'grammar',
    description: 'Periksa grammar dan berikan saran perbaikan menggunakan Gemini AI',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    
    if (args.length === 0) {
      return message.reply(`❌ Silakan berikan teks yang ingin diperiksa grammar-nya.\n**Contoh:**\n\`${prefix}grammar I are going to school\`\n\`${prefix}grammar saya sudah pergi ke sekolah\``);
    }

    const text = args.join(' ');
    
    if (text.length > 1000) {
      return message.reply('❌ Teks terlalu panjang untuk grammar check. Maksimal 1000 karakter.');
    }

    const gemini = new GeminiAI();
    
    try {
      // Show typing indicator
      await message.channel.sendTyping();
      
      // Detect language for better grammar checking
      const detectedLang = detectTextLanguage(text);
      const targetLang = getLanguageName(detectedLang);
      
      const response = await gemini.grammarCheck(text, targetLang);
      
      if (!response.success) {
        throw new Error(response.error || 'Grammar check failed');
      }
      
      const languageFlag = getLanguageFlag(detectedLang);
      
      const embed = new EmbedBuilder()
        .setColor(0x34a853)
        .setTitle(`📝 Grammar Check ${languageFlag}`)
        .addFields(
          { name: '📝 Teks Original', value: text, inline: false },
          { name: '✍️ Feedback & Saran', value: response.feedback || 'Tidak ada feedback tersedia', inline: false }
        )
        .setFooter({ text: 'Powered by Gemini AI Grammar Expert' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Grammar check error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Error Grammar Check')
        .setDescription('Terjadi kesalahan saat memeriksa grammar. Silakan coba lagi.')
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