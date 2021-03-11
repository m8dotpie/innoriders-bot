const { Composer } = require('micro-bot');
const { Client } = require('pg');

const bot = new Composer();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

client.query('SELECT * FROM pg_catalog.pg_tables;', (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log(res);
    }
});

// client.query('CREATE TABLE IF NOT EXISTS proofData (addingTraining bool, proofsIDs integer[10], nextProof integer)', (err, res) => {
//     if (err) {
//         throw err;
//     }
//     console.log(res);
// });

module.exports = bot;
