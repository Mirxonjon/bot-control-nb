const TELEGRAM_BOT =  require('node-telegram-bot-api')

const bot = new TELEGRAM_BOT(process.env.TOKEN, {
    polling: true
})


bot.setMyCommands([
    { command: '/start', description: 'Botni boshlash' },
    { command: '/logout', description: 'Tizimdan chiqish' }
]);

module.exports = {
    bot
}


require('./message')
require('./query')