const { Composer } = require('micro-bot');
const { Pool } = require('pg');

const bot = new Composer();

const dbURL = process.env.DATABASE_URL;

console.log(dbURL);
console.log(process.env.PGHOST);

bot.hears('test', (ctx) => {
    const pool = new Pool();
    pool.query('SELECT NOW()', (err, res) => {
        console.log(err, res);
        pool.end();
    });
    ctx.telegram.sendMessage(ctx.chat.id, 'Alive and logged');
});

module.exports = bot;
