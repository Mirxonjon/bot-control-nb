const AttendanceRecords = require("../../model/attendanceRecords")
const AttendanceRecordsAdmin = require("../../model/attendanceRecordsAdmin")
const Groups = require("../../model/groups")
const Students = require("../../model/students")
const Teacher = require("../../model/teachers")
const { writeToSheet, readSheets } = require("../../utils/google_cloud")
const { formatDate } = require("../../utils/time")
const { bot } = require("../bot")
const { adminKeyboardUZ, adminKeyboardRu, userKeyboardUz, userKeyboardRU, listTeachersInArray, listGroupsInArray } = require("../menu/keyboard")


const confirmationLesson = async (msg) => {
    const chatId = msg.from.id 
    const text = msg.text
    // const splitText = text.split(' - ')
    const findTeacher = await Teacher.findOne({chatId}).lean()
    const textHtml = `<b> ${text} </b>
    Вы уверены, что хотите подтвердить урок?
    `
    let resultMessage =  await  bot.sendMessage( chatId, textHtml,
        {
           parse_mode :'HTML',
           reply_markup: {
             remove_keyboard: true,
             inline_keyboard : [
               [
                   {
                       text: '✅',
                       callback_data : `confirmL_true_${text}`
                        
                   },
                   {
                       text: '❌' ,
                       callback_data : `confirmL_false_${text}`
                   }
               ]
           ],
           },
         });
}
const findStudentsInGroup = async (query) => {
    console.log('okkk');
    console.log(query, 'log');
    const { data } = query
    const chatId = query.from.id 
    const text = data
    const messageId = query.message.message_id
    const queryAnswer = text.split('_')
    const splitText = queryAnswer[2].split(' - ')

    const findTeacher = await Teacher.findOne({chatId}).lean()
    // await Teacher.findByIdAndUpdate(findTeacher._id,{action: 'attendance_record'},{new:true})
    if(queryAnswer[1]){
        const findGroup = await Groups.findOne({level: splitText[0], days: splitText[1], time: splitText[2] , room: splitText[3], teacher: findTeacher._id}).lean()
        const findStudents = await Students.find({group: findGroup?._id}).lean()
        const startLesson = new Date()
        await bot.deleteMessage(chatId, +messageId)
         for(let e of findStudents) {
          let   textHtml = `<b>👤 ${e?.full_name}</b> - <b>${e.age}</b>
 📞 <i>${e?.number}</i> | <i>${e?.number_second}</i>
 ${e?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${e?.type}</b>  🗓<i>${e?.attemt_day}</i>
             `
              await  bot.sendMessage( chatId, textHtml,
                              {
                                 parse_mode :'HTML',
                                 reply_markup: {
                                   remove_keyboard: true,
                                   inline_keyboard : [
                                     [
                                         {
                                             text: '✅',
                                             callback_data : `att_attend_${e._id}_${findGroup._id}`
                                              
                                         },
                                         {
                                             text: '🥶',
                                             callback_data :`att_frozen_${e._id}_${findGroup._id}`
                                              
                                         },
     
                                         {
                                             text: '❌' ,
                                             callback_data : `att_absent_${e._id}_${findGroup._id}`
                                         },
                                         
                                             
                                         {
                                             text: '🕔' ,
                                             callback_data :`att_late_${e._id}_${findGroup._id}`
                                         
                                         }
                                     ]
                                 ],
                                 },
                               });
         }
         await Teacher.findByIdAndUpdate(findTeacher._id,{action: `attendance_record&${findGroup?._id}`,startLesson: startLesson},{new:true})
     
     
        await bot.sendMessage(chatId , `Yakunlash uchun "Yuborish" Tugmasini bosing` , {
             reply_markup: {
                 keyboard: [
                     [
                         {
                             text: 'Yuborish'
                         }
                     ]
                 ] ,
                 resize_keyboard: true
             }
         })

    } else {
        findTeacher.action = 'menu'

        await Teacher.findByIdAndUpdate(findTeacher._id,findTeacher,{new:true})

        const findGroupsOfTeacher = await Groups.find({teacher: findTeacher._id}).lean() 
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
    }
 
   
    // console.log(findStudents.length);
}

