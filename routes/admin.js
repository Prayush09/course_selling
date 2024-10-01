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

adminRouter.get('/front-endSignup', (req, res) => {
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
    res.render("LoginPage", {title:"Admin Login Page"})
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
            return res.status(404).json({ message: "Admin not found" });
        }
        
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid Credentials"})
        }

        const token = jwt.sign({
            id: admin._id
        }, JWT_Admin_Password);

        res.render("AdminDashboard", {admin, token})
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


adminRouter.get('/course/bulk', async (req, res) => {
    const adminEmail = req.query.adminEmail; // Get the admin email from query params
    try {
        const admin = await adminModel.findOne({ email: adminEmail }); // Fetch admin from the database
        if (!admin) {
            return res.status(404).send("Admin not found");
        }

        const courses = await courseModel.find({}); // Fetch all courses
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


module.exports = {
    adminRouter: adminRouter
}