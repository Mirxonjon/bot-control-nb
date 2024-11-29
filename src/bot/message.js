const Teachers = require("../model/teachers");
const { bot } = require("./bot");
const {
  sendExcelAttendanceRecords,
  writeMessage,
  confirmationLesson,
  groupUnits,
} = require("./helper/groups");
const { chooseNewLanguage, changeLanguage } = require("./helper/language");
const {
  start,
  logout,
  chooseTeacher,
  confirmPassword,
} = require("./helper/start");

bot.on("message", async (msg) => {
  const chatId = msg.from.id;
  const text = msg.text;

  const teacher = await Teachers.findOne({ chatId }).lean();
  // const findNotAccess = await Teachers.findOne({
  //   chatIdNotAccess: chatId,
  // }).lean();
  if (text == "/start" || text == "Menyu" || text == "Меню") {
    start(msg);
  }

  if (text == "/logout") {
    logout(msg);
  }


  if (teacher && text != "/start" && text != "/logout") {
    if (teacher?.action?.split("&")[0] == "attendance_record") {
      if (text == "Darsni Yakunlash" || text == "Завершить урок") {
        sendExcelAttendanceRecords(msg);
      }
    }
    if (teacher?.action?.split("&")[0] == "write_reason") {
      writeMessage(msg);
    }

    if (
      teacher.action == "menu" &&
      text != "/start" &&
      text != "🇷🇺/🇺🇿 Tilni o‘zgartirish" &&
      text != "🇷🇺/🇺🇿 Сменить язык" &&
      text != `Units` &&
      text != `🇷🇺  Русский` &&
      text != `🇺🇿 O‘zbekcha`
    ) {
      console.log('okk');
      confirmationLesson(msg);
    }

    if (teacher.action == "menu" && text == "Units") {
      groupUnits(msg);
    }

    if (teacher.action == "choose_new_language") {
      chooseNewLanguage(msg);
    }

    if (text == `🇷🇺/🇺🇿 Tilni o‘zgartirish` || text == `🇷🇺/🇺🇿 Сменить язык`) {
      changeLanguage(msg);
    }
  }
});
