const {Router} = require("express");
const {adminModel, courseModel} = require("../db")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const {JWT_Admin_Password} = require("../config")
const mongoose = require('mongoose')
const { adminMiddleware } = require("../middleware/adminMiddleware")
const SALT_ROUNDS = 10;
//design the schema for the application.
const adminRouter = Router();

adminRouter.get('/adminSignup', (req, res) => {
    res.render("AdminSignup", {title: "Admin Signup"});
})

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

    res.status(201).render("SuccessfulSignup", {newAdmin});

    }catch(error){
    res.status(500).json({
        message: "Admin Signup Failed!",
        error
    })
    }

});


adminRouter.get('/loginPage', (req, res) => {
    const error = req.query.error;
    if(error)
        res.render("LoginPage", {title:"Admin Login Page", error})
    else    
        res.render("LoginPage", {title:"Admin Login Page"});
})


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
            return res.redirect('/admin/loginPage?error=login')
        }
        
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid){
            return res.redirect('/admin/loginPage?error=invalidPassword');
        }

        const token = jwt.sign({
            id: admin._id
        }, JWT_Admin_Password);

        res.cookie('token', token, {
            httpOnly: true, // Helps prevent XSS attacks
            secure: process.env.NODE_ENV === 'production', // Only set secure cookies in production
            maxAge: 3600000 // 1 hour
        });

        res.render("AdminDashboard", {admin})
    }catch(error){
        res.status(500).json({ message: "Error during login", error });
    }

});

adminRouter.get('/addCourse', async (req, res) => {
    const adminEmail = req.query.adminEmail;
    try {
        const admin = await adminModel.findOne({ email: adminEmail }); 
        if (!admin) {
            return res.status(404).send("Admin not found");
        }
        res.render('addCourse', { admin }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

//comes under admin dashboard, if they want to create a course or edit/delete a course. 
adminRouter.post('/course', adminMiddleware, async (req, res) => {
    const { title, description, imageURL, price } = req.body;
    const creatorId = req.userId;
    // Input validation
    if (!title || !description || !imageURL || !price) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        // Create a new course
        const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
        const newCourse = new courseModel({
            _id: new mongoose.Types.ObjectId(),
            title,
            description,
            imageURL,
            price,
            creatorId: creatorObjectId
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

adminRouter.get('/editCourse', async (req, res) => {
    const adminEmail = req.query.adminEmail; 
    try {
        const admin = await adminModel.findOne({ email: adminEmail }); 
        if (!admin) {
            return res.status(404).send("Admin not found");
        }
        res.render('editCourse', { admin }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

adminRouter.put('/course', adminMiddleware, async (req, res) => {
    const adminId = req.userId;
    const { title, description, imageURL, price, courseId } = req.body;

    try {
        const course = await courseModel.updateOne(
            {
                _id: courseId,
                creatorId: adminId
            },
            {
                $set: {
                    title: title,
                    description: description,
                    imageURL: imageURL,
                    price: price
                }
            }
        );

        console.log("Passed until now");
        if (course.matchedCount > 0 && course.modifiedCount > 0) {
            // Document found and updated
            res.status(200).send({
                message: "Successfully updated",
                courseId: courseId
            });
        } else if (course.matchedCount > 0 && course.modifiedCount === 0) {
            // Document found but no changes were made (same values)
            res.status(200).send({
                message: "Course found but no changes made",
                courseId: courseId
            });
        } else {
            res.status(404).send({
                message: "Course not found or wrong admin"
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


//

adminRouter.get('/course/bulk', async (req, res) => {
    const adminEmail = req.query.adminEmail; // Get the admin email from query params
    try {
        const admin = await adminModel.findOne({ email: adminEmail }); // Fetch admin from the database
        if (!admin) {
            return res.status(404).send("Admin not found");
        }

        const courses = await courseModel.find({creatorId: admin._id}); // Fetch all courses
        res.render('bulkOrder', { admin, courses }); // Pass admin and courses to the view
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});


adminRouter.get('/adminDashboard', async (req, res) => {
    const adminEmail = req.query.adminEmail; 
    try {
        const admin = await adminModel.findOne({ email: adminEmail }); 
        if (!admin) {
            return res.status(404).send("Admin not found");
        }
        res.render("AdminDashboard", {title: "Admin Dashboard", admin});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
   
})

adminRouter.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the cookie
    res.status(200).json({ message: "Successfully logged out" });
});



module.exports = {
    adminRouter: adminRouter
}