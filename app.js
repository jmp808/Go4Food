const express = require('express');
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
require("dotenv").config();

const app = express();


app.set('view engine', 'html')
app.use(express.static('public'))

app.listen(3000)
