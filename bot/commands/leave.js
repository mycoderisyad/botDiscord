module.exports = {
  data: {
    name: 'leave',
    description: 'Bot keluar dari voice channel',
  },
  async execute(message, args, client) {
    const connection = client.voiceConnections.get(message.guild.id);
    
    if (!connection) {
      return message.reply('❌ Bot tidak sedang berada di voice channel!');
    }

    try {
      // Destroy the connection
      connection.destroy();
      
      // Remove from storage
      client.voiceConnections.delete(message.guild.id);
      
      await message.reply('✅ Bot berhasil keluar dari voice channel! 👋');
      
    } catch (error) {
      console.error('Leave voice channel error:', error);
      await message.reply('❌ Gagal keluar dari voice channel. Silakan coba lagi.');
    }
  },
}; 