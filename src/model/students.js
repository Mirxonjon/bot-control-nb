const { Schema, model } = require("mongoose");

const Students = new Schema({
  sheet_id: String,
  full_name: String,
  number: String,
  number_second: String,
  attemt_day: String,
  age: String,
  type: String,
  group: {
    type: Schema.Types.ObjectId,
    ref: "Groups",
  },

  updateAt: Date,
  createdAt: Date,
});

module.exports = model("Students", Students);
