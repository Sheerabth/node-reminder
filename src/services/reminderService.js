const nodemailer = require('nodemailer')
const schedule = require('node-schedule')

class ReminderService {
    constructor() {
        this.jobList = {}
    }

    handleJob = (reminderDetails) => {
        console.log(reminderDetails.name)
    }

    scheduleJob = (reminder) => {
        // reschedule job
        try {
            this.jobList[reminder._id].cancel()
        } finally {
            let timeStamp = reminder.scheduleDateTime
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
            this.jobList[reminder._id] = schedule.scheduleJob(timeStamp, function (reminderDetails) {
                this.handleJob(reminderDetails)
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

    // testJob = (reminder) => {
    //     reminder = reminder[0]
    //     const date = new Date(2021, 4, 12, 21, 17, 0);
    //     this.jobList[reminder._id].cancel()
    //     this.jobList[reminder._id] = schedule.scheduleJob(date, function (reminderDetails) {
    //         this.handleJob(reminderDetails)
    //     }.bind(this, reminder))
    //         .then(()=> {console.log("hi")})
    // }
}

reminderService = new ReminderService()

process.on("message", ( (data) => {
    if (data.event === "start") {
        process.send("Process Started")
    } else if (data.event === "schedule") {
        reminderService.scheduleJob(data.reminder)
    } else if (data.event === "delete") {
        reminderService.deleteJob(data.reminder)
    }
    // else if (data.event === 'test') {
    //     reminderService.testJob(data.reminder)
    // }
}))