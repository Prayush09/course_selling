const {Router} = require("express");
const {adminModel, courseModel} = require("../db")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const {JWT_Admin_Password} = require("../config")
const { ObjectId } = require("mongodb"); 
const { adminMiddleware } = require("../middleware/adminMiddleware")
const SALT_ROUNDS = 10;
//design the schema for the application.
const adminRouter = Router();

adminRouter.post('/signup', async (req, res)=>{
   const {email , password, firstName, lastName} = req.body; //add zod validation!

   if(!email || !password){
    return res.status(400).json({
        message: "Email and password are required!"
    })
   }

   try{
    const existingAdmin = await adminModel.findOne({email});
    if(existingAdmin){
        return res.status(409).json({
            message:"Admin already exist!"
        })
    }

    const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);

    const newAdmin = new adminModel({email, password: hashedPass, firstName, lastName});
    await newAdmin.save();

    res.status(201).json({message: "Admin Signup successful!"})

   }catch(error){
    res.status(500).json({
        message: "Admin Signup Failed!",
        error
    })
   }

});

adminRouter.post('/login', async (req, res)=>{
    const {email , password } = req.body; //add zod validation!

    if(!email || !password){
     return res.status(400).json({
         message: "Email and password are required!"
     })
    }
    try{
        //finding only one admin
        const admin = await adminModel.findOne({
            email
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
           
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid Credentials"})
        }

        const token = jwt.sign({
            id: admin._id
        }, JWT_Admin_Password);

        res.json({
            token, 
            message: "Successful!"
        })
    }catch(error){
        res.status(500).json({ message: "Error during login", error });
    }
 
});


adminRouter.post('/course', adminMiddleware, async (req, res) => {
    const { title, description, imageURL, price } = req.body;
    const creatorId = req.userId;
    // Input validation
    if (!title || !description || !imageURL || !price) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Create a new course
        const newCourse = new courseModel({
            _id: new ObjectId(),
            title,
            description,
            imageURL,
            price,
            creatorId: new ObjectId(creatorId)
        });

        // Save the course to the database
        await newCourse.save();

        res.status(201).json({
            message: "Course created successfully",
            course: newCourse
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating course",
            error: error.message
        });
    }
});

adminRouter.put('/course', adminMiddleware, async (req, res) => {
    const adminId = req.userId;
    const { title, description, imageURL, price, courseId } = req.body;

    try {
        const course = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId
        }, {
            $set: {
                title: title,
                description: description,
                imageURL: imageURL,
                price: price
            }
        });

        if (course.nModified > 0) {
            res.status(200).send({
                message: "Successfully updated",
                courseId: courseId
            });
        } else if (course.n === 0) {
            res.status(404).send({
                message: "Course not found or wrong admin"
            });
        } else {
            res.status(403).send({
                message: "No changes made"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Update Failed",
            error: err.message
        });
    }
});


adminRouter.get('/course/bulk', async (req, res)=>{
    const courses = await courseModel.find({})

    res.send({
        courses
    })
});

module.exports = {
    adminRouter: adminRouter
}