const Groups = require("../model/groups")
const Students = require("../model/students")
const Teachers = require("../model/teachers")
const { readSheets } = require("./google_cloud")

const jobTime =  ['07:00 - 16:00', ,  '08:00 - 17:00', '9:00 - 18:00', '11:00 - 20:00',   '13:00 - 22:00' , '15:00 - 00:00',  '17:00 - 02:00',  ]
const DaysUz = ['Dushanba', 'Seshanba',  'Chorshanba', 'Payshanba' ,  'Juma'  ,'Shanba' ,'Yakshanba' ]
const DaysRu = ['Понедельник',  'Вторник', 'Среда' ,  'Четверг'  ,'Пятница'  , 'Суббота'  , 'Воскресенье' ]
const Supervayzers = ['Шавкатов Камолиддин' , 'Раҳимжонов Жавоҳир' , 'Юсупова Наргиза' , 'Исмаилова Нигора']

let dateDayObj = {
  "1" : 31,
  "2" : 29,
  "3" : 31,
  "4" : 30,
  "5" : 31,
  "6" : 30,
  "7" : 31,
  "8" : 31,
  "9" : 30,
  "10" : 31,
  "11" : 30,
  "12" : 31,
}

let InfoUserArr = [
  [
      'F.I.Sh',
      'Telefon raqam',
      'Ish vaqti',
      'Dam olish kunlari',
      'Sababi' ,
      `S'orovlar soni`,
      'Yuborilgan sana',
      `Admin Javobi`,
      'Admin Javob bergan vaqti'
  ]
]
function formatDate(date) {
  if(date){
    let day = date.getDate();
    let month = date.getMonth() + 1; 
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
  
    // Agar kun yoki oy bir xonali bo'lsa, oldiga 0 qo'shish
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
  
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }else {
    return null
  }

  }



const updateAllTeachersData = async () => {
  const allTeachers = await readSheets('BOT','M:O')
  const allTeachersAndGroups = await readSheets('BOT','A:K')
  if(allTeachers?.length) {
    console.log('All teachers', allTeachers);


  for(let e of allTeachers) {
    if(e.length) {
      let findTeacher = await Teachers.findOne({ full_name: e[0] }).lean();
      if(findTeacher){
         await findAndUpdateOrCreateGroups(findTeacher,allTeachersAndGroups)
         const isAdmin = e[2] == 'admin' ? true : false
        if(e[1] != findTeacher.password ||  isAdmin != findTeacher.admin) {
          await Teachers.findByIdAndUpdate(findTeacher._id,{password : e[1] , admin: e[2] == 'admin' ? true : false ,updateAt : new Date()},{new:true})
        }
      } else {
        console.log('Teacher create');
        let newTeacher = new Teachers({
          full_name : e[0],
          password : e[1],
          admin: e[2] == 'admin' ? true : false,
          createdAt: new Date(),
        })
        const  createTeacher = await newTeacher.save()
        await findAndUpdateOrCreateGroups(createTeacher,allTeachersAndGroups)

      }
  }
}
  } else {
    console.log('No teachers');
  }

}

const findAndUpdateOrCreateStudents = async (i ,findGroup) => {

  let findStudent = await Students.findOne({group: findGroup._id,full_name: i[5],age: i[6],number: i[7],}).lean()
  console.log(findStudent, 'Find student');

  if(findStudent) {
    if(findStudent.number_second != i[8] || findStudent.attemt_day != i[9] || findStudent.type != i[10]) {
      await Students.findByIdAndUpdate(findStudent._id,{number_second : i[8] , attemt_day : i[9] , type : i[10]},{new:true})
    }
  } else {

    let newStudent = new Students({
      full_name : i[5],
      age : i[6],
      number : i[7],
      number_second : i[8],
      attemt_day : i[9],
      type : i[10],
      group: findGroup._id,
      createdAt: new Date(),
    })

    const result = await newStudent.save()
  }
}

const findAndUpdateOrCreateGroups = async (findTeacher,allTeachersAndGroups) => {
  for(let i of allTeachersAndGroups) {
    if(findTeacher.full_name == i[4]){
      let  findGroup = await Groups.findOne({level: i[0],room: i[1],time: i[2],days: i[3],teacher: findTeacher._id}).lean()
      if(findGroup) {
        console.log(i);
       await findAndUpdateOrCreateStudents(i,findGroup)
      }else{
        let newGoup = new Groups({
          level : i[0],
           room: i[1],
           time: i[2],
           days: i[3],
           teacher: findTeacher._id,
           createdAt: new Date(),
         })
        let  createGroup = await newGoup.save()
           await findAndUpdateOrCreateStudents(i , createGroup)
              }
              // console.log(findGroup, 'Find Group');;
            }
    
  }
}




  


  
module.exports = {
    jobTime,
    DaysUz,
    DaysRu,
    formatDate,
    dateDayObj,
    InfoUserArr,
    Supervayzers,
    updateAllTeachersData
}