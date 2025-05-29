const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

module.exports = {
  data: {
    name: 'join',
    description: 'Bot masuk ke voice channel user',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    
    // Check if user is in a voice channel
    const voiceChannel = message.member?.voice?.channel;
    
    if (!voiceChannel) {
      return message.reply('❌ Anda harus berada di voice channel terlebih dahulu!');
    }

    // Check if bot is already in a voice channel
    const existingConnection = client.voiceConnections.get(message.guild.id);
    if (existingConnection && existingConnection.state.status !== VoiceConnectionStatus.Destroyed) {
      // Check if bot is in the same channel
      const botChannel = message.guild.members.me?.voice?.channel;
      if (botChannel && botChannel.id === voiceChannel.id) {
        return message.reply(`✅ Bot sudah berada di voice channel **${voiceChannel.name}**! 🎤\nGunakan \`${prefix}tts <teks>\` untuk text-to-speech.`);
      } else if (botChannel) {
        return message.reply(`❌ Bot sudah berada di voice channel **${botChannel.name}**! Gunakan \`${prefix}leave\` terlebih dahulu untuk pindah channel.`);
      }
    }

    // Check permissions
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.reply('❌ Bot tidak memiliki permission untuk connect atau speak di voice channel ini!');
    }

    try {
      // Create voice connection with shorter timeout
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      // Store connection immediately
      client.voiceConnections.set(message.guild.id, connection);

      // Wait for connection to be ready with shorter timeout to prevent AbortError
      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
      } catch (timeoutError) {
        console.log('Connection timeout, but continuing anyway...');
        // Sometimes connection works even if ready state times out
      }

      await message.reply(`✅ Bot berhasil masuk ke voice channel **${voiceChannel.name}**! 🎤\nGunakan \`${prefix}tts <teks>\` untuk text-to-speech atau \`${prefix}voicechat start\` untuk voice chat dengan AI.`);

      // Handle connection events
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch (error) {
          connection.destroy();
          client.voiceConnections.delete(message.guild.id);
          console.log('Voice connection lost and cleaned up');
        }
      });

    } catch (error) {
      console.error('Join voice channel error:', error);
      
      // Clean up failed connection
      client.voiceConnections.delete(message.guild.id);
      
      await message.reply('❌ Gagal masuk ke voice channel. Silakan coba lagi.');
    }
  },
}; 