const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secret = "keyForEncryption";

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

const userAuthentication = (req, res, next) => {
    const { username, password } = req.headers;
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
        req.user = user;
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
    } else {
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
    const courseId = parseInt(req.params.courseId); // Correct usage of parseInt
    const courseIndex = COURSES.findIndex(c => c.id === courseId);
    if (courseIndex > -1) {
        const updatedCourse = { ...COURSES[courseIndex], ...req.body };
        COURSES[courseIndex] = updatedCourse;
        res.json({ message: "Course updated successfully" });
    } else {
        res.status(404).json({ message: "Course not found" });
    }
});

app.get('/admins/courses', authenticateJwt, (req, res) => {
    res.json({ courses: COURSES });
});

app.post('/users/signup', (req, res) => {
    const user = { ...req.body, purchasedCourses: [] };
    USERS.push(user);
    res.json({ message: "User created successfully" });
});

app.post('/users/login', userAuthentication, (req, res) => {
    res.json({ message: "User logged in successfully" });
});

app.post('/users/courses/:courseId', userAuthentication, (req, res) => {
    const courseId = Number(req.params.courseId);
    const course = COURSES.find(c => c.id === courseId);
    if (course) {
        req.user.purchasedCourses.push(courseId);
        res.json({ message: "Course purchased successfully" });
    } else {
        res.status(404).json({ message: "Course not found or not published" });
    }
});

app.get('/users/purchasedCourses', userAuthentication, (req, res) => {
    const purchasedCourses = COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
    res.json({ purchasedCourses });
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
