const nodemailer = require('nodemailer')
const schedule = require('node-schedule')
require('../db/mongoose')
const {User} = require("../db/models/user");
const {Reminder} = require("../db/models/reminder")

class ReminderService {
    constructor() {
        this.jobList = {}
    }

    handleJob = async (reminderDetails) => {
        const transporter = await nodemailer.createTransport({
            service: "Gmail",
            secure: false,
            auth: {
                user: process.env.ACCOUNT_ADDR,
                pass: process.env.ACCOUNT_PWD
            }
        })
        const user = await User.findOne({_id: reminderDetails.userId})
        const date = new Date()
        const reminder = await Reminder.findOne({
            _id: reminderDetails._id,
            userId: user._id
        })
        await transporter.sendMail({
            from: `"Node Reminder"<${process.env.ACCOUNT_ADDR}>`,
            to: `"${user.name}"<${user.email}>`,
            subject: `Reminding you to ${reminder.name}`,
            html:  `<b>Hello ${user.name},</b>
                    <p>You have schduled a reminder at ${date.toLocaleDateString()} ${date.toLocaleTimeString()}.</p>
                    <b>Your Reminder:</b>
                    <p>${reminder.description}.</p>`
        })
        if(reminder.recurringType === "once") {
            reminder.status = true
        }
        reminder.save()
    }

    scheduleJob = async (reminder) => {
        // reschedule job
        try {
            this.jobList[reminder._id].cancel()
        } catch {
        } finally {
            let scheduleDateTime = reminder.scheduleDateTime
            let timeStamp = new Date(String(scheduleDateTime))
            const secs = String(timeStamp.getSeconds())
            const mins = String(timeStamp.getMinutes())
            const hours = String(timeStamp.getHours())
            const day = String(timeStamp.getDay())
            const date = String(timeStamp.getDate())
            if (reminder.recurringType === "daily") {
                timeStamp = [secs, mins, hours, '*', '*', '*'].join(' ')
            } else if (reminder.recurringType === "weekly") {
                timeStamp = [secs, mins, hours, '*', '*', day].join(' ')
            } else if (reminder.recurringType === "monthly") {
                timeStamp = [secs, mins, hours, date, '*', '*'].join(' ')
            }
            this.jobList[reminder._id] = await schedule.scheduleJob(timeStamp, async function (reminderDetails) {
                await this.handleJob(reminderDetails)
                console.log("Done Sending Mail")
            }.bind(this, reminder))
        }
    }

    deleteJob = (reminder) => {
        // delete job
        try {
            this.jobList[reminder._id].cancel()
        } finally {

        }
    }

    testJob = async (reminder) => {
        reminder = reminder[0]
        const date = new Date(2021, 4, 13, 11, 5, 0);
        this.jobList[reminder._id] = await schedule.scheduleJob(date, async function (reminderDetails) {
            await this.handleJob(reminderDetails)
            console.log("bye")
        }.bind(this, reminder))
    }
}

reminderService = new ReminderService()

process.on("message", ( async (data) => {
    if (data.event === "start") {
        process.send("Process Started")
    } else if (data.event === "schedule") {
       await reminderService.scheduleJob(data.reminder)
    } else if (data.event === "delete") {
        reminderService.deleteJob(data.reminder)
    }
    else if (data.event === 'test') {
        await reminderService.testJob(data.reminder)
    }
}))