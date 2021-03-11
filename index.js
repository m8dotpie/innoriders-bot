const { Composer } = require('micro-bot');

const bot = new Composer();

bot.hears('test', (ctx) => {
    console.log(process.env.DATABASE_URL);
    ctx.telegram.sendMessage(ctx.chat.id, 'Alive and logged');
});

module.export = bot;
