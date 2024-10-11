const Groups = require("../../model/groups");
const { formatTime } = require("../../utils/time");

const sendNotification = async() => {
    // const findTeachers = await Teacher.find({}).lean()
    const findGroups = await Groups.find({}).populate('teacher').lean()
    console.log(findGroups,findGroups.length , 'FindGroups');
    const FormatTime = formatTime(new Date())
    for(let e of findGroups) {
        console.log(e.time, FormatTime, e.time == FormatTime );
        // console.log();

        if(e.time == FormatTime) {
            const text = e.teacher.language == 'uz' ?  `🤩Darsni boshlash vaqti keldi ! 
✏️${e?.level} - ${e?.days} - ${e?.time} - ${e?.room} 
` : `🤩Пришло время начать урок ! 
✏️${e?.level} - ${e?.days} - ${e?.time} - ${e?.room} 
`
            bot.sendMessage(e.teacher.chatId, text )
        }
    }
}

// text

// [
//     {
//         text: '✅',
//         callback_data : `confirmL_true_${text}`
         
//     },
//     {
//         text: '❌' ,
//         callback_data : `confirmL_false_${text}`
//     }
// ]
module.exports = {
    
    sendNotification
}