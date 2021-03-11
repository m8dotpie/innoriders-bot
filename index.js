const { Composer, Stage, Scene, session } = require('micro-bot')

// Greeter scene
const greeter = new Scene('greeter')
greeter.enter((ctx) => ctx.reply('Hi'))
greeter.leave((ctx) => ctx.reply('Buy'))
greeter.hears(/hi/gi, (ctx) => ctx.scene.leave())
greeter.on('message', (ctx) => ctx.reply('Send `hi`'))

const stage = new Stage()
stage.register(greeter)

const bot = new Composer()
bot.use(session())
bot.use(stage)
bot.command('greeter', (ctx) => ctx.scene.enter('greeter'))
bot.command('cancel', (ctx) => ctx.scene.leave())
module.exports = bot
