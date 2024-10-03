const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userModel, purchaseModel, courseModel } = require("../db");
const {JWT_User_Password} = require("../config")
const SALT_ROUNDS = 10;
const { userMiddleware } = require("../middleware/userMiddleware")
const userRouter = Router();


userRouter.get('/userDashboard', userMiddleware, async (req, res)=> {
    const userEmail = req.query.userEmail; 
    try {
        const user = await userModel.findOne({ email: userEmail }); 
        if (!user) {
            return res.status(404).send("user not found");
        }
        res.render("userDashboard", {title: "user Dashboard", user});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
})

userRouter.get('/signup', (req, res)=>{
    res.render('userSignup', {title:"User Sign up"});
})

// Signup route
userRouter.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Save the new user
        const newUser = new userModel({ email, password: hashedPassword });
        await newUser.save();

        res.render('userLogin', {title:"Start logging in"});
    } catch (error) {
        res.status(500).json({ message: "Error during signup", error });
    }
});

userRouter.get('/login', (req, res)=>{
    res.render('userLogin', {title:"User login"});
})

// Login route
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, JWT_User_Password);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only set secure cookies in production
            maxAge: 3600000 // 1 hour
        })

        res.render('userDashboard', {user});
    } catch (error) {
        res.status(500).json({ message: "Error during login", error });
    }
});

userRouter.get('/purchase', userMiddleware, async (req, res) => {
    const userEmail = req.query.userEmail;  
    res.render('purchase', {title:"purchase a course", userEmail});
})

userRouter.post('/purchase', userMiddleware, async(req, res) => {
    try {
        const { courseId } = req.body;
        const { userEmail } = req.query; // Fixed the query access to userEmail
        const user = await userModel.findOne({ email: userEmail });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const purchase = await purchaseModel.create({
            userId: user._id, // Use _id instead of ObjectId()
            courseId: courseId
        });
        
        await purchase.save();
        res.status(201).json({ message: "Purchase successful", purchase });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred during the purchase process" });
    }
});


userRouter.get('/seeCourses', async (req, res)=>{
    const courses = await courseModel.find({});

    //find every course available
    const userEmail = req.query.userEmail; 
    
    res.render('seeCourses', {title:"See all the courses", courses, userEmail});
})

// Purchases route (protected by JWT)
userRouter.get('/purchases', userMiddleware, async (req, res) => {
    try {
        const userEmail = req.query.userEmail;
        const user = await userModel.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const purchases = await purchaseModel.find({ userId: user._id });

        const courseDetails = await Promise.all(
            purchases.map(async (purchase) => {
                const course = await courseModel.findById(purchase.courseId);
                return {
                    title: course.title,
                    description: course.description,
                    price: course.price,
                };
            })
        );

        res.render('purchases', { userEmail, courseDetails });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while fetching purchases" });
    }
});

userRouter.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the cookie
    res.status(200).json({ message: "Successfully logged out" });
});


module.exports = {
    userRouter
};
