const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const createError = require("http-errors");

const {userRoute} = require('./routes/usercontroller')
const {reminderRoute} = require('./routes/reminderController')

require('./db/mongoose');

const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});
// app.use(function(req, res, next) {
//     next(createError(404));
// });

app.use(bodyParser.urlencoded({extended: true}))

app.use('/user', userRoute)
app.use('/reminder', reminderRoute)

app.get('/', (req, res) => {
    res.status(200).send("Check Github Repo for API Endpoints")
})

app.listen(PORT, (err) => {
    if (err) console.log(err)
    console.log('Backend Server Listening on ' + PORT)
})