const { Schema, model } = require("mongoose");

const Teacher = new Schema({
  sheet_id: String,
  full_name: String,
  chatId: Number,
  phone: String,
  username:String,
  password: String,
  admin: {
    type: Boolean,
    default: false,
  },
  action: String,
  chatIdNotAccess: Number,
  actionNotAccess: String,
  language: {
    type: String,
    default: "uz",
  },
  startLesson: Date,
  updateAt: Date,
  createdAt: Date,
});

module.exports = model("Teacher", Teacher);
