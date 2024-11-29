const AttendanceRecords = require("../../model/attendanceRecords");
const AttendanceRecordsAdmin = require("../../model/attendanceRecordsAdmin");
const Groups = require("../../model/groups");
const Students = require("../../model/students");
const Teacher = require("../../model/teachers");
const { bot } = require("../bot");
const { writeToSheet, readSheets } = require("../../utils/google_cloud");
const {
  formatDate,
  formatTime,
  getMinutTimes,
  ConvertionTimeMinut,
  minutToFormatTime,
} = require("../../utils/time");
const { listGroupsInArray, listGroups } = require("../menu/keyboard");

const confirmationLesson = async (msg) => {
  const chatId = msg?.from.id;
  const text = msg.text;
  const splitText = text.split(" - ");
  const findTeacher = await Teacher.findOne({ chatId }).lean();

  const findGroupsOfTeacher = await Groups.find({
    teacher: findTeacher._id,
  }).lean();
  const keyboardGroups = await listGroups(findGroupsOfTeacher);
  const textHtmluz = `Haqiqatdan ham ushbu guruhda darsni <b>boshlamoqchimisiz?🤩 </b>

<b> ${text} </b>
    `;
  const textHtmlru = `Вы уверены что хотите <b>начать урок?🤩</b>

<b> ${text} </b>
`;

  let findGroup = keyboardGroups.find((e) => e.text == text);
  if (findGroup) {
    await bot.sendMessage(
      chatId,
      findTeacher?.language == "uz" ? textHtmluz : textHtmlru,
      {
        parse_mode: "HTML",
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [
              {
                text: "✅",
                callback_data: `confirmL_true_${text}`,
              },
              {
                text: "❌",
                callback_data: `confirmL_false_${text}`,
              },
            ],
          ],
        },
      }
    );
  }
};

const groupUnits = async (msg) => {
  const chatId = msg?.from.id;
  const text = msg.text;
  const splitText = text.split(" - ");
  const findTeacher = await Teacher.findOne({ chatId }).lean();
  const groups = await Groups.find({ teacher: findTeacher._id }).lean();
  const AllTeacherGroups = await listGroups(groups);
  let texthtmlForUnitUZ = `<b>Guruhlaringizdagi unitlarni belgilang. 🙃</b>`;
  let texthtmlForUnitRU = `<b>Определите unit в своих группах. 🙃</b>`;
  await bot.sendMessage(
    chatId,
    findTeacher?.language == "uz" ? texthtmlForUnitUZ : texthtmlForUnitRU,
    { parse_mode: "HTML" }
  );
  for (let e of AllTeacherGroups) {
    const textHtmlru = `<b> ${e.text} </b>`;
    const textHtmluz = `<b> ${e.text} </b>`;
    await bot.sendMessage(
      chatId,
      findTeacher?.language == "uz" ? textHtmluz : textHtmlru,
      {
        parse_mode: "HTML",
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [
              {
                text: `1`,
                callback_data: `unit_1_${e.id}`,
              },
              {
                text: `2`,
                callback_data: `unit_2_${e.id}`,
              },
              {
                text: `3`,
                callback_data: `unit_3_${e.id}`,
              },
              {
                text: `4`,
                callback_data: `unit_4_${e.id}`,
              },
            ],
            [
              {
                text: `5`,
                callback_data: `unit_5_${e.id}`,
              },
              {
                text: `6`,
                callback_data: `unit_6_${e.id}`,
              },
              {
                text: `7`,
                callback_data: `unit_7_${e.id}`,
              },
              {
                text: `8`,
                callback_data: `unit_8_${e.id}`,
              },
            ],
            [
              {
                text: `9`,
                callback_data: `unit_9_${e.id}`,
              },
              {
                text: `10`,
                callback_data: `unit_10_${e.id}`,
              },
              {
                text: `11`,
                callback_data: `unit_11_${e.id}`,
              },
              {
                text: `12`,
                callback_data: `unit_12_${e.id}`,
              },
            ],
            [
              {
                text: `13`,
                callback_data: `unit_13_${e.id}`,
              },
              {
                text: `14`,
                callback_data: `unit_14_${e.id}`,
              },
            ],
          ],
        },
      }
    );
  }
};

