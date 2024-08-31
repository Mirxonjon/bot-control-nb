const {Schema, model} = require('mongoose')

const AttendanceRecordsAdmin = new Schema({
    typeAdmin: String,
    messageId: String,
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
        },
    group: {
            type: Schema.Types.ObjectId,
            ref: 'Groups',
            },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Students',
        },

    updateAt: Date,
    createdAt: Date

})

module.exports = model('AttendanceRecordsAdmin',AttendanceRecordsAdmin)