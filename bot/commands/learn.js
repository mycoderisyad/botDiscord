const belajarCommand = require('./belajar.js');

module.exports = {
  data: {
    name: 'learn',
    description: 'Alias untuk command belajar',
  },
  async execute(message, args, client) {
    return await belajarCommand.execute(message, args, client);
  },
}; 