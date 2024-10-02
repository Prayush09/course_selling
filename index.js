require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const path = require("path")
const methodOverride = require('method-override');

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("views", "views");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // To parse URL encoded bodies
app.use(methodOverride('_method')); // Allow overriding HTTP methods using query parameters


const {courseRouter} = require("./routes/course");
const {userRouter} = require('./routes/user');
const {adminRouter} = require('./routes/admin');


//used a router to create these endpoints.
//very clean, easy to edit
app.use('/user', userRouter);
app.use('/course', courseRouter);
app.use('/admin', adminRouter);

//await the database, otherwise the application will work without a db!
async function main(){
    //dotend to put the security strings in a safe place
    //figure it out yourself
    //only start when database is done!
        await mongoose.connect(process.env.MONGO_URL)
        app.listen(3000);
        console.log("listening on port 3000")
}


main();