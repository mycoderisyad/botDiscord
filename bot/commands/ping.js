module.exports = {
  data: {
    name: 'ping',
    description: 'Cek latency bot',
  },
  async execute(message, args, client) {
    const sent = await message.reply('🏓 Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    
    await sent.edit(`🏓 Pong!\n⏱️ Latency: ${latency}ms\n📡 API Latency: ${apiLatency}ms`);
  },
}; 