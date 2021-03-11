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

client.query('DROP TABLE proofData');

// client.query('CREATE TABLE IF NOT EXISTS proofData (addingTraining bool, proofsIDs integer[10], nextProof integer)', (err, res) => {
//     if (err) {
//         throw err;
//     }
//     console.log(res);
// });

client.end();

module.exports = bot;
