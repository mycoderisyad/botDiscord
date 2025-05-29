const translateCommand = require('./translate.js');

module.exports = {
  data: {
    name: 'tr',
    description: 'Alias untuk command translate',
  },
  async execute(message, args, client) {
    return await translateCommand.execute(message, args, client);
  },
}; 