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

client.query('CREATE TABLE IF NOT EXISTS proofData (addingTraining bool, proofsIDs integer[10])');

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
    if (err) throw err;
    for (let row of res.rows) {
        console.log(JSON.stringify(row));
    }
    client.end();
});

module.exports = bot;
