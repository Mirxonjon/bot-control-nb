const {Schema, model} = require('mongoose')

const Students = new Schema({
    full_name: String,
    number: String,
    number_second: String,
    attemt_day: String,
    age: String,
    type: String,
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Groups',
        },
    // applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Applications' }],

    updateAt: Date,
    createdAt: Date

})

module.exports = model('Students',Students)