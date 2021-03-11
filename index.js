const { Composer, Telegraf } = require('micro-bot');
const { Client } = require('pg');

const bot = new Composer();

const curTable = 'testData';

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

client.query(`DROP TABLE ${curTable}`, (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully removed the table.");
    }
});

client.query(`CREATE TABLE IF NOT EXISTS ${curTable} (id integer, addingTraining bool, proofsIDs integer[10], nextProof integer)`, (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully created table (\"if not existed\")");
    }
});

bot.start(async (ctx) => {
    const testMenu = Telegraf.Extra
          .markdown()
          .markup((m) => m.inlineKeyboard([
              m.callbackButton('Test button', 'test')
          ]));
    if ((await client.query(`SELECT * FROM ${curTable} WHERE id=${ctx.from.id}`)).rows.length != 0) {
        ctx.reply("You already in da club!");
    } else {
        await client.query(`INSERT INTO ${curTable} (id, addingTraining, nextProof) VALUES (${ctx.from.id}, false, 0)`, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully inserted.");
            }
        });
        ctx.reply("Welcome to the club, mate!", testMenu);
    }
});

module.exports = bot;
