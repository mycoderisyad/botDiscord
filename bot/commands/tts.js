const { createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const FreeTTS = require('../../services/freeTTS');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: {
    name: 'tts',
    description: 'Text-to-Speech gratis menggunakan Google Translate TTS',
  },
  async execute(message, args, client) {
    const prefix = process.env.PREFIX || '!';
    const uniqueId = Date.now() + Math.random();
    
    console.log(`🔍 TTS Command Execution #${uniqueId}`);
    console.log(`🔍 Args: [${args.join(', ')}]`);
    console.log(`🔍 Original message: "${message.content}"`);
    
    if (args.length === 0) {
      return message.reply(`❌ Silakan berikan teks yang ingin diubah menjadi suara.\n**Contoh:**\n\`${prefix}tts Halo, selamat pagi!\`\n\`${prefix}tts en Hello, good morning!\`\n\`${prefix}tts ja こんにちは\``);
    }

    let text = args.join(' ');
    let languageCode = 'id'; // default to Indonesian
    
    // Check if first argument is language code
    const langCodes = ['id', 'en', 'ja', 'ko', 'zh'];
    if (langCodes.includes(args[0].toLowerCase())) {
      languageCode = args[0].toLowerCase();
      text = args.slice(1).join(' ');
      
      console.log(`🔍 Manual language: ${languageCode}, text: "${text}"`);
      
      if (!text || text.length === 0) {
        return message.reply('❌ Silakan berikan teks setelah kode bahasa.');
      }
    } else {
      // Auto-detect language if no language code provided
      languageCode = detectLanguage(text);
      console.log(`🔍 Auto-detected language: ${languageCode}, text: "${text}"`);
    }
    
    if (text.length > 200) {
      return message.reply('❌ Teks terlalu panjang untuk TTS. Maksimal 200 karakter untuk TTS gratis.');
    }

    // Check if bot is in voice channel
    const connection = client.voiceConnections.get(message.guild.id);
    if (!connection) {
      return message.reply(`❌ Bot harus berada di voice channel terlebih dahulu! Gunakan \`${prefix}join\` untuk masuk ke voice channel.`);
    }

    // Check if audio player is currently playing and stop it
    if (client.audioPlayer.state.status === AudioPlayerStatus.Playing) {
      client.audioPlayer.stop();
      console.log('🛑 Stopped current TTS to play new one');
    }

    const freeTTS = new FreeTTS();
    
    try {
      // Show typing indicator
      await message.channel.sendTyping();
      
      const statusMessage = await message.reply('🔄 Generating TTS audio...');
      
      // Generate TTS audio
      const result = await freeTTS.synthesizeSpeech(text, languageCode);
      
      if (!result.success) {
        throw new Error(result.error || 'TTS generation failed');
      }

      // Create audio resource
      const audioResource = createAudioResource(result.audioPath, {
        inputType: StreamType.Arbitrary,
      });

      // Clear any existing event listeners to prevent double handling
      client.audioPlayer.removeAllListeners(AudioPlayerStatus.Playing);
      client.audioPlayer.removeAllListeners(AudioPlayerStatus.Idle);
      client.audioPlayer.removeAllListeners(AudioPlayerStatus.Error);

      // Play the audio
      client.audioPlayer.play(audioResource);
      connection.subscribe(client.audioPlayer);

      // Get language info for display
      const langInfo = getLanguageInfo(languageCode);

      // Update status message with success
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`🔊 TTS Playing ${langInfo.flag}`)
        .setDescription(`**Text:** ${text}`)
        .addFields(
          { name: '🎵 Status', value: '▶️ Now Playing', inline: true },
          { name: '🌍 Language', value: result.language || langInfo.name, inline: true },
          { name: '🎙️ Provider', value: result.provider, inline: true }
        )
        .setFooter({ text: `Free TTS • File: ${result.filename}${result.note ? ' • ' + result.note : ''}` })
        .setTimestamp();

      await statusMessage.edit({ content: '', embeds: [embed] });

      // Set up fresh event handlers for this specific TTS request
      const onPlaying = () => {
        console.log(`🎵 TTS started playing: "${text}" (${languageCode})`);
      };

      const onIdle = () => {
        console.log(`✅ TTS finished playing: "${text}"`);
        
        // Clean up temp file after playing
        setTimeout(() => {
          if (fs.existsSync(result.audioPath)) {
            fs.unlinkSync(result.audioPath);
            console.log(`🗑️ Cleaned up TTS file: ${result.filename}`);
          }
        }, 2000);
        
        // Auto cleanup old files
        freeTTS.cleanupTempFiles();

        // Remove this specific event listener after use
        client.audioPlayer.removeListener(AudioPlayerStatus.Playing, onPlaying);
        client.audioPlayer.removeListener(AudioPlayerStatus.Idle, onIdle);
        client.audioPlayer.removeListener(AudioPlayerStatus.Error, onError);
      };

      const onError = (error) => {
        console.error('Audio player error:', error);
        // Clean up temp file on error
        if (fs.existsSync(result.audioPath)) {
          fs.unlinkSync(result.audioPath);
        }
        
        // Remove event listeners on error
        client.audioPlayer.removeListener(AudioPlayerStatus.Playing, onPlaying);
        client.audioPlayer.removeListener(AudioPlayerStatus.Idle, onIdle);
        client.audioPlayer.removeListener(AudioPlayerStatus.Error, onError);
      };

      // Add event listeners
      client.audioPlayer.once(AudioPlayerStatus.Playing, onPlaying);
      client.audioPlayer.once(AudioPlayerStatus.Idle, onIdle);
      client.audioPlayer.once(AudioPlayerStatus.Error, onError);
      
    } catch (error) {
      console.error('TTS error:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ TTS Error')
        .setDescription('Gagal membuat atau memutar TTS audio.')
        .addFields(
          { name: '🔍 Error', value: error.message, inline: false }
        )
        .setFooter({ text: 'Pastikan koneksi internet stabil untuk Google Translate TTS' })
        .setTimestamp();
      
      await message.reply({ embeds: [errorEmbed] });
    }
  },
};

// Helper functions
function getLanguageInfo(langCode) {
  const langInfo = {
    'id': { name: 'Indonesian', flag: '🇮🇩' },
    'en': { name: 'English', flag: '🇺🇸' },
    'ja': { name: 'Japanese', flag: '🇯🇵' },
    'ko': { name: 'Korean', flag: '🇰🇷' },
    'zh': { name: 'Chinese', flag: '🇨🇳' }
  };
  return langInfo[langCode] || langInfo['id'];
}

// Simple language detection based on character ranges
function detectLanguage(text) {
  // Korean: Hangul characters
  if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text)) {
    return 'ko';
  }
  
  // Japanese: Hiragana, Katakana, Kanji
  if (/[ひらがなカタカナ一-龯]/.test(text) || /[ぁ-ゟァ-ヿ]/.test(text)) {
    return 'ja';
  }
  
  // Chinese: Chinese characters
  if (/[\u4e00-\u9fff]/.test(text)) {
    return 'zh';
  }
  
  // English: mostly latin characters
  if (/^[a-zA-Z0-9\s.,!?'"()-]+$/.test(text)) {
    return 'en';
  }
  
  // Default to Indonesian
  return 'id';
} 