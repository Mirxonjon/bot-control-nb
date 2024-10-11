const {Schema, model} = require('mongoose')

const Groups = new Schema({
    sheet_id: String,
    level: String,
    room: String,
    time: String,
    days: String,
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        },
    updateAt: Date,
    createdAt: Date

})

module.exports = model('Groups',Groups)