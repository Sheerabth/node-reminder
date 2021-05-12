const express = require('express');
const childProcess = require('child_process')
const {Reminder} = require("../db/models/reminder");
const {authenticate} = require("../middlewares/auth");
const cron = require('node-schedule');
const reminderRoute = new express.Router();

reminderService = childProcess.fork("./src/services/reminderService.js")
reminderService.send("start")
reminderService.on("message", (message => {
    console.log(message)
}))

reminderRoute.get('/', authenticate, async (req, res) => {
    let userId = req.user_id

    await Reminder.find({ userId }, async (err, reminders) => {
        if (err) {
            await res.status(400).send(err)
        }
        if (reminders.length === 0) {
            await res.status(200).send({
                "message": "No remainders scheduled"
            })
        }
        else {
            reminderService.send({
                "event": "test",
                "reminder": reminders
            })
            await res.status(200).send({
                "message": "Reminders retrieved",
                "reminders": reminders
            })
        }
    })
})

reminderRoute.post('/', authenticate, async (req, res) => {
    let userId = req.user_id

    const reminder = new Reminder({
        userId,
        ...req.body
    })
    await reminder.save(async (err, docs) => {
        if (err) {
            await res.status(400).send(err)
        }
        else {
            reminderService.send({
                "event": "schedule",
                "reminder": docs
            })
            await res.status(200).send({
                "message": "saved successfully",
                "reminder": docs
            })
        }
    })
})

reminderRoute.patch('/:reminderId', authenticate, async (req, res) => {
    const body = req.body
    let userId = req.user_id
    const reminderId = req.params.reminderId

    await Reminder.findOneAndUpdate(
        { _id: reminderId,
                userId},
        { ...body }, { returnOriginal: false }, async (err, docs) => {
            if (err) {
                await res.status(400).send(err)
            }
            else {
                reminderService.send({
                    "event": "schedule",
                    "reminder": docs
                })
                await res.status(200).send({
                    "message": "updated successfully",
                    "reminder": docs
                })
            }
        })
})

reminderRoute.delete('/:reminderId', authenticate, async (req, res) => {

    let userId = req.user_id
    const reminderId = req.params.reminderId

    await Reminder.findOneAndDelete(
        { _id: reminderId, userId },async (err, docs) => {
            if (err) {
                await res.status(400).send(err)
            }
            else {
                // reminderService.send({
                //     "event": "delete",
                //     "reminder": docs
                // })
                await res.status(200).send({
                    "message": "deleted successfully",
                    "reminder": docs
                })
            }
        })
})

module.exports.reminderRoute = reminderRoute