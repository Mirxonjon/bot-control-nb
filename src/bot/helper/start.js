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
                            text: findTeacher.language == 'uz' ? `Units` : `Units`,
                        }
                       ],
                       [
                        {
                            text: findTeacher.language == 'uz' ? `🇷🇺/🇺🇿 Tilni o‘zgartirish` : `🇷🇺/🇺🇿 Сменить язык`,
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
            `Assalomu aleykum ${msg.from.first_name} , Xodimni tanlang.`,
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
    
    
    teacher.actionNotAccess = 'confirm_password'
    teacher.chatIdNotAccess = chatId
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
    let teacher = await Teacher.findOne({chatIdNotAccess: chatId}).lean()
console.log(teacher, 'lllll');
    if(teacher.password == text) {
        teacher.action = 'menu'
        teacher.chatId = chatId,
        teacher.chatIdNotAccess = null,
        teacher.chatIdNotAccess = null


        await Teacher.findByIdAndUpdate(teacher._id,teacher,{new:true})

        const findGroupsOfTeacher = await Groups.find({teacher: teacher._id}).lean() 
       const keyboardGroups = await listGroupsInArray(findGroupsOfTeacher)
         bot.sendMessage(chatId ,teacher.language == 'uz' ?  `✅ Roʻyxatdan oʻtish muvaffaqiyatli yakunlandi!` : `✅ Ваща регистрация успешно завершена!` ,
        {      reply_markup : {
            
            keyboard :[
                       ...keyboardGroups,
                       [
                        {
                            text: findTeacher.language == 'uz' ? `Units` : `Units`,
                        }
                       ],
                       [
                        {
                            text: teacher.language == 'uz' ? `🇷🇺/🇺🇿 Tilni o‘zgartirish` : `🇷🇺/🇺🇿 Сменить язык`,
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
                ` Xodimni tanlang.`,
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








module.exports = {
    start,
    logout,
    chooseTeacher,
    confirmPassword,
}