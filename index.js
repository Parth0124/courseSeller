const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];  //array of admins
let USERS = [];    //array of users
let COURSES = [];   //array of courses

const adminAuthentication = (req,res,next) => {
    const { username, password } = req.headers;
    const admin = ADMINS.find(a => a.username === username && a.password === password)
    if(admin)
        {
            next();
        }
        else
        {
            res.status(403).json({message: "Admin authentication failed."})
        }
};

const userAuthentication = (req,res,next) => {
    const { username,password } = req.headers; //const username = req.headers.username and const password = req.headers.password
    const user = USERS.find(u => u.username === username && u.password === password)
    if(user)
        {
            req.user= user; //add user object to the request
            next();
        }
        else
        {
            res.status(403).json({message: "User authentication failed."})
        }
};

app.post('/admin/signup', (req, res) => {
    const admin = req.body;
    const existingAdmin = ADMINS.find(a => a.username === admin.username);
    if (existingAdmin) 
        {
        res.status(403).json({ message: "Admin already exists" });
        } 
    else {
        ADMINS.push(admin);
        res.json({ message: "Admin created successfully" });
        }
});

app.post('/admin/login',  adminAuthentication, (req,res) => {  //adminAuthentication is a midleware specific and exclusive only for login route. it is a route specific middleware which are sent right before the arrow fucntions or callback functions.
    res.json({message: "Logged in successfully"});
});

app.get('admin', adminAuthentication, (req,res) => {
    res.json({admin_list: ADMINS })
})

app.post('/admin/courses', adminAuthentication, (req,res) => {
    const course = req.body;
    if(!course.title || !course.description || !course.duration || !course.price || !course.gallery)
    {
         res.status(411).send({message: "Missing details of the course"});
    }
    else
    {
        course.id = Date.now(); //using timestammp as courseID
        COURSES.push(course);
        res.json({message: "Course successfully created", courseId: course.id, courseTitle: course.title, courseDescription: course.description, courseDuration: course.duration, coursePrice: course.price, courseImage: course.gallery});
    }
});

app.put('/admin/courses/:courseId', adminAuthentication, (req,res) => {
    const courseId = Number(req.params.courseId);
    const course = COURSES.find(c => c.id === courseId);
    if(course)
        {
            Object.assign(course,req.body);
            res.json({message: "Course Updated Successfully"})
        }
    else
        {
            res.status(404).json({message: "Course not found"})
        }
});

app.get('/admin/courses', adminAuthentication, (req,res) => {
    res.json({courses: COURSES})
})

app.post('users/signup', (req,res) => {
    const user = {...req.body, purchasedCourses:[]};  //this is line is same as username:req.body.username and password: req.body.passwrod
    USERS.push(user);
    res.json({message: "User created successfully"})
});

app.post ('users/login', userAuthentication, (req,res) => {
    res.json({message: "User logged in successfully"})
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000")
});



// {
//     "title" : "MERN Stack Development",
//     "description" : "Complete MERN Stack web app building and deploying",
//     "duration" : "3 months",
//     "price" : "$56",
//     "gallery" : "data:image/jpeg;base64,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"
// }

// {
//     "username" : "abhangparth@gmail.com",
//     "password" : "123456"
// }