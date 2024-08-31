const  express = require('express')
const mongoose = require('mongoose')
const {CronJob} = require('cron')
const  cron = require('cron')
const {  updateAllTeachersData } = require('./src/utils/time')

// import { CronJob } from 'cron';
const app = express()
require('dotenv').config()

app.use(express.json())

require('./src/bot/bot')

const job = new CronJob(
	'10 * * * * *', // cronTime
    // '0 59 23 * * *',
	async () => {
        await updateAllTeachersData(); 
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

//     app.get('/updateOperators',async (req, res) => {
//         // const users = await Applications.find().populate('user').lean()
//         //  console.log(users);

//         await updateAllOperatorDate(); 
//             res.json({
//                 message: 'update',
                
//                 })
//         })