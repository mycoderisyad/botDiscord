const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'help',
    description: 'Menampilkan daftar command yang tersedia',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    
    const embed = new EmbedBuilder()
      .setColor(0x4285f4)
      .setTitle('🤖 PoligotBot - Bantuan')
      .setDescription('**Bahasa Anda:** 🇮🇩 Indonesian\n\nBot Discord untuk latihan bahasa dengan Gemini AI dan Google Translate TTS (GRATIS)')
      .addFields(
        { 
          name: '💬 Percakapan Real-time', 
          value: `\`${prefix}chat <pesan>\` - Percakapan dengan AI (ada memory)\n\`${prefix}chat clear\` - Hapus riwayat percakapan\n\`${prefix}chat history\` - Lihat riwayat percakapan`, 
          inline: false 
        },
        { 
          name: '🌍 Translator Multibahasa', 
          value: `\`${prefix}translate <teks>\` - Terjemahan otomatis\n\`${prefix}translate <kode> <teks>\` - Terjemahan ke bahasa tertentu\n\`${prefix}tr\` - Alias untuk translate`, 
          inline: false 
        },
        { 
          name: '📚 Pembelajaran Bahasa', 
          value: `\`${prefix}belajar <teks>\` - Feedback pembelajaran multibahasa\n\`${prefix}grammar <teks>\` - Grammar check multibahasa\n\`${prefix}learn\` - Alias untuk belajar`, 
          inline: false 
        },
        { 
          name: '🌐 Pengaturan Bahasa', 
          value: `\`${prefix}language\` - Lihat/ubah bahasa preferensi\n\`${prefix}language <kode>\` - Set bahasa (id, en, ja, ko, zh)\n\`${prefix}lang\` - Alias untuk language`, 
          inline: false 
        },
        { 
          name: '🎤 Voice Chat AI', 
          value: `\`${prefix}voicechat start\` - Mulai percakapan suara dengan AI\n\`${prefix}voicechat stop\` - Stop voice chat\n\`${prefix}voicechat status\` - Status voice session\n\`${prefix}vc\` - Alias untuk voicechat`, 
          inline: false 
        },
        { 
          name: '🎵 Voice & TTS (GRATIS!)', 
          value: `\`${prefix}join\` - Bot masuk voice channel\n\`${prefix}leave\` - Bot keluar voice channel\n\`${prefix}tts <teks>\` - Text-to-speech gratis (Google Translate)\n\`${prefix}tts <kode> <teks>\` - TTS dengan bahasa tertentu`, 
          inline: false 
        },
        { 
          name: '🛠️ Utilitas', 
          value: `\`${prefix}ping\` - Cek status dan latency\n\`${prefix}help\` - Panduan ini`, 
          inline: false 
        },
        {
          name: '🌍 Bahasa yang Didukung',
          value: '🇮🇩 `id` Indonesian\n🇺🇸 `en` English\n🇯🇵 `ja` Japanese\n🇰🇷 `ko` Korean\n🇨🇳 `zh` Chinese',
          inline: true
        },
        {
          name: '💡 Contoh Penggunaan',
          value: `\`${prefix}tts hai\` - TTS Indonesian\n\`${prefix}tts en hello\` - TTS English\n\`${prefix}tts ja こんにちは\` - TTS Japanese\n\`${prefix}translate en 안녕하세요\` - Korea ke Inggris\n\`${prefix}belajar 我想学习中文\` - Belajar Mandarin\n\`${prefix}grammar I are happy\` - Check grammar`,
          inline: true
        }
      )
      .setFooter({ text: 'PoligotBot v3.0 - Powered by Gemini AI & Google Translate TTS (FREE)' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
}; 