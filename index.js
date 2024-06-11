const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];  //array of admins
let USERS = [];    //array of users
let COURSES = [];   //array of courses

