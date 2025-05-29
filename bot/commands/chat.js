const { EmbedBuilder } = require('discord.js');
const GeminiAI = require('../../services/gemini');

module.exports = {
  data: {
    name: 'chat',
    description: 'Percakapan dengan Gemini AI (ada memory)',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    const gemini = new GeminiAI();
    const userId = message.author.id;

    // Handle special commands
    if (args.length > 0) {
      const subCommand = args[0].toLowerCase();
      
      if (subCommand === 'clear') {
        gemini.clearChatHistory(userId);
        return message.reply('✅ Riwayat percakapan telah dihapus!');
      }
      
      if (subCommand === 'history') {
        const history = gemini.getChatHistory(userId);
        if (history.length === 0) {
          return message.reply(`📝 Belum ada riwayat percakapan. Mulai chat dengan \`${prefix}chat <pesan>\``);
        }
        
        const embed = new EmbedBuilder()
          .setColor(0x4285f4)
          .setTitle('📚 Riwayat Percakapan')
          .setDescription(`Total pesan: ${history.length}`)
          .setFooter({ text: `Gunakan ${prefix}chat clear untuk menghapus riwayat` })
          .setTimestamp();
          
        return message.reply({ embeds: [embed] });
      }
    }

    if (args.length === 0) {
      return message.reply(`❌ Silakan berikan pesan untuk chat.\n**Contoh:**\n\`${prefix}chat hello, how are you?\`\n\`${prefix}chat clear\` - Hapus riwayat\n\`${prefix}chat history\` - Lihat riwayat`);
    }

    const userMessage = args.join(' ');
    
    if (userMessage.length > 2000) {
      return message.reply('❌ Pesan terlalu panjang. Maksimal 2000 karakter.');
    }

    try {
      // Show typing indicator
      await message.channel.sendTyping();
      
      const response = await gemini.chatWithMemory(userId, userMessage);
      
      if (!response.success) {
        throw new Error(response.error || 'Chat failed');
      }
      
      // Split long responses
      const maxLength = 2000;
      const responseText = response.response;
      
      if (responseText.length <= maxLength) {
        const embed = new EmbedBuilder()
          .setColor(0x4285f4)
          .setTitle('💬 Chat AI')
          .addFields(
            { name: '👤 Anda', value: userMessage, inline: false },
            { name: '🤖 AI', value: responseText, inline: false }
          )
          .setFooter({ text: `Powered by Gemini AI • Gunakan ${prefix}chat clear untuk reset` })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        // Split long response
        const embed = new EmbedBuilder()
          .setColor(0x4285f4)
          .setTitle('💬 Chat AI')
          .addFields(
            { name: '👤 Anda', value: userMessage, inline: false }
          )
          .setFooter({ text: 'Powered by Gemini AI • Respons panjang, dikirim terpisah' })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
        
        // Send response in chunks
        const chunks = responseText.match(/.{1,1900}/g) || [];
        for (const chunk of chunks) {
          await message.channel.send(`🤖 **AI:** ${chunk}`);
        }
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Error Chat')
        .setDescription('Terjadi kesalahan saat chat. Silakan coba lagi.')
        .addFields(
          { name: '🔍 Detail Error', value: error.message, inline: false }
        )
        .setTimestamp();
      
      await message.reply({ embeds: [errorEmbed] });
    }
  },
}; 