const sentUnit = async (query) => {
  const { data } = query;
  const chatId = query.from.id;
  const text = data;
  const messageId = query.message.message_id;
  const queryAnswer = text.split("_");
  const splitText = queryAnswer[2];
  const unitNumber = queryAnswer[1];
  const textHtml = `<b>${query.message.text}</b>`;
  const sheetReadUnits = await readSheets("Units", "A:A");
  const writeRow = sheetReadUnits ? `A${sheetReadUnits?.length + 1}` : "A1";
  let dataToExcel = [[splitText, unitNumber, formatDate(new Date())]];
  await writeToSheet("Units", writeRow, dataToExcel);

  bot.editMessageText(textHtml, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `${unitNumber}`,
            callback_data: `not`,
          },
        ],
      ],
    },
  });

  // }
};

const findStudentsInGroup = async (query) => {
  const { data } = query;
  const chatId = query.from.id;
  const text = data;
  const messageId = query.message.message_id;
  const queryAnswer = text.split("_");
  const splitText = queryAnswer[2].split(" - ");

  const findTeacher = await Teacher.findOne({ chatId }).lean();
  // await Teacher.findByIdAndUpdate(findTeacher._id,{action: 'attendance_record'},{new:true})
  if (queryAnswer[1] == "true") {
    const findGroup = await Groups.findOne({
      level: splitText[0],
      days: splitText[1],
      time: splitText[2],
      room: splitText[3],
      teacher: findTeacher._id,
    }).lean();
    const findStudents = await Students.find({ group: findGroup?._id }).lean();
    const findAdmin = await Teacher.findOne({ admin: "true" }).lean();
    let textHtmlForAdmin = ``;
    let startLessonTimeMinut = await ConvertionTimeMinut(splitText[2]);
    let confirmLessonTimeMinut = await getMinutTimes();
    let confirmDateFormat = minutToFormatTime(confirmLessonTimeMinut);

    if (startLessonTimeMinut > confirmLessonTimeMinut) {
      textHtmlForAdmin = `<b>#OnTime</b>

🎓<b>${findTeacher.full_name}</b>
<b>${splitText}</b>

💼 <b>Dars soat</b> <b>${confirmDateFormat}</b> <b>boshlandi</b>
`;
    }
    if (startLessonTimeMinut < confirmLessonTimeMinut) {
      textHtmlForAdmin = `<b>#Late</b>

🎓<b>${findTeacher.full_name}</b>
<b>${queryAnswer[2]}</b>

💼 <b>Dars soat</b> <b>${confirmDateFormat}</b> <b>boshlandi</b>
`;
    }
    // console.log(textHtmlForAdmin);
    await bot.sendMessage(findAdmin.chatId, textHtmlForAdmin, {
      parse_mode: "HTML",
      reply_markup: {},
    });
    const startLesson = new Date();
    await bot.deleteMessage(chatId, +messageId);
    const statuses = {
      left: "⬜️ <b>LEFT</b>",
      attend: "🟦 <b>ATTEND</b>",
      active: "🟩 <b>ACTIVE</b>",
      debtor: "🟥 <b>DEBTOR</b>",
      frozen: "🥶 <b>FROZEN</b>",
    };
    for (let e of findStudents) {
      let textHtml = `<b>👤 ${e?.full_name}</b><b>${e?.age ? " -" : ""} ${
        e?.age
      }</b>
${statuses[e?.type?.toLowerCase()]}  ${e?.attemt_day ? "🗓" : ""} <i>${
        e?.attemt_day
      }</i>

${e?.number || e?.number_second ? "📞 " : ""}<i>${e?.number}</i> ${
        e?.number_second && e?.number ? "|" : ""
      } <i>${e?.number_second}</i>
`;

      await bot.sendMessage(chatId, textHtml, {
        parse_mode: "HTML",
        reply_markup: {
          remove_keyboard: true,
          inline_keyboard: [
            [
              {
                text: "✅",
                callback_data: `att_attend_${e._id}_${findGroup._id}`,
              },
              {
                text: "🥶",
                callback_data: `att_frozen_${e._id}_${findGroup._id}`,
              },

              {
                text: "❌",
                callback_data: `att_absent_${e._id}_${findGroup._id}`,
              },

              {
                text: "🕔",
                callback_data: `att_late_${e._id}_${findGroup._id}`,
              },
            ],
          ],
        },
      });
    }
    await Teacher.findByIdAndUpdate(
      findTeacher._id,
      {
        action: `attendance_record&${findGroup?._id}`,
        startLesson: startLesson,
      },
      { new: true }
    );

    await bot.sendMessage(
      chatId,
      findTeacher.language == "uz"
        ? `Darsni yakunlaganingizdan so'ng "Darsni Yakunlash" tugmasini bosing! 😴`
        : `Когда вы закончите урок, нажмите кнопку «Завершить урок»! 😴`,
      {
        reply_markup: {
          keyboard: [
            [
              {
                text:
                  findTeacher.language == "uz"
                    ? "Darsni Yakunlash"
                    : `Завершить урок`,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  } else {
    findTeacher.action = "menu";

    await Teacher.findByIdAndUpdate(findTeacher._id, findTeacher, {
      new: true,
    });

    const findGroupsOfTeacher = await Groups.find({
      teacher: findTeacher._id,
    }).lean();
    const keyboardGroups = await listGroupsInArray(findGroupsOfTeacher);
    bot.sendMessage(
      chatId,
      findTeacher.language == "uz" ? `Menyuni tanlang:` : `Выберите меню:`,
      {
        reply_markup: {
          keyboard: [
            ...keyboardGroups,
            [
              {
                text: findTeacher.language == "uz" ? `Units` : `Units`,
              },
            ],
            [
              {
                text: `Tilni o'zgartirish`,
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
    bot.deleteMessage(chatId, messageId);
  }
};

const addAttendance = async (query) => {
  const { data } = query;
  const chatId = query.from.id;
  const message_id = query.message.message_id;
  const splitData = data.split("_");
  const typeTeacher = splitData[1];
  const studentId = splitData[2];
  const groupId = splitData[3];
  const findTeacher = await Teacher.findOne({ chatId }).lean();
  const findStudent = await Students.findOne({ _id: studentId }).lean();
  const findGroup = await Groups.findOne({ _id: groupId }).lean();
  const findAttendance = await AttendanceRecords.findOne({
    student: studentId,
    teacher: findTeacher._id,
    group: groupId,
  })
    .populate("teacher")
    .lean();

  const statuses = {
    left: "⬜️ <b>LEFT</b>",
    attend: "🟦 <b>ATTEND</b>",
    active: "🟩 <b>ACTIVE</b>",
    debtor: "🟥 <b>DEBTOR</b>",
    frozen: "🥶 <b>FROZEN</b>",
  };
  if (findAttendance) {
    if (typeTeacher == "absent") {
      await AttendanceRecords.findByIdAndUpdate(
        findAttendance._id,
        { typeTeacher: typeTeacher, updateAt: new Date() },
        { new: true }
      );
      //       let textHtml = `<b>👤 ${findStudent?.full_name}</b> - <b>${
      //         findStudent?.age
      //       }</b>
      // 📞 <i>${findStudent?.number}</i> | <i>${findStudent?.number_second}</i>
      // ${findStudent?.type == "ACTIVE" ? "🟩" : "🟥"}<b>${
      //         findStudent?.type
      //       }</b>  🗓<i>${findStudent?.attemt_day}</i>
      //                         `;
      let textHtml = `<b>👤 ${findStudent?.full_name}</b><b>${
        findStudent?.age ? " -" : ""
      } ${findStudent?.age}</b>
${statuses[findStudent?.type?.toLowerCase()]}  ${
        findStudent?.attemt_day ? "🗓" : ""
      } <i>${findStudent?.attemt_day}</i>

${findStudent?.number || findStudent?.number_second ? "📞 " : ""}<i>${
        findStudent?.number
      }</i> ${
        findStudent?.number_second && findStudent?.number ? "|" : ""
      } <i>${findStudent?.number_second}</i>
`;
      console.log("absend");
      await bot.editMessageText(textHtml, {
        chat_id: chatId,
        message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "❌",
                callback_data: `absent`,
              },
            ],
          ],
        },
      });
    }
    if (typeTeacher == "late") {
      await AttendanceRecords.findByIdAndUpdate(
        findAttendance._id,
        { typeTeacher: typeTeacher, updateAt: new Date() },
        { new: true }
      );

      let textHtml = `<b>👤 ${findStudent?.full_name}</b><b>${
        findStudent?.age ? " -" : ""
      } ${findStudent?.age}</b>
${statuses[findStudent?.type?.toLowerCase()]}  ${
        findStudent?.attemt_day ? "🗓" : ""
      } <i>${findStudent?.attemt_day}</i>

${findStudent?.number || findStudent?.number_second ? "📞 " : ""}<i>${
        findStudent?.number
      }</i> ${
        findStudent?.number_second && findStudent?.number ? "|" : ""
      } <i>${findStudent?.number_second}</i>
`;
      bot.editMessageText(textHtml, {
        chat_id: chatId,
        message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🕔",
                callback_data: `late`,
              },
            ],
          ],
        },
      });
    }
  } else {
    let newAttendance = new AttendanceRecords({
      typeTeacher: typeTeacher,
      student: studentId,
      group: groupId,
      teacher: findTeacher._id,
      messageId: message_id,
      createdAt: new Date(),
    });
    const result = await newAttendance.save();
    if (typeTeacher == "attend") {
      let textHtml = `<b>👤 ${findStudent?.full_name}</b><b>${
        findStudent?.age ? " -" : ""
      } ${findStudent?.age}</b>
${statuses[findStudent?.type?.toLowerCase()]}  ${
        findStudent?.attemt_day ? "🗓" : ""
      } <i>${findStudent?.attemt_day}</i>

${findStudent?.number || findStudent?.number_second ? "📞 " : ""}<i>${
        findStudent?.number
      }</i> ${
        findStudent?.number_second && findStudent?.number ? "|" : ""
      } <i>${findStudent?.number_second}</i>
`;
      bot.editMessageText(textHtml, {
        chat_id: chatId,
        message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅",
                callback_data: `attend`,
              },
            ],
          ],
        },
      });
    } else if (typeTeacher == "frozen") {
      let textHtml = `<b>👤 ${findStudent?.full_name}</b><b>${
        findStudent?.age ? " -" : ""
      } ${findStudent?.age}</b>
${statuses[findStudent?.type?.toLowerCase()]}  ${
        findStudent?.attemt_day ? "🗓" : ""
      } <i>${findStudent?.attemt_day}</i>

${findStudent?.number || findStudent?.number_second ? "📞 " : ""}<i>${
        findStudent?.number
      }</i> ${
        findStudent?.number_second && findStudent?.number ? "|" : ""
      } <i>${findStudent?.number_second}</i>
`;
      bot.editMessageText(textHtml, {
        chat_id: chatId,
        message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🥶",
                callback_data: `frozen`,
              },
            ],
          ],
        },
      });
    } else if (typeTeacher == "absent") {
      const findAdmin = await Teacher.findOne({ admin: "true" }).lean();
      let textHtml = `<b>👤 ${findStudent?.full_name}</b><b>${
        findStudent?.age ? " -" : ""
      } ${findStudent?.age}</b>
${statuses[findStudent?.type?.toLowerCase()]}  ${
        findStudent?.attemt_day ? "🗓" : ""
      } <i>${findStudent?.attemt_day}</i>

${findStudent?.number || findStudent?.number_second ? "📞 " : ""}<i>${
        findStudent?.number
      }</i> ${
        findStudent?.number_second && findStudent?.number ? "|" : ""
      } <i>${findStudent?.number_second}</i>
`;
      let textHtmlForAdmin = `<b>🎓 ${findTeacher?.full_name}</b>
<b>${findGroup.level} - ${findGroup.days} - ${findGroup.time} - ${
        findGroup.room
      }</b>

<b>👤 ${findStudent?.full_name}</b><b>${findStudent?.age ? " -" : ""} ${
        findStudent?.age
      }</b>
${statuses[findStudent?.type?.toLowerCase()]}  ${
        findStudent?.attemt_day ? "🗓" : ""
      } <i>${findStudent?.attemt_day}</i>
${findStudent?.number || findStudent?.number_second ? "📞 " : ""}<a>${
        findStudent?.number
      }</a> ${
        findStudent?.number_second && findStudent?.number ? "|" : ""
      } <i>${findStudent?.number_second}</i>
                                `;
      await bot.editMessageText(textHtml, {
        chat_id: chatId,
        message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "❌",
                callback_data: `att_absent_${findStudent._id}_${findGroup._id}`,
              },
              {
                text: "🕔",
                callback_data: `att_late_${findStudent._id}_${findGroup._id}`,
              },
            ],
          ],
        },
      });
      if (findAdmin?.chatId) {
        let newAttendanceRecordsAdmin = new AttendanceRecordsAdmin({
          student: studentId,
          group: groupId,
          teacher: findTeacher._id,
          createdAt: new Date(),
        });

        let resultAdmin = await newAttendanceRecordsAdmin.save();
        let resultSendMessageAdmin = await bot.sendMessage(
          findAdmin?.chatId,
          textHtmlForAdmin,
          {
            parse_mode: "HTML",
            reply_markup: {
              remove_keyboard: true,
              inline_keyboard: [
                [
                  {
                    text: "✅",
                    callback_data: `attAdmin_Answered_${resultAdmin._id}`,
                  },
                  {
                    text: "❌",
                    callback_data: `attAdmin_Didn'tPickup_${resultAdmin._id}`,
                  },
                  {
                    text: "📵",
                    callback_data: `attAdmin_Didn'tCall_${resultAdmin._id}`,
                  },
                  // {
                  //   text: "edit",
                  //   callback_data: `edit_${resultAdmin._id}`,
                  // },
                ],
              ],
            },
          }
        );
      }
    }
    if (typeTeacher == "late") {
      let textHtml = `<b>👤 ${findStudent?.full_name}</b><b>${
        findStudent?.age ? " -" : ""
      } ${findStudent?.age}</b>
${statuses[findStudent?.type?.toLowerCase()]}  ${
        findStudent?.attemt_day ? "🗓" : ""
      } <i>${findStudent?.attemt_day}</i>

${findStudent?.number || findStudent?.number_second ? "📞 " : ""}<i>${
        findStudent?.number
      }</i> ${
        findStudent?.number_second && findStudent?.number ? "|" : ""
      } <i>${findStudent?.number_second}</i>
`;
      bot.editMessageText(textHtml, {
        chat_id: chatId,
        message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🕔",
                callback_data: `late`,
              },
            ],
          ],
        },
      });
    }
  }
};
const addAttendanceAdmin = async (query) => {
  const { data } = query;
  const chatId = query.from.id;
  const message_id = query.message.message_id;
  const splitData = data.split("_");
  let typeAdmin = splitData[1];
  const attentRecordAdminId = splitData[2];
  const findAdmin = await Teacher.findOne({ chatId }).lean();

  const findAttendanceAdmin = await AttendanceRecordsAdmin.findOne({
    _id: attentRecordAdminId,
  })
    .populate("teacher")
    .populate("group")
    .populate("student")
    .lean();
  if (findAttendanceAdmin) {
    if (typeAdmin == "Answered") {
      let textHtmlForAdmin = `<b>👤 ${
        findAttendanceAdmin.teacher?.full_name
      }</b>
<b>${findAttendanceAdmin?.group.level} - ${findAttendanceAdmin?.group.days} - ${
        findAttendanceAdmin?.group.time
      } - ${findAttendanceAdmin?.group.room}</b>
<b>👤 ${findAttendanceAdmin?.student?.full_name}</b> - <b>${
        findAttendanceAdmin?.student?.age
      }</b>
📞 <i>${findAttendanceAdmin?.student?.number}</i> | <i>${
        findAttendanceAdmin?.student?.number_second
      }</i>
${findAttendanceAdmin?.student?.type == "ACTIVE" ? "🟩" : "🟥"}<b>${
        findAttendanceAdmin?.student?.type
      }</b>  🗓<i>${findAttendanceAdmin?.student?.attemt_day}</i>
        `;
      bot.editMessageText(textHtmlForAdmin, {
        chat_id: chatId,
        message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅",
                callback_data: `attAdmin_Answered_${findAttendanceAdmin._id}`,
              },
            ],
          ],
        },
      });
      await bot.sendMessage(chatId, `Sababini yozing : `, {
        reply_markup: {
          remove_keyboard: true,
        },
      });
      findAdmin.action = `write_reason&${findAttendanceAdmin._id}`;
      await AttendanceRecordsAdmin.findByIdAndUpdate(
        findAttendanceAdmin._id,
        { messageId: message_id },
        { new: true }
      );
      await Teacher.findByIdAndUpdate(findAdmin._id, findAdmin, { new: true });
    } else if (typeAdmin == "Didn'tPickup") {
      await bot.deleteMessage(chatId, message_id);

      const sheetReadAttendanceRecordsAdmin = await readSheets(
        "attendanceRecordsAdmin",
        "A:A"
      );
      const writeRow = sheetReadAttendanceRecordsAdmin
        ? `A${sheetReadAttendanceRecordsAdmin?.length + 1}`
        : "A1";
      let dataToExcel = [
        [
          findAttendanceAdmin.group.level,
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
          `Didn't Pick up`,
        ],
      ];
      await writeToSheet("attendanceRecordsAdmin", writeRow, dataToExcel);
      await AttendanceRecordsAdmin.findByIdAndDelete(findAttendanceAdmin._id);
    } else if (typeAdmin == "Didn'tCall") {
      //  typeAdmin == `Didn't  Call`

      await bot.deleteMessage(chatId, message_id);
      const sheetReadAttendanceRecordsAdmin = await readSheets(
        "attendanceRecordsAdmin",
        "A:A"
      );
      const writeRow = sheetReadAttendanceRecordsAdmin
        ? `A${sheetReadAttendanceRecordsAdmin?.length + 1}`
        : "A1";
      let dataToExcel = [
        [
          findAttendanceAdmin.group.level,
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
          `Didn't  Call`,
        ],
      ];
      await writeToSheet("attendanceRecordsAdmin", writeRow, dataToExcel);
      await AttendanceRecordsAdmin.findByIdAndDelete(findAttendanceAdmin._id);
    }
  }
};

