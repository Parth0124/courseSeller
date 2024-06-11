const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];  //array of admins
let USERS = [];    //array of users
let COURSES = [];   //array of courses

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

app.post('/admin/login',  adminAuthentication, (req,res) => {
    res.json({message: "Logged in successfully"});
});

app.listen(3000);