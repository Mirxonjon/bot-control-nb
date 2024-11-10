const express = require("express");
const mongoose = require("mongoose");
const { CronJob } = require("cron");
const cron = require("cron");
const { updateAllTeachersData } = require("./src/utils/time");
const { sendNotification } = require("./src/bot/helper/notification");

const app = express();
require("dotenv").config();

app.use(express.json());

require("./src/bot/bot");

const job = new CronJob(
  "0 * * * *", // Run at the 0th minute of every hour
  async () => {
    sendNotification();
  }, // onTick
  null, // onComplete
  true, // start
  "Asia/Tashkent" // timeZone
);

const Updatedate = new CronJob(
  "0 0 * * *", // Run every day at 00:00 (midnight)
  async () => {
    await updateAllTeachersData();
  }, // onTick
  null, // onComplete
  true, // start
  "Asia/Tashkent" // timeZone
);
// const dt = cron.sendAt('* * * * *');

async function dev() {
  try {
    mongoose
      .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
      })
      .then(() => console.log("mongo connect"))
      .catch((error) => console.log(error.message));

    app.listen(process.env.PORT, () => {
      console.log("server is runing" + process.env.PORT);
    });
    //    await sendNotification()
    await updateAllTeachersData();
    // await updateAllTeachersData();
  } catch (error) {
    console.log(error.message);
  }
}

dev();

// app.get('/getAllApplications',async (req, res) => {
//     const users = await Applications.find().populate('user').lean()
//     //  console.log(users);
//         res.json({
//             message: 'ok',
//             users
//             })
//     })

app.get("/updateTeachers", async (req, res) => {
  await updateAllTeachersData();
  res.json({
    message: "update",
  });
});
