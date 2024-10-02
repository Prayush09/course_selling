const mongoose = require('mongoose')
console.log("connected to DB")
//use dotenv to hide the string

const Schema = mongoose.Schema;

const ObjectId = mongoose.Types.ObjectId;


const userSchema = new Schema({
    email: {type: String, unique: true},
    password: String, 
    firstName: String,
    lastName: String
})

const adminSchema = new Schema({
    email: {type: String, unique: true},
    password: String, 
    firstName: String,
    lastName: String
})

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'adminModel' // Assuming 'Admin' is the reference model for admins
    }
});


const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
})
//schema added!
const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

module.exports = {
    userModel,
    adminModel,
    courseModel,
    purchaseModel
}