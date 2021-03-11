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

// client.query(`DROP TABLE ${curTable}`, (err, res) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(res);
//     }
// });

client.query(`CREATE TABLE IF NOT EXISTS ${curTable} (id integer, addingTraining bool, proofsIDs integer[10], nextProof integer)`, (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log(res);
    }
});

bot.start(async (ctx) => {
    console.log((await client.query(`SELECT * FROM ${curTable} WHERE id=${ctx.from.id}`)));
    // client.query(`INSERT INTO ${curTable} (id, addingTraining, nextProof) VALUES (${ctx.from.id}, false, 0)`, (err, res) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(res);
    //     }
    // });
});

module.exports = bot;
