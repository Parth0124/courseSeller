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

//connect to mongodb
mongoose.connect('mongodb+srv://Parth0124:22bcs080@cluster0.z5z6ph1.mongodb.net/', {useNewUrlParser: true, useUnifiedTopology: true});

app.post('/admins/signup', async(req, res) => {
    const {username, password} = req.body;
    const admin = await Admin.findOne({username})
    if (admin) 
    {
        res.status(403).json({ message: "Admin already exists" });
    } 
    else 
    {
        const newAdmin = new Admin({username,password});
        await newAdmin.save()
        const token = generateJwt(admin);
        res.json({ message: "Admin created successfully", token });
    }
});

app.post('/admins/login', async(req, res) => {
    const { username, password } = req.headers;
    const admin = await Admin.findOne({username, password});
    if (admin) {
        const token = jwt.sign({username, role: 'admin'}, secret, {expiresIn: '1h'});
        res.json({ message: "Admin logged in successfully", token });
    } 
    else 
    {
        res.status(403).json({ message: "Admin authentication failed" });
    }
});

app.post('/admins/courses', authenticateJwt, async(req, res) => {
    const course = new Course (req.body);
    console.log("The course of " + course.title + " was added by " + req.user.username) //gives back the username of the admin that added the course
    await course.save();
    res.json({ message: "Course created successfully", courseId: COURSES.length });
});

app.put('admin/courses/:courseId', authenticateJwt, async(req,res) => {
    const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, {new:true});
    if(course)
    {
        console.log(`The course titled "${updatedCourse.title}" was updated by ${req.user.username}`);
        res.json({ message: "Course updated successfully" });
    }
    else
    {
        res.status(404).json({message: "Course not found"});
    }
})


app.get('/admins/courses', authenticateJwt, async(req, res) => {
    const courses = await Course.find({});
    res.json({ courses });
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
