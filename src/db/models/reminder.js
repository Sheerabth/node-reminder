const mongoose = require('mongoose')
const validator = require('validator')

const reminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: "None"
    },
    scheduleDateTime: {
        type: Date,
        required: true
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    recurringType: {
        type: String,
        required: true,
        enum: ['once', 'daily', 'weekly', 'monthly'],
        default: "once"
    }
}, {
    timestamps: true
})

const Reminder = mongoose.model('reminders', reminderSchema)

module.exports.Reminder = Reminder
