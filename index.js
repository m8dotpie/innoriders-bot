const { Composer } = require('micro-bot');
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

console.log(`DROP TABLES ${curTable}`);
client.query(`DROP TABLES ${curTable}`, (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log(res);
    }
})

client.query(`CREATE TABLE IF NOT EXISTS ${curTable} (user integer, addingTraining bool, proofsIDs integer[10], nextProof integer)`, (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log(res);
    }
});

bot.start((ctx) => {
    client.query(`INSERT INTO ${curTable} (user, addingTraining, nextProof) VALUES (${ctx.from.id}, false, 0)`, (err, res) => {
        if (err) {
            console.log(err);
        } else {
            console.log(res);
        }
    });
});

module.exports = bot;
