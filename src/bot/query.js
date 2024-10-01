const { bot } = require("./bot");
const { addAttendance, addAttendanceAdmin, findStudentsInGroup } = require("./helper/group");

bot.on('callback_query', async (query) => {

    const chatId = query.from.id 

    const { data } = query;
    const findTeacher = await Teacher.findOne({chatId}).lean()
    // let id = data.split('-');
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

    console.log(callbackName[0], callbackName[0] == 'confirmL');
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

        if(callbackName[0] == 'confirmL') {
        //   console.log(callbackName);
          await findStudentsInGroup(query)
        //   console.log(callbackName[1]);

        }
        // if(callbackName[0] == 'appliaction'){
        //     answerApplication(query)
        // }
        // if(callbackName[0] == 'applicationChat') {
        //     ApplicationChat(query)
        // }
        // if(callbackName[0] == 'positive') {
        //     positiveAnswers(query)
        // }
        // if(callbackName[0] == 'rejected') {
        //     rejectedAnswers(query)
        // }
        // if(callbackName[0] == 'answerAll') {
        //     allAnswers(query)
        // }
          
                

    }).catch(e => {
        console.log(e);
    })
})