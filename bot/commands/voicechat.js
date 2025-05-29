const { EmbedBuilder } = require('discord.js');
const { 
  joinVoiceChannel, 
  VoiceConnectionStatus, 
  entersState, 
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require('@discordjs/voice');
const GeminiAI = require('../../services/gemini');
const GoogleCloudSpeech = require('../../services/googleCloudSpeech');
const fs = require('fs');
const path = require('path');

// Voice chat sessions storage
const voiceChatSessions = new Map();

module.exports = {
  data: {
    name: 'voicechat',
    description: 'Percakapan suara dengan AI menggunakan Google Cloud Speech & Gemini AI',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    
    if (args.length === 0) {
      return message.reply(`❌ Gunakan sub-command.\n**Contoh:**\n\`${prefix}voicechat start\` - Mulai voice chat\n\`${prefix}voicechat stop\` - Stop voice chat\n\`${prefix}voicechat status\` - Cek status`);
    }

    const subCommand = args[0]?.toLowerCase();
    const userId = message.author.id;
    const guildId = message.guild.id;
    
    if (!subCommand) {
      return message.reply('❌ Sub-command tidak valid. Gunakan: `start`, `stop`, atau `status`');
    }

    switch (subCommand) {
      case 'start':
        return await startVoiceChat(message, client);
      case 'stop':
        return await stopVoiceChat(message, client);
      case 'status':
        return await voiceChatStatus(message, client);
      default:
        return message.reply('❌ Sub-command tidak valid. Gunakan: `start`, `stop`, atau `status`');
    }
  },
};

async function startVoiceChat(message, client) {
  const prefix = process.env.PREFIX || '!';
  const userId = message.author.id;
  const guildId = message.guild.id;
  
  // Check if user is in voice channel
  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) {
    return message.reply('❌ Anda harus berada di voice channel terlebih dahulu!');
  }

  // Check if already in voice chat session
  const existingSession = voiceChatSessions.get(userId);
  if (existingSession && existingSession.isActive) {
    return message.reply(`❌ Anda sudah memiliki voice chat session yang aktif. Gunakan \`${prefix}voicechat stop\` terlebih dahulu.`);
  }

  try {
    await message.channel.sendTyping();

    // Initialize services
    const gemini = new GeminiAI();
    const gcSpeech = new GoogleCloudSpeech();
    
    // Check if bot is already connected to voice
    let connection = client.voiceConnections.get(guildId);
    
    if (!connection) {
      // Join voice channel
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guildId,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      // Store connection
      client.voiceConnections.set(guildId, connection);
      
      // Wait for connection to be ready
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    }

    // Create session data
    const sessionData = {
      userId: userId,
      guildId: guildId,
      channelId: message.channel.id,
      voiceChannelId: voiceChannel.id,
      connection: connection,
      gemini: gemini,
      gcSpeech: gcSpeech,
      isListening: false,
      audioPlayer: createAudioPlayer()
    };

    // Store session
    voiceChatSessions.set(userId, sessionData);

    // Subscribe to audio player
    connection.subscribe(sessionData.audioPlayer);

    const embed = new EmbedBuilder()
      .setColor(0x34a853)
      .setTitle('🎤 Voice Chat Dimulai')
      .setDescription('Voice chat dengan AI telah dimulai!')
      .addFields(
        { name: '🎯 Channel', value: voiceChannel.name, inline: true },
        { name: '🤖 AI', value: 'Gemini AI', inline: true },
        { name: '🎙️ Speech', value: 'Google Cloud Speech', inline: true },
        { name: '🌍 Language', value: 'Auto Detect', inline: true },
        { name: '📝 Instruksi', value: `• Mulai bicara di voice channel\n• Bot akan mendengarkan dan merespon\n• Gunakan \`${prefix}voicechat stop\` untuk berhenti`, inline: false }
      )
      .setFooter({ text: 'Voice chat aktif • Powered by Gemini AI & Google Cloud Speech' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    // Start listening for audio (placeholder for now)
    sessionData.isListening = true;
    console.log('Voice chat session started for user:', userId);

  } catch (error) {
    console.error('Start voice chat error:', error);
    
    // Cleanup on error
    voiceChatSessions.delete(userId);
    
    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Error Voice Chat')
      .setDescription('Gagal memulai voice chat.')
      .addFields(
        { name: '🔍 Detail Error', value: error.message, inline: false }
      )
      .setTimestamp();
    
    await message.reply({ embeds: [errorEmbed] });
  }
}

async function stopVoiceChat(message, client) {
  const prefix = process.env.PREFIX || '!';
  const userId = message.author.id;
  const sessionData = voiceChatSessions.get(userId);
  
  if (!sessionData) {
    return message.reply('❌ Anda tidak memiliki voice chat session yang aktif.');
  }

  try {
    // Stop audio player
    if (sessionData.audioPlayer) {
      sessionData.audioPlayer.stop();
    }

    // Clear chat session with AI
    sessionData.gemini.clearChatHistory(userId);
    
    // Remove session
    voiceChatSessions.delete(userId);

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle('🛑 Voice Chat Dihentikan')
      .setDescription('Voice chat dengan AI telah dihentikan.')
      .addFields(
        { name: '💡 Info', value: 'Riwayat percakapan telah dihapus.\nBot tetap terhubung ke voice channel.', inline: false }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Stop voice chat error:', error);
    await message.reply('❌ Error saat menghentikan voice chat.');
  }
}

async function voiceChatStatus(message, client) {
  const prefix = process.env.PREFIX || '!';
  const userId = message.author.id;
  const sessionData = voiceChatSessions.get(userId);
  
  const embed = new EmbedBuilder()
    .setColor(sessionData ? 0x34a853 : 0x6c757d)
    .setTitle('📊 Status Voice Chat')
    .setTimestamp();

  if (sessionData) {
    const voiceChannel = client.channels.cache.get(sessionData.voiceChannelId);
    embed.setDescription('✅ Voice chat aktif')
      .addFields(
        { name: '🎯 Voice Channel', value: voiceChannel?.name || 'Unknown', inline: true },
        { name: '🎤 Status', value: sessionData.isListening ? '🟢 Listening' : '🟡 Standby', inline: true },
        { name: '🤖 AI Model', value: 'Gemini AI', inline: true }
      );
  } else {
    embed.setDescription('❌ Tidak ada voice chat yang aktif')
      .addFields(
        { name: '📊 Status', value: 'Tidak ada session aktif', inline: true },
        { name: '💡 Cara Memulai', value: `Gunakan \`${prefix}voicechat start\` di voice channel`, inline: false }
      );
  }

  await message.reply({ embeds: [embed] });
}

// Export the sessions map for access from other modules
module.exports.voiceChatSessions = voiceChatSessions; 