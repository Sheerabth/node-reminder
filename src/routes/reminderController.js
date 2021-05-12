const express = require('express');

const {Reminder} = require("../models/reminder");
const {authenticate} = require("../middlewares/auth");
const cron = require('node-cron');
const reminderRoute = new express.Router();

reminderRoute.get('/', authenticate, async (req, res) => {
    let userId = req.user_id

    await Reminder.find({ userId }, async (err, reminders) => {
        if (err) {
            await res.status(400).send(err)
        }
        if (reminders.length === 0) {
            await cron.schedule('*/2 * * * * *', () => {
                console.log('running a task every minute');
            });
            await res.status(200).send({
                "message": "No remainders scheduled"
            })
        }
        else {
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

    await Reminder.updateOne(
        { _id: reminderId,
                userId},
        { ...body }, async (err, docs) => {
            if (err) {
                await res.status(400).send(err)
            }
            else {
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

    await Reminder.deleteOne(
        { _id: reminderId, userId },async (err, docs) => {
            if (err) {
                await res.status(400).send(err)
            }
            else {
                await res.status(200).send({
                    "message": "deleted successfully",
                    "reminder": docs
                })
            }
        })
})

module.exports.reminderRoute = reminderRoute