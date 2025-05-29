const voicechatCommand = require('./voicechat.js');

module.exports = {
  data: {
    name: 'vc',
    description: 'Alias untuk command voicechat',
  },
  async execute(message, args, client) {
    return await voicechatCommand.execute(message, args, client);
  },
}; 