const addAttendance = async (query) => {
    const { data } = query
    const chatId = query.from.id
    const message_id = query.message.message_id
    console.log(message_id);
    const splitData = data.split('_')
    const typeTeacher = splitData[1]
    const studentId = splitData[2]
    const groupId = splitData[3]
    // const teacherId = splitData[4]
    const findTeacher = await Teacher.findOne({chatId}).lean()
    const findStudent = await Students.findOne({_id: studentId}).lean()
    const findGroup = await Groups.findOne({_id: groupId}).lean()
    const findAttendance = await AttendanceRecords.findOne({student: studentId, teacher: findTeacher._id, group: groupId}).populate('teacher').lean()
    console.log('okkk');

    if(findAttendance) {
  
        if(typeTeacher == 'absent') {
        await AttendanceRecords.findByIdAndUpdate(findAttendance._id,{typeTeacher : typeTeacher,updateAt : new Date()},{new:true})
            let   textHtml = `<b>👤 ${findStudent?.full_name}</b> - <b>${findStudent?.age}</b>
📞 <i>${findStudent?.number}</i> | <i>${findStudent?.number_second}</i>
${findStudent?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${findStudent?.type}</b>  🗓<i>${findStudent?.attemt_day}</i>
                        `
                 await   bot.editMessageText( textHtml , {
                        chat_id: chatId,
                        message_id,
                        parse_mode :'HTML',
                        reply_markup: {
                          inline_keyboard : [
                            [
                                {
                                    text: '❌' ,
                                    callback_data : `absent`
                                },
                            ]
                        ],
                        },
                      });
                  
        }  if(typeTeacher == 'late') {
        await AttendanceRecords.findByIdAndUpdate(findAttendance._id,{typeTeacher : typeTeacher,updateAt : new Date()},{new:true})

            let   textHtml = `<b>👤 ${findStudent?.full_name}</b> - <b>${findStudent?.age}</b>
📞 <i>${findStudent?.number}</i> | <i>${findStudent?.number_second}</i>
${findStudent?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${findStudent?.type}</b>  🗓<i>${findStudent?.attemt_day}</i>
                                `
            bot.editMessageText( textHtml , {
                        chat_id: chatId,
                        message_id,
                        parse_mode :'HTML',
                        reply_markup: {
                          inline_keyboard : [
                            [
                                {
                                    text: '🕔' ,
                                    callback_data :`late`
                                }
                            ]
                        ],
                        },
                      });
                  
                }
    }else {
        let newAttendance =new AttendanceRecords({ 
            typeTeacher: typeTeacher,
            student: studentId,
            group: groupId,
            teacher: findTeacher._id,
            messageId: message_id,
            createdAt: new Date(),
        
        })
        const result = await newAttendance.save()
        if(typeTeacher == 'attend') {
            let   textHtml = `<b>👤 ${findStudent?.full_name}</b> - <b>${findStudent?.age}</b>
📞 <i>${findStudent?.number}</i> | <i>${findStudent?.number_second}</i>
${findStudent?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${findStudent?.type}</b>  🗓<i>${findStudent?.attemt_day}</i>
                    `
                    bot.editMessageText( textHtml , {
                        chat_id: chatId,
                        message_id,
                        parse_mode :'HTML',
                        reply_markup: {
                          inline_keyboard : [
                            [
                                {
                                    text: '✅',
                                    callback_data : `attend`

                                },
                            ]
                        ],
                        },
                      });
                  
        } else  if(typeTeacher == 'frozen') {
            let   textHtml = `<b>👤 ${findStudent?.full_name}</b> - <b>${findStudent.age}</b>
📞 <i>${findStudent?.number}</i> | <i>${findStudent?.number_second}</i>
${findStudent?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${findStudent?.type}</b>  🗓<i>${findStudent?.attemt_day}</i>
                    `
                    bot.editMessageText( textHtml , {
                        chat_id: chatId,
                        message_id,
                        parse_mode :'HTML',
                        reply_markup: {
                          inline_keyboard : [
                            [
                                {
                                    text: '🥶',
                                    callback_data : `frozen`
                                },
                            ]
                        ],
                        },
                      });
                  
        } else  if(typeTeacher == 'absent') {
            const findAdmin = await Teacher.findOne({admin: 'true'}).lean()
            console.log(findAdmin, 'find admin');
            let   textHtml = `<b>👤 ${findStudent?.full_name}</b> - <b>${findStudent.age}</b>
📞 <i>${findStudent?.number}</i> | <i>${findStudent?.number_second}</i>
${findStudent?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${findStudent?.type}</b>  🗓<i>${findStudent?.attemt_day}</i>
                    `
            let   textHtmlForAdmin = `<b>👤 ${findTeacher?.full_name}</b>
<b>${findGroup.level} - ${findGroup.days} - ${findGroup.time} - ${findGroup.room}</b>
<b>👤 ${findStudent?.full_name}</b> - <b>${findStudent.age}</b>
📞 <i>${findStudent?.number}</i> | <i>${findStudent?.number_second}</i>
${findStudent?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${findStudent?.type}</b>  🗓<i>${findStudent?.attemt_day}</i>
                                `
                  await  bot.editMessageText( textHtml , {
                        chat_id: chatId,
                        message_id,
                        parse_mode :'HTML',
                        reply_markup: {
                          inline_keyboard : [
                            [
                                {
                                    text: '❌' ,
                                    callback_data : `att_absent_${findStudent._id}_${findGroup._id}`
                                },
                                {
                                    text: '🕔' ,
                                    callback_data :`att_late_${findStudent._id}_${findGroup._id}`
                                
                                }
                            ]
                        ],
                        },
                      });
                      if(findAdmin?.chatId) {
                        let   newAttendanceRecordsAdmin = new AttendanceRecordsAdmin({
                            student: studentId,
                            group: groupId,
                            teacher: findTeacher._id,
                            createdAt: new Date(),
                           })
    
                         let resultAdmin =  await newAttendanceRecordsAdmin.save()
                      let resultSendMessageAdmin =  await  bot.sendMessage( findAdmin?.chatId, textHtmlForAdmin,
                        {
                           parse_mode :'HTML',
                           reply_markup: {
                             remove_keyboard: true,
                             inline_keyboard : [
                               [
                                   {
                                       text: '✅',
                                       callback_data : `attAdmin_Answered_${resultAdmin._id}`
                                        
                                   },
                                   {
                                        text: '❌' ,
                                        callback_data :`attAdmin_Didn'tPickup_${resultAdmin._id}`
                                        
                                   },
                                   {
                                    text: '📵' ,
                                    callback_data :`attAdmin_Didn'tCall_${resultAdmin._id}`
                                   },
                                   
                               ]
                           ],
                           },
                         });
                        }

                  
        } 
        if(typeTeacher == 'late') {
            let   textHtml =  `<b>👤 ${findStudent?.full_name}</b> - <b>${findStudent.age}</b>
📞 <i>${findStudent?.number}</i> | <i>${findStudent?.number_second}</i>
${findStudent?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${findStudent?.type}</b>  🗓<i>${findStudent?.attemt_day}</i>`
            bot.editMessageText( textHtml , {
                        chat_id: chatId,
                        message_id,
                        parse_mode :'HTML',
                        reply_markup: {
                          inline_keyboard : [
                            [
                                {
                                    text: '🕔' ,
                                    callback_data :`late`
                                }
                            ]
                        ],
                        },
                      });
                    }
    }
}
const addAttendanceAdmin = async(query) => {
    const { data } = query
    const chatId = query.from.id
    const message_id = query.message.message_id
    console.log(message_id);
    const splitData = data.split('_')
    let typeAdmin = splitData[1]
    const attentRecordAdminId = splitData[2]
    const findAdmin = await Teacher.findOne({chatId}).lean()

    const findAttendanceAdmin = await AttendanceRecordsAdmin.findOne({_id: attentRecordAdminId}).populate('teacher').populate('group').populate('student').lean()
    console.log('okkk');
if(findAttendanceAdmin){
   
    if(typeAdmin == 'Answered') {
        let   textHtmlForAdmin = `<b>👤 ${findAttendanceAdmin.teacher?.full_name}</b>
<b>${findAttendanceAdmin?.group.level} - ${findAttendanceAdmin?.group.days} - ${findAttendanceAdmin?.group.time} - ${findAttendanceAdmin?.group.room}</b>
<b>👤 ${findAttendanceAdmin?.student?.full_name}</b> - <b>${findAttendanceAdmin?.student?.age}</b>
📞 <i>${findAttendanceAdmin?.student?.number}</i> | <i>${findAttendanceAdmin?.student?.number_second}</i>
${findAttendanceAdmin?.student?.type == 'ACTIVE' ?'🟩':'🟥'}<b>${findAttendanceAdmin?.student?.type}</b>  🗓<i>${findAttendanceAdmin?.student?.attemt_day}</i>
        `
        // await bot.deleteMessage(chatId, message_id)
        bot.editMessageText( textHtmlForAdmin , {
            chat_id: chatId,
            message_id,
            parse_mode :'HTML',
            reply_markup: {
              inline_keyboard : [
                [
                    {
                        text: '✅',
                        callback_data : `attAdmin_Answered_${findAttendanceAdmin._id}`
                        
                    },
                ]
            ],
            },
          });
          await bot.sendMessage(chatId , `Sababini yozing : ` , {
            reply_markup: {
           remove_keyboard: true,
            }
        })
        findAdmin.action = `write_reason&${findAttendanceAdmin._id}`
      await  AttendanceRecordsAdmin.findByIdAndUpdate(findAttendanceAdmin._id,{messageId: message_id},{new:true})
       await Teacher.findByIdAndUpdate(findAdmin._id,findAdmin,{new:true})
    } else if(typeAdmin == 'Didn\'tPickup') {
        // typeAdmin = 'Didn\'t Pick up'

        await bot.deleteMessage(chatId, message_id)

const sheetReadAttendanceRecordsAdmin = await readSheets('attendanceRecordsAdmin','A:A')
console.log(sheetReadAttendanceRecordsAdmin);
const  writeRow= sheetReadAttendanceRecordsAdmin ? `A${sheetReadAttendanceRecordsAdmin?.length + 1}` : 'A1'
let dataToExcel = [
    [  findAttendanceAdmin.group.level,
        findAttendanceAdmin.group.room,
        findAttendanceAdmin.group.time,
        findAttendanceAdmin.group.days,
        findAttendanceAdmin.teacher.full_name,
        findAttendanceAdmin.student.full_name,
        findAttendanceAdmin.student.age,
        findAttendanceAdmin.student.number,
        findAttendanceAdmin.student.number_second,
        findAttendanceAdmin.student.attemt_day,
        findAttendanceAdmin.student.type,
        formatDate(findAttendanceAdmin.createdAt),
        formatDate(new Date()),
        `Didn't Pick up`]
]
await writeToSheet('attendanceRecordsAdmin' , writeRow, dataToExcel)
    await AttendanceRecordsAdmin.findByIdAndDelete(findAttendanceAdmin._id)
} else if(typeAdmin == 'Didn\'tCall') {
    //  typeAdmin == `Didn't  Call`

     await bot.deleteMessage(chatId, message_id)
     const sheetReadAttendanceRecordsAdmin = await readSheets('attendanceRecordsAdmin','A:A')
     console.log(sheetReadAttendanceRecordsAdmin);
     const  writeRow= sheetReadAttendanceRecordsAdmin ? `A${sheetReadAttendanceRecordsAdmin?.length + 1}` : 'A1'
     let dataToExcel = [
         [  findAttendanceAdmin.group.level,
             findAttendanceAdmin.group.room,
             findAttendanceAdmin.group.time,
             findAttendanceAdmin.group.days,
             findAttendanceAdmin.teacher.full_name,
             findAttendanceAdmin.student.full_name,
             findAttendanceAdmin.student.age,
             findAttendanceAdmin.student.number,
             findAttendanceAdmin.student.number_second,
             findAttendanceAdmin.student.attemt_day,
             findAttendanceAdmin.student.type,
             formatDate(findAttendanceAdmin.createdAt),
             formatDate(new Date()),
             `Didn't  Call`]
     ]
     await writeToSheet('attendanceRecordsAdmin' , writeRow, dataToExcel)
         await AttendanceRecordsAdmin.findByIdAndDelete(findAttendanceAdmin._id)


}

}
}

