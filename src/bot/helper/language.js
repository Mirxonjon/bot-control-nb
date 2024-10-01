const groups = require("../../model/groups")
const Teachers = require("../../model/teachers")
const { bot } = require("../bot")
const { adminKeyboardUZ, adminKeyboardRu, userKeyboardUz, userKeyboardRU, listGroupsInArray } = require("../menu/keyboard")

const changeLanguage = async (msg) => {
    const chatId = msg.from.id
    let teacher = await Teachers.findOne({chatId}).lean()

    teacher.action = 'choose_new_language'

    await Teachers.findByIdAndUpdate(teacher._id,teacher,{new:true})

    bot.sendMessage(
        chatId,
         teacher.language == 'uz' ? `🇷🇺/🇺🇿 Tilni o‘zgartirish` :  `Выберите язык 🇷🇺/🇺🇿`,
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

const chooseNewLanguage = async(msg) => {
    const chatId = msg.from.id
    const text = msg.text

    let teacher = await Teachers.findOne({chatId}).lean()
        console.log(text ,`🇷🇺  Русский` == text  );
    if(`🇺🇿 O‘zbekcha` == text || `🇷🇺  Русский` == text ) {
        teacher.language = text  == `🇺🇿 O‘zbekcha` ? 'uz' : 'ru' 
        teacher.action = 'menu'
        
        await Teachers.findByIdAndUpdate(teacher._id,teacher,{new:true})
        const findGroupsOfTeacher = await groups.find({teacher: teacher._id}).lean() 
        const keyboardGroups = await listGroupsInArray(findGroupsOfTeacher)
        bot.sendMessage(chatId, teacher.language == 'uz' ? `Menyuni tanlang` : `Выберите меню`,{
            reply_markup: {
                keyboard:[
                    ...keyboardGroups,
                    [
                     {
                         text: teacher.language == 'uz' ? `🇷🇺/🇺🇿 Tilni o‘zgartirish` : `🇷🇺/🇺🇿 Сменить язык`,
                     }
                    ]
                  ],
                resize_keyboard: true
            },
        })
    } else {
        bot.sendMessage(
            chatId,
            teacher.language == 'uz' ? `🇷🇺/🇺🇿 Tilni o‘zgartirish` :  `Выберите язык 🇷🇺/🇺🇿`,
            {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: `🇺🇿 O'zbekcha` ,
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
    changeLanguage,
    chooseNewLanguage
}