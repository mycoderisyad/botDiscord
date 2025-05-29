require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
});

// Command collection
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Command loaded: ${command.data.name}`);
    } else {
      console.log(`⚠️ Command ${file} is missing required 'data' or 'execute' property`);
    }
  }
}

// Voice connections storage
client.voiceConnections = new Collection();
client.audioPlayer = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});

// Store processed messages to prevent duplicates
const processedMessages = new Set();

client.once('ready', () => {
  console.log(`✅ Bot is ready as ${client.user.tag}`);
  console.log(`🎯 Loaded ${client.commands.size} commands`);
  console.log(`📡 Serving ${client.guilds.cache.size} guilds`);
  
  // Clean processed messages every 5 minutes
  setInterval(() => {
    processedMessages.clear();
    console.log('🧹 Cleared processed messages cache');
  }, 300000);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Check for duplicate message processing
  const messageKey = `${message.id}-${message.author.id}`;
  if (processedMessages.has(messageKey)) {
    console.log(`⚠️ Duplicate message detected: ${messageKey}`);
    return;
  }
  processedMessages.add(messageKey);

  const prefix = process.env.PREFIX || '!';
  const content = message.content.trim();

  console.log(`📨 Processing message: "${content}" from ${message.author.tag} (ID: ${message.id})`);

  // Handle old ping command for backward compatibility
  if (content === '#ping') {
    message.reply('🏓 Pong!');
    return;
  }

  // Handle new prefix commands
  if (!content.startsWith(prefix)) return;

  const args = content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) {
    message.reply(`❌ Command \`${prefix}${commandName}\` tidak ditemukan. Gunakan \`${prefix}help\` untuk melihat daftar command.`);
    return;
  }

  try {
    console.log(`🚀 Executing command: ${commandName} with args: [${args.join(', ')}]`);
    await command.execute(message, args, client);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    message.reply('❌ Terjadi error saat menjalankan command.');
  }
});

// Error handling
client.on('error', console.error);
client.on('warn', console.warn);

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_TOKEN);
