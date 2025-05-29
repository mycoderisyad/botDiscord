# 🤖 PoligotBot - Bot Discord Latihan Bahasa Multibahasa

Bot Discord untuk latihan bahasa dengan fitur percakapan real-time, terjemahan multibahasa, dan voice chat AI menggunakan **Gemini AI** dan **Google Cloud Speech**.

## 🎯 Fitur Utama

- **🌍 Translator Multibahasa** - Terjemahan akurat dengan Gemini AI ke 5 bahasa (ID, EN, JA, KO, ZH)
- **💬 Percakapan Real-time** - Chat dengan AI yang memiliki memory per user
- **📚 Mode Pembelajaran** - Feedback grammar dan vocabulary dengan analisis mendalam
- **🎤 Voice Chat AI** - Percakapan suara real-time dengan AI menggunakan Google Cloud Speech
- **🗣️ Text-to-Speech AI** - Konversi teks ke suara menggunakan Gemini AI (phonetic analysis)
- **🌐 Pengaturan Bahasa** - Preferensi bahasa per user untuk pengalaman personal

## 🏗️ Arsitektur Sistem

```
[Discord User (Text/Voice Input)]
           ↓
[Discord Bot (Node.js + discord.js v14)]
           ↓
┌─────────────────────────────────────────┐
│          Core Services                  │
├─────────────────────────────────────────┤
│  • Gemini AI (Chat, Translation,       │
│    Grammar Check, Learning, TTS)       │
│  • Google Cloud Speech-to-Text         │
│  • @discordjs/voice (Voice Handling)   │
└─────────────────────────────────────────┘
           ↓
[Discord Response (Text/Audio/Embed)]
```

