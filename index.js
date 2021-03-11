const { Composer } = require('micro-bot');

const bot = new Composer();

const dbURL = process.env.DATABASE_URL;

bot.hears('test', (ctx) => {
    const pool = new Pool();
    pool.query('SELECT NOW()', (err, res) => {
        console.log(err, res);
        pool.end();
    });
    console.log(dbURL);
    ctx.telegram.sendMessage(ctx.chat.id, 'Alive and logged');
});

module.exports = bot;
