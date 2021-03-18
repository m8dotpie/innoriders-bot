const { Composer, Telegraf } = require('micro-bot');
const { Client } = require('pg');
const commandParts = require('telegraf-command-parts');

const bot = new Composer();

const curTable = 'testData';

const defaultMenu = Telegraf.Extra .markdown() .markup((m) => m.keyboard([['Add training'], ['About']]));
const adminMenu = Telegraf.Extra .markdown() .markup((m) => m.keyboard([['Add training'], ['Notify all members'], ['About']]));
const trainingMenu = Telegraf.Extra .markdown() .markup((m) => m.keyboard([['Finished with proofs'], ['Forget about this training']]));
const aboutMenu = Telegraf.Extra .markdown() .markup((m) => m.inlineKeyboard([[m.urlButton('Instagram', 'instagram.com/innoriders/')], [m.urlButton('Sources', 'github.com/m8dotpie/innoriders-bot')]]));

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

async function hasEmail(ctx) {
    return (await client.query(`SELECT email FROM ${curTable} WHERE id=${ctx.from.id}`)).rows[0].email != null;
}

bot.hears('Finished with proofs', async (ctx) => {
    if (!(await userExists(ctx))) {
        ctx.reply("I'm not sure I know who are you. Try registering with /start");
        return;
    }
    console.log('Successfully sent training');
    ctx.reply('Great, club admins will review you training soon!', (isAdmin ? adminMenu : defaultMenu));
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
    if (!(await hasEmail(ctx))) {
        ctx.reply("You have to provide your innopolis email first. Try /email [INNOMAIL]");
        return;
    }
    await startTraining(ctx);
});

bot.hears('About', (ctx) => {
    ctx.reply('Welcome to the riders club!\n'
              + 'This bot was designed to make life '
              + 'of innopolis riders much easier.\n'
              + '0. This bot is hosted with heroku, so sometimes '
              + 'it may take time to reply (up to a minute)\n'
              + '1. If you want to get sporthours for riding, '
              + 'then you should provide your innopolis email '
              + 'once and forever with /email [INNOMAIL] and '
              + 'follow instructions in \'Add training\' section.\n'
              + '2. Some of the material used for proofs, may be published '
              + 'to innoriders instagram to prove club activity.\n'
              + '3. It is recommended to subscribe and follow our '
              + 'Instgram.\n4. Moreover, this bot is completely '
              + 'open source, so you are free to star its respository :D '
              + '\(Contributions, fixes and anything is accepted as well\)', aboutMenu);
});

bot.hears('Notify all members', (ctx) => {
    let isAdmin = (process.env.ADMIN1ID == ctx.from.id || process.env.ADMIN2ID == ctx.from.id);
    if (!isAdmin) {
        return;
    }
    ctx.reply('Send your notification in the format /notify [INFO]');
});

bot.command('/notify', async (ctx) => {
    let isAdmin = (process.env.ADMIN1ID == ctx.from.id || process.env.ADMIN2ID == ctx.from.id);
    if (!isAdmin) {
        return;
    }
    let notification = ctx.message.text.match(/\/notify\s(.+)/)[1];
    let usersIds = (await client.query(`SELECT id FROM ${curTable}`));
    usersIds.ForEach((data) => {
        console.log(data.id);
    });
});

bot.command('email', async (ctx) => {
    if (!(await userExists(ctx))) {
        ctx.reply("I'm not sure I know who are you. Try registering with /start");
        return;
    }
    let str = ctx.message.text.match(/\/email\s(\w+\.\w+\@innopolis\.(university|ru))/);
    if (str == null) {
        ctx.reply("I\'m not sure you have provided correct credentials. Try again.");
    } else {
        let result = str[1];
        await client.query(`UPDATE ${curTable} SET email=${"\'" + result + "\'"} WHERE id=${ctx.from.id}`);
        ctx.reply('Great! I will remember that!');
    }
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
        ctx.reply('Welcome to the club, mate!' +
                  '\nConsider reading \"About\" section.', (isAdmin ? adminMenu : defaultMenu));
    }
});

module.exports = bot;
