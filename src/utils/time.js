const Groups = require("../model/groups");
const Students = require("../model/students");
const Teachers = require("../model/teachers");
const { readSheets } = require("./google_cloud");

const jobTime = [
  "07:00 - 16:00",
  ,
  "08:00 - 17:00",
  "9:00 - 18:00",
  "11:00 - 20:00",
  "13:00 - 22:00",
  "15:00 - 00:00",
  "17:00 - 02:00",
];
const DaysUz = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];
const DaysRu = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];
const Supervayzers = [
  "Шавкатов Камолиддин",
  "Раҳимжонов Жавоҳир",
  "Юсупова Наргиза",
  "Исмаилова Нигора",
];

let dateDayObj = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};

let InfoUserArr = [
  [
    "F.I.Sh",
    "Telefon raqam",
    "Ish vaqti",
    "Dam olish kunlari",
    "Sababi",
    `S'orovlar soni`,
    "Yuborilgan sana",
    `Admin Javobi`,
    "Admin Javob bergan vaqti",
  ],
];
function formatDate(date) {
  if (date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } else {
    return null;
  }
}
function formatTime(date) {
  const hours = String(date.getHours());
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function getMinutTimes() {
  const hozir = new Date(); // Hozirgi vaqtni oladi
  const soat = hozir.getHours();
  const minut = hozir.getMinutes();
  return soat * 60 + minut;
}

function ConvertionTimeMinut(vaqt) {
  const [soat, minut] = vaqt.split(":").map(Number);
  return soat * 60 + minut;
}
const updateAllTeachersData = async () => {
  const allTeachers = await readSheets("BOT", "P:S2");
  const allGroups = await readSheets("GROUPS", "A:G2");
  const allStudents = await readSheets("STUDENTS", "A:H2");
  console.log(allTeachers);
  if (allTeachers?.length) {
    for (let e of allTeachers) {
      if (e.length) {
        let findTeacher = await Teachers.findOne({ sheet_id: e[1] }).lean();
        if (findTeacher) {
          // const isAdmin = e[2] == "admin" ? true : false;
          if (e[1] == findTeacher.password) {
            await Teachers.findByIdAndUpdate(
              findTeacher._id,
              {
                password: e[1],
                admin: e[2] == "admin" ? true : false,
                username: e[3]?.toLowerCase(),
                updateAt: new Date(),
              },
              { new: true }
            );
          }
        } else {
          let newTeacher = new Teachers({
            sheet_id: e[1],
            full_name: e[0],
            password: e[1],
            username: e[3]?.toLowerCase(),
            admin: e[2] == "admin" ? true : false,
            createdAt: new Date(),
          });
          await newTeacher.save();
        }
      }
    }
    await findAndUpdateOrCreateGroups(allGroups, allStudents);
  } else {
  }
};

const findAndUpdateOrCreateStudents = async (allStudents) => {
  if (allStudents?.length) {
    for (let e of allStudents) {
      let findStudent = await Students.findOne({ sheet_id: e[1] }).lean();
      if (findStudent) {
        if (
          findStudent.number_second != e[5] ||
          findStudent.attemt_day != e[6] ||
          findStudent.type != e[7]
        ) {
          await Students.findByIdAndUpdate(
            findStudent._id,
            {
              full_name: e[2],
              age: e[3],
              number: e[4],
              number_second: e[5],
              attemt_day: e[6],
              type: e[7],
              group: findGroup._id,
              createdAt: new Date(),
            },
            { new: true }
          );
        }
      } else {
        let findGroup = await Groups.findOne({ sheet_id: e[0] }).lean();

        let newStudent = new Students({
          sheet_id: e[1],
          full_name: e[2],
          age: e[3],
          number: e[4],
          number_second: e[5],
          attemt_day: e[6],
          type: e[7],
          group: findGroup._id,
          createdAt: new Date(),
        });
        await newStudent.save();
      }
    }
  }
};

const findAndUpdateOrCreateGroups = async (AllGroups, allStudents) => {
  for (let e of AllGroups) {
    let findGroup = await Groups.findOne({ sheet_id: e[0] }).lean();
    if (findGroup) {
      await Groups.findByIdAndUpdate(
        findGroup._id,
        { level: e[2], room: e[3], time: e[4], days: e[5] },
        { new: true }
      );
    } else {
      let findTeacher = await Teachers.findOne({ sheet_id: e[1] }).lean();

      let newGoup = new Groups({
        sheet_id: e[0],
        level: e[2],
        room: e[3],
        time: e[4],
        days: e[5],
        teacher: findTeacher._id,
        createdAt: new Date(),
      });
      await newGoup.save();
    }
  }
  await findAndUpdateOrCreateStudents(allStudents);
};

function minutToFormatTime(minut) {
  const soat = Math.floor(minut / 60); // Minutni soatga aylantirish
  const qolganMinut = minut % 60; // Qolgan minutlar
  return `${soat.toString().padStart(2, "0")}:${qolganMinut
    .toString()
    .padStart(2, "0")}`;
}

module.exports = {
  jobTime,
  DaysUz,
  DaysRu,
  formatDate,
  formatTime,
  dateDayObj,
  InfoUserArr,
  Supervayzers,
  updateAllTeachersData,
  getMinutTimes,
  ConvertionTimeMinut,
  minutToFormatTime,
};