const  sendExcelAttendanceRecords = async(msg) => {
    const chatId = msg.from.id
    const endLesson = new Date()
    const findTeacher = await Teacher.findOne({chatId}).lean()
    const groupId = findTeacher.action.split('&')[1]
    const findGroup = await Groups.findOne({_id: groupId}).lean()
    const findAttendances = await AttendanceRecords.find({teacher: findTeacher._id, group: groupId}).populate('teacher').populate('group').populate('student').lean()
    console.log(findAttendances, 'Attendence');
    const sheetReadAttendanceRecords = await readSheets('attendanceRecords','A:A')
    console.log(sheetReadAttendanceRecords);
    const  writeRow= sheetReadAttendanceRecords ? `A${sheetReadAttendanceRecords?.length + 1}` : 'A1'
    let data = []
    for(let e of findAttendances) {
        data.push([
            e.group.level,
            e.group.room,
            e.group.time,
            e.group.days,
            e.teacher.full_name,
            e.student.full_name,
            e.student.age,
            e.student.number,
            e.student.number_second,
            e.student.attemt_day,
            e.student.type,
            formatDate(e.createdAt),
            formatDate(e.updateAt),
            e.typeTeacher,
            formatDate(findTeacher.startLesson),
            formatDate(endLesson),
        ])
        if(+e.messageId) {
            await bot.deleteMessage(chatId, +e.messageId)
        }
        await AttendanceRecords.findByIdAndDelete(e._id)
    }

    await writeToSheet('attendanceRecords' , writeRow, data)
}

