const { EmbedBuilder } = require('discord.js');
const GeminiAI = require('../../services/gemini');

module.exports = {
  data: {
    name: 'translate',
    description: 'Terjemahkan teks menggunakan Gemini AI',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    
    if (args.length === 0) {
      return message.reply(`❌ Silakan berikan teks yang ingin diterjemahkan.\n**Contoh:**\n\`${prefix}translate hello world\` - Auto translate\n\`${prefix}translate id hello world\` - Translate to Indonesian\n\`${prefix}translate en saya lapar\` - Translate to English`);
    }

    let targetLang = 'auto';
    let text = args.join(' ');
    
    // Check if first argument is language code
    const langCodes = ['id', 'en', 'ja', 'ko', 'zh'];
    if (langCodes.includes(args[0].toLowerCase())) {
      targetLang = args[0].toLowerCase();
      text = args.slice(1).join(' ');
    }
    
    if (!text || text.length === 0) {
      return message.reply('❌ Silakan berikan teks yang ingin diterjemahkan.');
    }
    
    if (text.length > 2000) {
      return message.reply('❌ Teks terlalu panjang. Maksimal 2000 karakter.');
    }

    const gemini = new GeminiAI();
    
    try {
      // Show typing indicator
      await message.channel.sendTyping();
      
      let response;
      
      // Language mapping
      const langMap = {
        'id': 'Indonesian',
        'en': 'English', 
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese'
      };

      if (targetLang === 'auto') {
        // Auto-detect and translate
        response = await gemini.translate(text, 'auto-detect', 'English');
      } else {
        // Translate to specific language
        const targetLanguage = langMap[targetLang] || 'English';
        response = await gemini.translate(text, 'auto-detect', targetLanguage);
      }
      
      if (!response.success) {
        throw new Error(response.error || 'Translation failed');
      }

      // Detect source language for display
      const detectedLang = detectTextLanguage(text);
      const sourceLangFlag = getLanguageFlag(detectedLang);
      const targetLangFlag = getLanguageFlag(targetLang === 'auto' ? 'en' : targetLang);

      const embed = new EmbedBuilder()
        .setColor(0x4285f4)
        .setTitle('🌍 Terjemahan')
        .addFields(
          { 
            name: `📝 Teks Asli ${sourceLangFlag}`, 
            value: text, 
            inline: false 
          },
          { 
            name: `🔄 Terjemahan ${targetLangFlag}`, 
            value: response.translation || 'Error dalam terjemahan', 
            inline: false 
          }
        )
        .setFooter({ text: 'Powered by Gemini AI' })
        .setTimestamp();

      if (response.confidence) {
        embed.addFields(
          { name: '📊 Confidence', value: `${response.confidence}%`, inline: true }
        );
      }

      await message.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Translation error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Error Terjemahan')
        .setDescription('Terjadi kesalahan saat menerjemahkan teks. Silakan coba lagi.')
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