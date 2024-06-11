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
}

const userAuthentication = (req,res,next) => {
    const { username,password } = req.headers;
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
}

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

app.listen(3000);