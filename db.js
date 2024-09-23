const mongoose = require('mongoose')
console.log("connected to DB")
//use dotenv to hide the string

const Schema = mongoose.Schema;

const ObjectId = Schema.ObjectId;

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
    _id: ObjectId,
    title: String,
    description: String, 
    imageURL: String,
    price: Number,
    creatorID: ObjectId
})

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