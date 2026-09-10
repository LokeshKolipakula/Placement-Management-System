require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

const adminRoutes = require("./routes/Admin");
const studentRoutes = require("./routes/Student");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);

app.use(
    "/uploads",
    express.static("uploads")
);


app.get("/", (req, res) => {
    res.render("main");
});

app.get("/login-selection", (req, res) => {
    res.render("login-selection");
});


const cloudinary = require("./config/cloudinary");

app.get("/cloudinary-test", async (req, res) => {
    try {
        const result = await cloudinary.api.ping();
        res.send(result);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

// Routes
app.use(adminRoutes);
app.use(studentRoutes);

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Error while logging out");
        }

        res.redirect("/");
    });

});

// 404 Page
app.use((req,res)=>{
    res.status(404).render("404");
});

// 500 Page
app.use((err,req,res,next)=>{

    console.error(err);

    res.status(500).render("500",{
        message: err.message
    });

});

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("MongoDB Atlas connected");
})
.catch((err) => {
    console.log(err);
});

app.listen(8080,()=>{
    console.log("Server running on port 8080");
});