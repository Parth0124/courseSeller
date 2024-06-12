const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const mongoose = require('mongoose');  //library that lets u connect to mongodb databases

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secret = "keyForEncryption"; 

//mongoose schemas
const userSchema = new mongoose.Schema({
    username: Strin,
    password: String,
    purchasedCourses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Course'}]
});

const adminSchema = new mongoose.Schema({
    username: String,
    password: string 
});

const courseSchema = new mongoose.Schema({
    title: string,
    description: string,
    price: Number,
    imageLink: string,
    duration: string  
})

//mongoose models

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Course = mongoose.model("Course", courseSchema);

const generateJwt = (user) => {
    const payload = { username: user.username };
    return jwt.sign(payload, secret, { expiresIn: '1h' });
};

const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, secret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

app.post('/admins/signup', (req, res) => {
    const admin = req.body;
    const existingAdmin = ADMINS.find(a => a.username === admin.username);
    if (existingAdmin) 
    {
        res.status(403).json({ message: "Admin already exists" });
    } 
    else 
    {
        ADMINS.push(admin);
        const token = generateJwt(admin);
        res.json({ message: "Admin created successfully", token });
    }
});

app.post('/admins/login', (req, res) => {
    const { username, password } = req.headers;
    const admin = ADMINS.find(a => a.username === username && a.password === password);
    if (admin) {
        const token = generateJwt(admin);
        res.json({ message: "Admin logged in successfully", token });
    } 
    else 
    {
        res.status(403).json({ message: "Admin authentication failed" });
    }
});

app.post('/admins/courses', authenticateJwt, (req, res) => {
    const course = req.body;
    console.log("The course of " + course.title + " was added by " + req.user.username) //gives back the username of the admin that added the course
    COURSES.push({ ...course, id: COURSES.length + 1 });
    res.json({ message: "Course created successfully", courseId: COURSES.length });
});

app.put('/admins/courses/:courseId', authenticateJwt, (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const courseIndex = COURSES.findIndex(c => c.id === courseId);
    if (courseIndex > -1) 
    {
        const updatedCourse = { ...COURSES[courseIndex], ...req.body };
        COURSES[courseIndex] = updatedCourse;

        console.log(`The course titled "${updatedCourse.title}" was updated by ${req.user.username}`);
        res.json({ message: "Course updated successfully" });
    } 
    else 
    {
        res.status(404).json({ message: "Course not found" });
    }
});


app.get('/admins/courses', authenticateJwt, (req, res) => {
    res.json({ courses: COURSES });
});

app.post('/users/signup', (req, res) => {
    const user = { ...req.body, purchasedCourses: [] };
    const existingUser = USERS.find(u => u.username === req.body.username)
    if(existingUser)
    {
        res.json({message: "User already exists."});
    }
    else
    {
        USERS.push(user);
        const token = generateJwt(user);
        res.json({ message: "User created successfully", token });
    }
});

app.post('/users/login', (req, res) => {
    const {username, password} = req.headers;
    const user = USERS.find(u => u.username === username && u.password === password)
    if(user)
    {
        const token = generateJwt(user);
        res.json({message: "User logged in successfully", token})
    }
});

app.post('/users/courses/:courseId', authenticateJwt, (req, res) => {
    const courseId = Number(req.params.courseId);
    const course = COURSES.find(c => c.id === courseId);
    if (course) 
    {
        // Find the user in the USERS array and update their purchased courses
        const userIndex = USERS.findIndex(u => u.username === req.user.username);
        if (userIndex !== -1) 
        {
            USERS[userIndex].purchasedCourses.push(courseId);

            // Log the course title and the username of the user who purchased it
            console.log(`The course titled "${course.title}" was purchased by ${req.user.username}`);

            res.json({ message: "Course purchased successfully" });
        } 
        else 
        {
            res.status(404).json({ message: "User not found" });
        }
    } else {
        res.status(404).json({ message: "Course not found or not published" });
    }
});


app.get('/users/purchasedCourses', authenticateJwt, (req, res) => {
    const user = USERS.find(u => u.username === req.user.username);
    if (user) {
        const purchasedCourses = COURSES.filter(course => user.purchasedCourses.includes(course.id));
        res.json({ courses: purchasedCourses });
    } else {
        res.status(404).json({ message: "User not found" });
    }
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
