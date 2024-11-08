# Course Selling App

## Project Overview

This project is a full-stack course selling application where users can sign up, log in, purchase courses, and view them. Admins can manage course content, including adding, deleting, and updating courses. The backend is built using Node.js, Express, and MongoDB, with authentication handled by JWT. The app is live and can be accessed at:
https://course-selling-app-w9qf.onrender.com
[**Live Application**](https://course-selling-app-w9qf.onrender.com)


## Features

### User Functionality:
- **User Signup**: Users can create an account by signing up.
- **User Login**: Secure login system using JWT for authentication.
- **Course Purchase**: Users can browse available courses and purchase them.
- **View Purchased Courses**: Users can view courses they have purchased.

### Admin Functionality:
- **Admin Signup & Login**: Admins can create and log into their accounts.
- **Course Management**: Admins can create new courses, delete existing ones, and manage course content.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose for ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Environment Variables**: dotenv for secure database connection strings

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Prayush09/course_selling.git
   cd course_selling
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file in the root directory with the following:
   ```plaintext
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Access the application at `http://localhost:3000`.

## API Endpoints

### User Routes
- **POST /user/signup**: Register a new user.
- **POST /user/login**: Log in a user and get a JWT.
- **GET /user/courses**: View purchased courses.
- **POST /user/purchase/:courseId**: Purchase a course.

### Admin Routes
- **POST /admin/signup**: Register a new admin.
- **POST /admin/login**: Log in an admin.
- **POST /admin/course**: Create a new course.
- **DELETE /admin/course/:courseId**: Delete a course.
- **PUT /admin/course/:courseId**: Update course content.

## Database Models

- **User**: Contains user information and a list of purchased courses.
- **Admin**: Contains admin credentials.
- **Course**: Stores course details like title, description, price, and content.
- **Purchase**: Tracks the courses purchased by users.

## Middleware

- **User Auth Middleware**: Verifies user JWTs for protected routes.
- **Admin Auth Middleware**: Verifies admin JWTs for admin-specific routes.

## Front-End

The front-end and back-end are both live and can be accessed at:  
[**Live Application**](https://course-selling-app-w9qf.onrender.com)

## Future Enhancements
- Add course rating and review system.
- Enhance the UI/UX.
- Add payment gateway integration for secure payments.

