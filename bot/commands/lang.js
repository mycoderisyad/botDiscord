const languageCommand = require('./language.js');

module.exports = {
  data: {
    name: 'lang',
    description: 'Alias untuk command language',
  },
  async execute(message, args, client) {
    return await languageCommand.execute(message, args, client);
  },
}; 