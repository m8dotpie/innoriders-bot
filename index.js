const { Composer } = require('micro-bot');

const bot = new Composer();

bot.hears('test', () => console.log(process.env.DATABASE_URL));
