const { Composer, Telegraf } = require('micro-bot');
const { Client } = require('pg');
const commandParts = require('telegraf-command-parts');

const bot = new Composer();

const curTable = 'testData';

const defaultMenu = Telegraf.Extra .markdown() .markup((m) => m.keyboard([['Add training'], ['About']]));
const adminMenu = Telegraf.Extra .markdown() .markup((m) => m.keyboard([['Add training'], ['Notify all members'], ['About']]));
const trainingMenu = Telegraf.Extra .markdown() .markup((m) => m.keyboard([['Finished with proofs'], ['Forget about this training']]));

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
        console.log('Successfully removed the table.');
    }
});

client.query(`CREATE TABLE IF NOT EXISTS ${curTable} (id integer, email text, addingTraining bool, proofsIDs integer[10], nextProof integer)`, (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Successfully created table (\"if not existed\")');
    }
});

async function userExists(ctx) {
    return (await client.query(`SELECT * FROM ${curTable} WHERE id=${ctx.from.id}`)).rows.length != 0;
}

bot.hears('Finished with proofs', async (ctx) => {
    if (!(await userExists(ctx))) {
        ctx.reply("I'm not sure I know who are you. Try registering with /start");
        return;
    }
    console.log('Successfully sent training');
    ctx.reply('Great, club admins will review you training soon!', defaultMenu);
});

bot.hears('Forget about this training', async (ctx) => {
    if (!(await userExists(ctx))) {
        ctx.reply("I'm not sure I know who are you. Try registering with /start");
        return;
    }
    console.log('Successfully removed training');
    let isAdmin = (process.env.ADMIN1ID == ctx.from.id || process.env.ADMIN2ID == ctx.from.id);
    ctx.reply('No problem, looking forward to hearing from you!', (isAdmin ? adminMenu : defaultMenu));
});

async function startTraining(ctx) {
    await client.query(`UPDATE ${curTable} SET addingTraining=true WHERE id=${ctx.from.id}`);
    ctx.reply('Waiting for proofs, bro!', trainingMenu);
}

bot.hears('Add training', async (ctx) => {
    if (!(await userExists(ctx))) {
        ctx.reply("I'm not sure I know who are you. Try registering with /start");
        return;
    }
    await startTraining(ctx);
});

bot.command('email', (ctx) => {
    console.log(ctx.message.text);
    console.log("Here the email:");
    console.log(ctx.message.text.match(/\/email\s\w+\.\w+\@innopolis\.(university|ru)/) + " of " + ctx.from.id);
});

bot.start(async (ctx) => {
    if ((await userExists(ctx))) {
        ctx.reply('You already in da club!');
    } else {
        await client.query(`INSERT INTO ${curTable} (id, addingTraining, nextProof) VALUES (${ctx.from.id}, false, 0)`, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Successfully inserted.');
            }
        });
        let isAdmin = (process.env.ADMIN1ID == ctx.from.id || process.env.ADMIN2ID == ctx.from.id);
        ctx.reply('Welcome to the club, mate!', (isAdmin ? adminMenu : defaultMenu));
    }
});

module.exports = bot;