const sendExcelAttendanceRecords = async (msg) => {
  const chatId = msg.from.id;
  const endLesson = new Date();
  const findTeacher = await Teacher.findOne({ chatId }).lean();
  const groupId = findTeacher.action.split("&")[1];
  const findGroup = await Groups.findOne({ _id: groupId }).lean();
  const findAttendances = await AttendanceRecords.find({
    teacher: findTeacher._id,
    group: groupId,
  })
    .populate("teacher")
    .populate("group")
    .populate("student")
    .lean();
  const sheetReadAttendanceRecords = await readSheets(
    "attendanceRecords",
    "A:A"
  );
  const writeRow = sheetReadAttendanceRecords
    ? `A${sheetReadAttendanceRecords?.length + 1}`
    : "A1";
  let data = [];
  for (let e of findAttendances) {
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
    ]);
    if (+e.messageId) {
      await bot.deleteMessage(chatId, +e.messageId);
    }
    await AttendanceRecords.findByIdAndDelete(e._id);
  }

  const findAdmin = await Teacher.findOne({ admin: "true" }).lean();

  // let startLessonTimeMinut = await ConvertionTimeMinut(splitText[2]);
  let confirmLessonTimeMinut = await getMinutTimes();
  let confirmDateFormat = minutToFormatTime(confirmLessonTimeMinut);

  textHtmlForAdmin = `<b>#finished</b>
      
🎓<b>${findTeacher.full_name}</b>
<b>${findGroup?.level} - ${findGroup?.days} - ${findGroup?.time} - ${findGroup?.room}</b>

💼 <b>Dars soat</b> <b>${confirmDateFormat}</b> <b>tugadi</b>
`;
  // console.log(textHtmlForAdmin);
  await bot.sendMessage(findAdmin.chatId, textHtmlForAdmin, {
    parse_mode: "HTML",
    reply_markup: {},
  });

  await writeToSheet("attendanceRecords", writeRow, data);
  await Teacher.findByIdAndUpdate(
    findTeacher._id,
    { action: `menu` },
    { new: true }
  );

  const findGroupsOfTeacher = await Groups.find({
    teacher: findTeacher._id,
  }).lean();
  const keyboardGroups = await listGroupsInArray(findGroupsOfTeacher);
  bot.sendMessage(
    chatId,
    findTeacher.language == "uz"
      ? `Dars soat <b>${formatDate(endLesson).split(" ")[1]}</b> yakunlandi.`
      : `Урок закончился в <b>${formatDate(endLesson)}</b>.`,
    {
      parse_mode: "HTML",
      reply_markup: {
        keyboard: [
          ...keyboardGroups,
          [
            {
              text: findTeacher.language == "uz" ? `Units` : `Units`,
            },
          ],
          [
            {
              text:
                findTeacher.language == "uz"
                  ? `🇷🇺/🇺🇿 Tilni o‘zgartirish`
                  : `🇷🇺/🇺🇿 Сменить язык`,
            },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
  return bot.sendMessage(
    chatId,
    findTeacher.language == "uz" ? `Menyuni tanlang:` : `Выберите меню:`,
    {
      reply_markup: {
        keyboard: [
          ...keyboardGroups,
          [
            {
              text: findTeacher.language == "uz" ? `Units` : `Units`,
            },
          ],
          [
            {
              text:
                findTeacher.language == "uz"
                  ? `🇷🇺/🇺🇿 Tilni o‘zgartirish`
                  : `🇷🇺/🇺🇿 Сменить язык`,
            },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
};

const writeMessage = async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;
  const findTeacherAdmin = await Teacher.findOne({ chatId }).lean();
  const idAttendanceRecordAdmin = findTeacherAdmin.action.split("&")[1];
  let message_id = msg.message_id;

  const findAttendanceAdmin = await AttendanceRecordsAdmin.findOne({
    _id: idAttendanceRecordAdmin,
  })
    .populate("teacher")
    .populate("group")
    .populate("student")
    .lean();

  const sheetReadAttendanceRecordsAdmin = await readSheets(
    "attendanceRecordsAdmin",
    "A:A"
  );
  const writeRow = sheetReadAttendanceRecordsAdmin
    ? `A${sheetReadAttendanceRecordsAdmin?.length + 1}`
    : "A1";
  let dataToExcel = [
    [
      findAttendanceAdmin.group.level,
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
      text,
    ],
  ];
  await writeToSheet("attendanceRecordsAdmin", writeRow, dataToExcel);
  await bot.deleteMessage(chatId, +findAttendanceAdmin.messageId);
  await bot.deleteMessage(chatId, message_id);
  await bot.deleteMessage(chatId, --message_id);
  await AttendanceRecordsAdmin.findByIdAndDelete(findAttendanceAdmin._id);
  Teacher.findByIdAndUpdate(
    findTeacherAdmin._id,
    { action: "menu" },
    { new: true }
  );
};

module.exports = {
  groupUnits,
  confirmationLesson,
  findStudentsInGroup,
  addAttendance,
  sendExcelAttendanceRecords,
  addAttendanceAdmin,
  writeMessage,
  sentUnit,
};