## 📦 Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Discord Bot | discord.js v14, Node.js |
| AI Language Processing | Google Gemini AI (gemini-1.5-flash) |
| Translation | Google Gemini AI |
| Text-to-Speech | Google Gemini AI (phonetic analysis) |
| Speech-to-Text | Google Cloud Speech-to-Text |
| Voice Handling | @discordjs/voice, prism-media, ffmpeg |

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v16 atau lebih tinggi)
2. **Discord Bot Token** - [Discord Developer Portal](https://discord.com/developers/applications)
3. **Google Gemini AI API Key** - [Google AI Studio](https://makersuite.google.com/app/apikey)
4. **Google Cloud Project** dengan Speech API enabled - [Google Cloud Console](https://console.cloud.google.com)
5. **Google Cloud Service Account Key** (JSON file)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd poligot-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
# Copy the example file and configure
cp .env.example.txt .env
# Edit .env file dengan konfigurasi Anda
```

4. **Configure .env file**
```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here

# Bot Command Prefix (dapat diubah sesuai keinginan)
# Contoh: !, >, $, &, atau karakter lain
PREFIX=>

# Gemini AI Configuration  
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud Speech Configuration
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_KEY_FILE=./google-cloud-key.json
```

**💡 Note:** Prefix bisa diubah sesuai keinginan di `.env`. Semua contoh command di bawah menggunakan `!` tapi sesuaikan dengan PREFIX yang Anda set.

5. **Setup Google Cloud**
   - Buat project di Google Cloud Console
   - Enable Speech-to-Text API
   - Buat Service Account dan download JSON key
   - Simpan JSON key sebagai `google-cloud-key.json` di root folder

6. **Run the bot**
```bash
npm start
# atau untuk development
npm run dev
```

## 🎮 Commands

### 💬 Percakapan Real-time
- `!chat <pesan>` - Percakapan dengan AI (ada memory)
- `!chat clear` - Hapus riwayat percakapan
- `!chat history` - Lihat riwayat percakapan

### 🌍 Translator Multibahasa
- `!translate <teks>` - Terjemahan otomatis
- `!translate <kode> <teks>` - Terjemahan ke bahasa tertentu
- `!tr` - Alias untuk translate

### 📚 Pembelajaran Bahasa
- `!belajar <teks>` - Feedback pembelajaran multibahasa
- `!grammar <teks>` - Grammar check multibahasa
- `!learn` - Alias untuk belajar

### 🌐 Pengaturan Bahasa
- `!language` - Lihat/ubah bahasa preferensi
- `!language <kode>` - Set bahasa (id, en, ja, ko, zh)
- `!lang` - Alias untuk language

### 🎤 Voice Chat AI
- `!voicechat start` - Mulai percakapan suara dengan AI
- `!voicechat stop` - Stop voice chat
- `!voicechat status` - Status voice session
- `!vc` - Alias untuk voicechat

### 🎵 Voice & TTS
- `!join` - Bot masuk voice channel
- `!leave` - Bot keluar voice channel
- `!tts <teks>` - Text-to-speech dengan Gemini AI

### 🛠️ Utilitas
- `!ping` - Cek status dan latency
- `!help` - Panduan lengkap

## 🌍 Bahasa yang Didukung

| Kode | Bahasa | Flag | Google Cloud Code |
|------|--------|------|-------------------|
| `id` | Indonesian | 🇮🇩 | `id-ID` |
| `en` | English | 🇺🇸 | `en-US` |
| `ja` | Japanese | 🇯🇵 | `ja-JP` |
| `ko` | Korean | 🇰🇷 | `ko-KR` |
| `zh` | Chinese | 🇨🇳 | `zh-CN` |

## 💡 Contoh Penggunaan

```bash
# Ubah bahasa preferensi ke Jepang
!language ja

# Chat dalam bahasa Jepang
!chat こんにちは！元気ですか？

# Mulai voice chat AI
!voicechat start

# Terjemahan Korea ke Inggris
!translate en 안녕하세요

# Belajar bahasa Mandarin
!belajar 我想学习中文

# Grammar check
!grammar I are happy

# TTS dengan Gemini AI
!tts ja こんにちは、今日はいい天気ですね
```

## 🛠️ Development

### Project Structure

```
poligot-bot/
├─ bot/
│  ├─ index.js              # Main bot entry point
│  └─ commands/             # Command implementations
│     ├─ help.js            # Help command
│     ├─ ping.js            # Ping command
│     ├─ chat.js            # Chat with memory
│     ├─ translate.js       # Translation (tr alias)
│     ├─ belajar.js         # Learning mode (learn alias)
│     ├─ grammar.js         # Grammar check
│     ├─ language.js        # Language settings (lang alias)
│     ├─ voicechat.js       # Voice chat AI (vc alias)
│     ├─ join.js            # Join voice
│     ├─ leave.js           # Leave voice
│     └─ tts.js             # Text-to-speech with Gemini AI
├─ services/
│  ├─ gemini.js             # Gemini AI service
│  └─ googleCloudSpeech.js  # Google Cloud Speech service
├─ temp/                    # Temporary audio files
├─ package.json
├─ .env.example.txt         # Environment template
├─ .gitignore
└─ README.md
```

### Adding New Commands

1. Create new file in `bot/commands/`
2. Follow this template:

```javascript
const { EmbedBuilder } = require('discord.js');
const GeminiAI = require('../../services/gemini');

module.exports = {
  data: {
    name: 'commandname',
    description: 'Command description',
  },
  async execute(message, args, client) {
    const gemini = new GeminiAI();
    
    try {
      // Command logic here
      const response = await gemini.generateText(prompt);
      
      const embed = new EmbedBuilder()
        .setColor(0x4285f4)
        .setTitle('Command Title')
        .setDescription(response.content)
        .setFooter({ text: 'Powered by Gemini AI' });
        
      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Command error:', error);
      await message.reply('❌ Terjadi error.');
    }
  },
};
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_TOKEN` | Discord bot token | ✅ |
| `PREFIX` | Command prefix (default: !) | ✅ |
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud project ID | ✅ |
| `GOOGLE_CLOUD_KEY_FILE` | Path to service account JSON | ✅ |

### Google Cloud Setup

1. Create a new project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the following APIs:
   - Cloud Speech-to-Text API
3. Create a service account:
   - Go to IAM & Admin > Service Accounts
   - Create new service account
   - Grant roles: Speech Admin, Cloud Speech Client
   - Download JSON key file
4. Place the JSON file in project root as `google-cloud-key.json`

## 🚀 Features

### 🎯 Smart Translation
- Auto-detect source language
- Context-aware translation
- Support for 5 major languages
- Confidence scoring

### 🧠 AI Learning Assistant
- Grammar correction with explanations
- Vocabulary suggestions
- Alternative expressions
- Natural conversation practice

### 🎤 Voice Chat AI
- Real-time speech recognition
- AI conversation with voice
- Speech-to-text processing
- Session management

### 🗣️ Intelligent TTS
- Phonetic analysis with Gemini AI
- Multi-language support
- Context-aware speech generation
- Audio simulation

### 💾 Memory System
- Per-user chat history
- Context retention
- Conversation continuity
- History management

## 📈 Performance

- **Response Time**: < 2 seconds for text commands
- **Voice Latency**: < 3 seconds for voice processing
- **Concurrent Users**: Supports multiple users simultaneously
- **Memory Usage**: Optimized for long-running instances

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API library
- [Google Gemini AI](https://ai.google.dev/) - AI language model
- [Google Cloud Speech](https://cloud.google.com/speech-to-text) - Speech services

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Check [Issues](https://github.com/your-repo/issues) untuk masalah yang sudah diketahui
2. Buat issue baru dengan detail lengkap
3. Sertakan log error dan konfigurasi (tanpa API keys)

---

**PoligotBot v3.0** - Powered by Gemini AI & Google Cloud Speech 🚀 