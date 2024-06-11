const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];  // array of admins
let USERS = [];   // array of users
let COURSES = []; // array of courses

const adminAuthentication = (req, res, next) => {
    const { username, password } = req.headers;
    const admin = ADMINS.find(a => a.username === username && a.password === password);
    if (admin) {
        next();
    } else {
        res.status(403).json({ message: "Admin authentication failed." });
    }
};

const userAuthentication = (req, res, next) => {
    const { username, password } = req.headers;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
        req.user = user; // add user object to the request
        next();
    } else {
        res.status(403).json({ message: "User authentication failed." });
    }
};

app.post('/admins/signup', (req, res) => {
    const admin = req.body;
    const existingAdmin = ADMINS.find(a => a.username === admin.username);
    if (existingAdmin) {
        res.status(403).json({ message: "Admin already exists" });
    } else {
        ADMINS.push(admin);
        res.json({ message: "Admin created successfully" });
    }
});

app.post('/admins/login', adminAuthentication, (req, res) => {
    res.json({ message: "Logged in successfully" });
});

app.post('/admins/courses', adminAuthentication, (req, res) => {
    const course = req.body;
    if (!course.title || !course.description || !course.duration || !course.price || !course.gallery) {
        res.status(411).send({ message: "Missing details of the course" });
    } else {
        course.id = Date.now(); // using timestamp as courseID
        course.published = course.published || false; // Ensure the published field is set
        COURSES.push(course);
        res.json({ message: "Course successfully created", course });
    }
});

app.put('/admins/courses/:courseId', adminAuthentication, (req, res) => {
    const courseId = Number(req.params.courseId);
    const course = COURSES.find(c => c.id === courseId);
    if (course) {
        Object.assign(course, req.body);
        res.json({ message: "Course updated successfully" });
    } else {
        res.status(404).json({ message: "Course not found" });
    }
});

app.get('/admins/courses', adminAuthentication, (req, res) => {
    res.json({ courses: COURSES });
});

app.post('/users/signup', (req, res) => {
    const user = { ...req.body, purchasedCourses: [] }; // Ensure req.body has username and password
    USERS.push(user);
    res.json({ message: "User created successfully" });
});

app.post('/users/login', userAuthentication, (req, res) => {
    res.json({ message: "User logged in successfully" });
});

app.post('/users/courses/:courseId', userAuthentication, (req, res) => {
    const courseId = Number(req.params.courseId); // Correct capitalization
    const course = COURSES.find(c => c.id === courseId);
    if (course) {
        req.user.purchasedCourses.push(courseId);
        res.json({ message: "Course purchased successfully" });
    } else {
        res.status(404).json({ message: "Course not found or not published" });
    }
});

app.get('/users/purchasedCourses', userAuthentication, (req, res) => { // Corrected route
    const purchasedCourses = COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
    res.json({ purchasedCourses });
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