const writeMessage = async(msg) => {
    const chatId = msg.from.id
    const text = msg.text
    const findTeacherAdmin = await Teacher.findOne({chatId}).lean() 
    const idAttendanceRecordAdmin = findTeacherAdmin.action.split('&')[1]
    let message_id = msg.message_id

    const findAttendanceAdmin = await AttendanceRecordsAdmin.findOne({_id: idAttendanceRecordAdmin}).populate('teacher').populate('group').populate('student').lean()



const sheetReadAttendanceRecordsAdmin = await readSheets('attendanceRecordsAdmin','A:A')
console.log(sheetReadAttendanceRecordsAdmin);
const  writeRow= sheetReadAttendanceRecordsAdmin ? `A${sheetReadAttendanceRecordsAdmin?.length + 1}` : 'A1'
let dataToExcel = [
    [  findAttendanceAdmin.group.level,
        findAttendanceAdmin.group.room,
        findAttendanceAdmin.group.time,
        findAttendanceAdmin.group.days,
        findAttendanceAdmin.teacher.full_name,
        findAttendanceAdmin.student.full_name,
        findAttendanceAdmin.student.age,
        findAttendanceAdmin.student.number,
        findAttendanceAdmin.student.number_second,
        findAttendanceAdmin.student.attemt_day,
        findAttendanceAdmin.student.type,
        formatDate(findAttendanceAdmin.createdAt),
        formatDate(new Date()),
        `Answered`,
        text
    ]
]
await writeToSheet('attendanceRecordsAdmin' , writeRow, dataToExcel)
await bot.deleteMessage(chatId, +findAttendanceAdmin.messageId)
await bot.deleteMessage(chatId, message_id)
await bot.deleteMessage(chatId, --message_id)
    await AttendanceRecordsAdmin.findByIdAndDelete(findAttendanceAdmin._id)
    Teacher.findByIdAndUpdate(findTeacherAdmin._id,{action: 'menu'},{new:true})
}   


module.exports = {
    confirmationLesson,
    findStudentsInGroup,
    addAttendance,
    sendExcelAttendanceRecords,
    addAttendanceAdmin,
    writeMessage
}