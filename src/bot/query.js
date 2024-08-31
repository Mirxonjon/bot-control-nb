const { bot } = require("./bot");
const { addAttendance, addAttendanceAdmin, findStudentsInGroup } = require("./helper/group");

bot.on('callback_query', async (query) => {


    const { data } = query;

    // let id = data.split('-');
    let callbackName = data.split('_');

    console.log(callbackName[0], callbackName[0] == 'confirmL');
    bot.answerCallbackQuery(query.id , {
        text : 'Yuborildi',
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
          console.log(callbackName);
          await findStudentsInGroup(query)
          console.log(callbackName[1]);

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