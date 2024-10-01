const  express = require('express')
const mongoose = require('mongoose')
const {CronJob} = require('cron')
const  cron = require('cron')
const {  updateAllTeachersData } = require('./src/utils/time')
const { sendNotification } = require('./src/bot/helper/group')

const app = express()
require('dotenv').config()

app.use(express.json())

require('./src/bot/bot')

const job = new CronJob(
	'10 * * * * *', // cronTime
    // '0 59 * * * *' ,
	async () => {
        // await updateAllTeachersData(); 
        sendNotification()
      }, // onTick
	null, // onComplete
	true, // start
	'Asia/Tashkent' // timeZone
);
// const dt = cron.sendAt('* * * * *');

async function dev() {
    try {
        mongoose.connect(process.env.MONGO_URL , {
            useNewUrlParser: true
        }).then(() => console.log('mongo connect'))
        .catch((error) => console.log(error.message))
        
        app.listen(process.env.PORT, () => {
            console.log('server is runing' + process.env.PORT );
        })
    //    await sendNotification()

        // await updateAllTeachersData(); 
    } catch (error) {
        console.log(error.message);
    }
}

dev()

// app.get('/getAllApplications',async (req, res) => {
//     const users = await Applications.find().populate('user').lean()
//     //  console.log(users);
//         res.json({
//             message: 'ok',
//             users
//             })
//     })

    app.get('/updateTeachers',async (req, res) => {
        // const users = await Applications.find().populate('user').lean()
        //  console.log(users);
console.log('keldi');
        await updateAllTeachersData(); 
            res.json({
                message: 'update',
                
                })
        })