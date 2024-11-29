const Students = require("../model/students");
const Teacher = require("../model/teachers");
const { bot } = require("./bot");
const {
  addAttendance,
  addAttendanceAdmin,
  findStudentsInGroup,
  sentUnit,
} = require("./helper/groups");

bot.on("callback_query", async (query) => {
  const chatId = query.from.id;

  const { data } = query;
  const findTeacher = await Teacher.findOne({ chatId }).lean();
  let callbackName = data.split("_");

  let textAnswer = "Send";

  if (callbackName[0] == "confirmL") {
    if (callbackName[1] == "true") {
      textAnswer =
        findTeacher.language == "uz" ? "Siz tasdiqladingiz" : "Вы подтвердили";
    } else {
      textAnswer =
        findTeacher.language == "uz" ? "Siz rad etdingiz" : "Вы отказались";
    }
  }
  if (callbackName[0] == "att") {
    const studentId = callbackName[2];
    const findStudent = await Students.findOne({ _id: studentId }).lean();

    if (callbackName[1] == "absent") {
      textAnswer =
        findTeacher.language == "uz"
          ? `❌ ${findStudent.full_name} yuborildi`
          : `❌ ${findStudent.full_name} отправил`;
    } else if (callbackName[1] == "attend") {
      textAnswer =
        findTeacher.language == "uz"
          ? `✅ ${findStudent.full_name} yuborildi`
          : `✅ ${findStudent.full_name} отправил`;
    } else if (callbackName[1] == "frozen") {
      textAnswer =
        findTeacher.language == "uz"
          ? `🥶 ${findStudent.full_name} yuborildi`
          : `🥶 ${findStudent.full_name} отправил`;
    } else if (callbackName[1] == "late") {
      textAnswer =
        findTeacher.language == "uz"
          ? `🕔 ${findStudent.full_name} yuborildi`
          : `🕔 ${findStudent.full_name} отправил`;
    }
  }
  if (callbackName[0] == "unit") {
      textAnswer = `✅ Unit - ${callbackName[1]}`;
  }

  bot
    .answerCallbackQuery(query.id, {
      text: textAnswer,
      show_alert: false,
      cache_time: 0.5,
    })
    .then(async () => {
      if (callbackName[0] == "att") {
        addAttendance(query);
      }
      if (callbackName[0] == "attAdmin") {
        addAttendanceAdmin(query);
      }
      if (callbackName[0] == "unit") {
        sentUnit(query);
      }

      if (callbackName[0] == "confirmL") {
        await findStudentsInGroup(query);
      }
    })
    .catch((e) => {
      console.log(e);
    });
});
