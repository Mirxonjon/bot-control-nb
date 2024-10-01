const Teachers = require('../model/teachers')
const {bot} = require('./bot')
const { findStudentsInGroup, sendExcelAttendanceRecords, confirmationLesson, writeMessage } = require('./helper/group')
// const { getAlltime, addApplication, addDayOffFirst, addDayOffSecond, addComment, sentApplication, showApplication, SentMessagetoUser, addSupervazer } = require('./helper/application')
const { chooseNewLanguage, changeLanguage } = require('./helper/language')
const { start, chooseLanguage , logout, chooseTeacher, confirmPassword } = require('./helper/start')

bot.on('message' ,  async msg => {
    const chatId = msg.from.id
    const text = msg.text


    const teacher = await  Teachers.findOne({chatId}).lean() 
    const findNotAccess = Teachers.findOne({chatIdNotAccess: chatId}).lean()
    console.log(teacher);
    if(text == '/start' || text == 'Menyu' || text == 'Меню' ){
        start(msg)
    }
    const Teacherfind = await  Teachers.findOne({full_name: text}).lean() 
    if(Teacherfind) {
        chooseTeacher( msg)
    }
    
    if(text == '/logout' ){
        logout(msg)
    }

    if(findNotAccess){
        if(teacher?.action == 'confirm_password' ){
            confirmPassword(msg)
        }
    }



    if(teacher && text != '/start' && text != '/logout') {

        if(teacher?.action?.split('&')[0] == 'attendance_record' ) {
            sendExcelAttendanceRecords(msg)
        }
        if(teacher?.action?.split('&')[0] == 'write_reason') {
            writeMessage(msg)
            // findStudentsInGroup(msg)
        }


        if(teacher.action == 'menu' && text != '/start'  && text != '🇷🇺/🇺🇿 Tilni o‘zgartirish' && text != '🇷🇺/🇺🇿 Сменить язык'   ) {
    // if(text != '/start' || text != 'Menyu' || text != 'Меню' ){
        // confirmationLesson(msg)
    // }
            // findStudentsInGroup(msg)
        }

        if(teacher.action == 'choose_new_language') {
            chooseNewLanguage(msg)
        }
        
        if(text == `🇷🇺/🇺🇿 Tilni o‘zgartirish` || text == `🇷🇺/🇺🇿 Сменить язык`) {
            changeLanguage(msg)
        }
      

    }
})