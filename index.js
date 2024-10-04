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

app.get('/', (req, res)=>{
    res.render('index');
})


app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/courses', (req, res) => {
    res.render('seeCourses');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

const {courseRouter} = require("./routes/course");
const {userRouter} = require('./routes/user');
const {adminRouter} = require('./routes/admin');


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