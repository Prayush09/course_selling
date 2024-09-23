const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userModel, purchaseModel } = require("../db");
const {JWT_User_Password} = require("../config")
const SALT_ROUNDS = 10;
const { userMiddleware } = require("../middleware/userMiddleware")
const userRouter = Router();


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

        res.status(201).json({ message: "Signup successful" });
    } catch (error) {
        res.status(500).json({ message: "Error during signup", error });
    }
});

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

        res.json({ token, message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "Error during login", error });
    }
});

// Purchases route (protected by JWT)
userRouter.get('/purchases', userMiddleware, async (req, res) => {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId
    })

    res.send({
        purchases
    })
});

module.exports = {
    userRouter
};
