const Groups = require("../../model/groups")
const Teacher = require("../../model/teachers")
const { bot } = require("../bot")
const { adminKeyboardUZ, adminKeyboardRu, userKeyboardUz, userKeyboardRU, listTeachersInArray, listGroupsInArray } = require("../menu/keyboard")

const  start = async( msg ) => {
    const chatId = msg.from.id
const findTeacher = await Teacher.findOne({chatId: chatId})
console.log(findTeacher);
    if(findTeacher){
        findTeacher.action = 'menu'

        await Teacher.findByIdAndUpdate(findTeacher._id,findTeacher,{new:true})

        const findGroupsOfTeacher = await Groups.find({teacher: findTeacher._id}).lean() 
       const keyboardGroups = await listGroupsInArray(findGroupsOfTeacher)
         return    bot.sendMessage(chatId , `Menyuni tanlang` ,
        {      reply_markup : {
            
            keyboard :[
                       ...keyboardGroups,
                       [
                        {
                            text: `Tilni o'zgartirish`,
                        }
                       ]
                     ],
            resize_keyboard: true
        }})
    } else {
        let  teachers =  await Teacher.find().lean()

        let keyboardTeachers =await listTeachersInArray(teachers)
    
    
        bot.sendMessage(
            chatId,
            `Здравствуйте ${msg.from.first_name} ,  добро пожаловать в наш бот. Выберите язык 🇷🇺/🇺🇿`,
            {
                reply_markup: {
                    keyboard: 
                      keyboardTeachers
                    ,
                    resize_keyboard: true
                }
            })
    
    }



}
const logout = async (msg) => {
    const chatId = msg.from.id
    let teacher = await Teacher.findOne({chatId}).lean()

    try {
        // await User.deleteOne({chatId})
        if(teacher){
            await Teacher.findByIdAndUpdate(teacher._id,{chatId: null})
            bot.sendMessage(chatId ,  'Botdan butunlay chiqib kettingiz, qayta faollashtirish uchun /start ni bosing.' ,{
                reply_markup:{
                    remove_keyboard:true
                }
            })
        }else {
            bot.sendMessage(chatId ,  'Siz ro\'yhatdan otmagansiz. ' ,{
                reply_markup:{
                    remove_keyboard:true
                }
            })
        }

        // let  teachers =  await Teacher.find().lean()

        // let keyboardTeachers =await listTeachersInArray(teachers)
    
    
        // bot.sendMessage(
        //     chatId,
        //     `Здравствуйте ${msg.from.first_name} ,  добро пожаловать в наш бот. Выберите язык 🇷🇺/🇺🇿`,
        //     {
        //         reply_markup: {
        //             keyboard: 
        //               keyboardTeachers
        //             ,
        //             resize_keyboard: true
        //         }
        //     })
    } catch (error) {
        console.log(error);
    }

}

const  chooseTeacher = async ( msg) => {
    const chatId = msg.from.id
    const text =  msg.text
    let teacher = await Teacher.findOne({full_name: text}).lean()
    
    
    teacher.action = 'confirm_password'
    teacher.chatId = chatId
    await Teacher.findByIdAndUpdate(teacher._id,teacher,{new:true})
    bot.sendMessage(chatId , `${teacher.full_name} parolni kiriting` ,{      reply_markup : {
        keyboard :[
         [   {
                text : `O'qtuvchilar ro'yhati`,
            }]
        ],
        resize_keyboard :true
    }})

    
}

const confirmPassword = async (msg) => {
    const chatId = msg.from.id
    const text =  msg.text
    let teacher = await Teacher.findOne({chatId}).lean()

    if(teacher.password == text) {
        teacher.action = 'menu'

        await Teacher.findByIdAndUpdate(teacher._id,teacher,{new:true})

        const findGroupsOfTeacher = await Groups.find({teacher: teacher._id}).lean() 
       const keyboardGroups = await listGroupsInArray(findGroupsOfTeacher)
         bot.sendMessage(chatId , `Menyuni tanlang` ,
        {      reply_markup : {
            
            keyboard :[
                       ...keyboardGroups,
                       [
                        {
                            text: `Tilni o'zgartirish`,
                        }
                       ]
                     ],
            resize_keyboard: true
        }})
        
    }else if(`O'qtuvchilar ro'yhati` == text){
        let  teachers =  await Teacher.find().lean()
        console.log(teachers);
       let keyboardTeachers =await listTeachersInArray(teachers)

            teacher.chatId = null 
            await Teacher.findByIdAndUpdate(teacher._id,teacher,{new:true})
          return  bot.sendMessage(
                chatId,
                `Здравствуйте ${msg.from.first_name} ,  добро пожаловать в наш бот. Выберите язык 🇷🇺/🇺🇿`,
                {
                    reply_markup: {
                        keyboard: keyboardTeachers
                        ,
                        resize_keyboard: true
                    }
                })
    } else {
        bot.sendMessage(chatId , `Parol noto'gri qayta kiriting` ,
        {      reply_markup : {
            
            keyboard :[
                [  {
                    text : `O'qtuvchilar ro'yhati`,
                    
                }]
                
            ],
            resize_keyboard: true
        }})
    }

}



const  chooseLanguage = async (msg) => {
    const chatId = msg.from.id
    const text =  msg.text
    let user = await User.findOne({chatId}).lean()
    if(`🇺🇿 O‘zbekcha` == text || `🇷🇺  Русский` == text ) {
        user.language = text  == `🇺🇿 O‘zbekcha` ? 'uz' : 'ru' 
        user.action = 'add_idRMO'


        await User.findByIdAndUpdate(user._id,user,{new:true})
            bot.sendMessage(
                chatId,
                user.language == 'uz' ? `👤 Operator ID raqamingizni kiriting (Misol uchun: 123)` : `👤 Введите операторский ID номер (Например: 123)`,
                {
                    reply_markup : {
                        remove_keyboard : true
                    }
                })
    } else {
        bot.sendMessage(
            chatId,
            `Выберите язык 🇷🇺/🇺🇿`,
            {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: `🇺🇿 O‘zbekcha` ,
                            },
                            {
                                text: `🇷🇺  Русский` ,
                            },
                        ],
                    ],
                    resize_keyboard: true
                }
            })
    }
    }





module.exports = {
    start,
    logout,
    chooseTeacher,
    confirmPassword,
    chooseLanguage,
}