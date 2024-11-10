const Teacher = require("../model/teachers");
const { bot } = require("./bot");
const { addAttendance, addAttendanceAdmin, findStudentsInGroup, sentUnit } = require("./helper/groups");

bot.on('callback_query', async (query) => {

    const chatId = query.from.id 

    const { data } = query;
    const findTeacher = await Teacher.findOne({chatId}).lean()
    let callbackName = data.split('_');

let textAnswer = 'Send'
    
    if(callbackName[0] == 'confirmL') {
    if(callbackName[1] == 'true') {
        textAnswer = findTeacher.language == 'uz' ? 'Siz tasdiqladingiz' :'Вы подтвердили'
    } else {
        textAnswer = findTeacher.language == 'uz' ? 'Siz rad etdingiz' :'Вы отказались'
    }
    }
    if(callbackName[0] == 'att'){
        if(callbackName[1] == 'absent') {
            textAnswer = findTeacher.language == 'uz' ? 'Siz ❌ ni bosdingiz' :'Вы нажали ❌'
        } else if(callbackName[1] == 'attend') {
            textAnswer = findTeacher.language == 'uz' ? 'Siz ✅ ni bosdingiz' :'Вы нажали ✅'
        }else if(callbackName[1] == 'frozen') {
            textAnswer = findTeacher.language == 'uz' ? 'Siz 🥶 ni bosdingiz' :'Вы нажали 🥶'
        }else if(callbackName[1] == 'late') {
            textAnswer = findTeacher.language == 'uz' ? 'Siz 🕔 ni bosdingiz' :'Вы нажали 🕔'
        }
    }

    bot.answerCallbackQuery(query.id , {
        text : textAnswer,
        show_alert : false,
        cache_time :0.5
    }).then(async () => {
        if(callbackName[0] == 'att'){
            addAttendance(query)
        }
        if(callbackName[0] == 'attAdmin'){
            addAttendanceAdmin(query)
        }
        if(callbackName[0] == 'unit'){
            sentUnit(query)
        }

        if(callbackName[0] == 'confirmL') {
          await findStudentsInGroup(query)

        }
    }).catch(e => {
        console.log(e);
    })
})