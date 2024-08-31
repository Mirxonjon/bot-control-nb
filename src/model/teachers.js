const {Schema, model} = require('mongoose')

const Teacher = new Schema({
    full_name: String,
    chatId: Number,
    phone: String,
    password: String,
    admin: {
        type: Boolean,
        default: false
    },
    action: String, 
    language: String,
    // applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Applications' }],
    startLesson: Date,
    updateAt: Date,
    createdAt: Date

})

module.exports = model('Teacher',Teacher)