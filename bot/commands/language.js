const { EmbedBuilder } = require('discord.js');

// User language preferences storage (in production, use database)
const userLanguages = new Map();

module.exports = {
  data: {
    name: 'language',
    description: 'Lihat atau ubah bahasa preferensi',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    const userId = message.author.id;
    
    const supportedLanguages = {
      'id': { name: 'Indonesian', flag: '🇮🇩', code: 'id-ID' },
      'en': { name: 'English', flag: '🇺🇸', code: 'en-US' },
      'ja': { name: 'Japanese', flag: '🇯🇵', code: 'ja-JP' },
      'ko': { name: 'Korean', flag: '🇰🇷', code: 'ko-KR' },
      'zh': { name: 'Chinese', flag: '🇨🇳', code: 'zh-CN' }
    };

    // Show current language if no arguments
    if (args.length === 0) {
      const currentLang = userLanguages.get(userId) || 'id';
      const langInfo = supportedLanguages[currentLang];
      
      const embed = new EmbedBuilder()
        .setColor(0x4285f4)
        .setTitle('🌐 Pengaturan Bahasa')
        .addFields(
          { 
            name: '🎯 Bahasa Saat Ini', 
            value: `${langInfo.flag} ${langInfo.name} (${currentLang})`, 
            inline: false 
          },
          {
            name: '📝 Cara Menggunakan',
            value: `\`${prefix}language <kode>\` - Ubah bahasa\nContoh: \`${prefix}language en\``,
            inline: false
          }
        )
        .setFooter({ text: `Gunakan ${prefix}language <kode> untuk mengubah` })
        .setTimestamp();

      // Add supported languages
      const langList = Object.entries(supportedLanguages)
        .map(([code, info]) => `${info.flag} \`${code}\` ${info.name}`)
        .join('\n');
        
      embed.addFields({
        name: '🌍 Bahasa yang Didukung',
        value: langList,
        inline: false
      });

      return message.reply({ embeds: [embed] });
    }

    // Set new language
    const newLang = args[0].toLowerCase();
    
    if (!supportedLanguages[newLang]) {
      const validCodes = Object.keys(supportedLanguages).map(code => `\`${code}\``).join(', ');
      return message.reply(`❌ Kode bahasa tidak valid. Gunakan salah satu: ${validCodes}`);
    }

    // Update user language preference
    userLanguages.set(userId, newLang);
    const langInfo = supportedLanguages[newLang];
    
    const embed = new EmbedBuilder()
      .setColor(0x34a853)
      .setTitle('✅ Bahasa Berhasil Diubah')
      .addFields(
        { 
          name: '🎯 Bahasa Baru', 
          value: `${langInfo.flag} ${langInfo.name}`, 
          inline: false 
        },
        {
          name: '💡 Info',
          value: 'Pengaturan ini akan mempengaruhi:\n• Translation target language\n• Grammar check language\n• Voice chat language\n• Learning feedback language',
          inline: false
        }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
  
  // Helper function to get user language
  getUserLanguage(userId) {
    return userLanguages.get(userId) || 'id';
  },
  
  // Helper function to get language info
  getLanguageInfo(langCode) {
    const supportedLanguages = {
      'id': { name: 'Indonesian', flag: '🇮🇩', code: 'id-ID' },
      'en': { name: 'English', flag: '🇺🇸', code: 'en-US' },
      'ja': { name: 'Japanese', flag: '🇯🇵', code: 'ja-JP' },
      'ko': { name: 'Korean', flag: '🇰🇷', code: 'ko-KR' },
      'zh': { name: 'Chinese', flag: '🇨🇳', code: 'zh-CN' }
    };
    
    return supportedLanguages[langCode] || supportedLanguages['id'];
  }
}; 