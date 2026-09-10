const express = require("express");
const bcrypt = require("bcrypt");
const Student = require("../models/Student");
const upload = require("../config/multer");
const Drive = require("../models/Drive");
const Application = require("../models/Application");
const studentAuth = require("../middlewares/studentAuth");

const fs = require("fs");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");


const router = express.Router();

router.get("/student-login", (req, res) => {

    if (req.session.studentId) {
        return res.redirect("/student-dashboard");
    }

    res.render("student-login", {
        error: null
    });

});

router.post("/student-login", async (req, res) => {

    const { email, password } = req.body;

    const student =
        await Student.findOne({ email });

    if (!student) {

        return res.render(
            "student-login",
            {
                error: "Invalid / Not Registered Email"
            }
        );

    }

    const isMatch =
        await bcrypt.compare(
            password,
            student.password
        );

    if (!isMatch) {

        return res.render(
            "student-login",
            {
                error: "Invalid Password"
            }
        );

    }

    req.session.studentId =
        student._id;

    res.redirect(
        "/student-dashboard"
    );

});

router.get("/student-register", (req, res) => {
    res.render("student-register");
});

router.post("/student-register", async (req, res) => {

    try {

        const {
            name,
            regNo,
            email,
            branch,
            cgpa,
            password,
            confirmPassword
        } = req.body;

        if (password !== confirmPassword) {
            return res.send("Passwords do not match");
        }

        const existingStudent =
            await Student.findOne({
                $or: [
                    { email },
                    { regNo }
                ]
            });

        if (existingStudent) {
            return res.send(
                "Student already exists"
            );
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const student =
            await Student.create({

                name,
                regNo,
                email,
                branch,
                cgpa,
                password:
                    hashedPassword

            });

        req.session.studentId =
            student._id;

        res.redirect(
            "/student-dashboard"
        );

    } catch (err) {

        console.log(err);

        res.status(500)
            .send("Server Error");
    }
});

router.get("/student-dashboard", async (req, res) => {

    if (!req.session.studentId) {
        return res.redirect("/student-login");
    }

    const student = await Student.findById(
        req.session.studentId
    );

    // Eligible Drives

    const drives = await Drive.find({
        status: "Active"
    });

    let eligibleDrives = 0;

    for (const drive of drives) {

        const studentBranch =
            student.branch.trim().toUpperCase();

        const eligibleBranches =
            drive.eligibleBranches.map(
                branch => branch.trim().toUpperCase()
            );

        const isEligible =
            Number(student.cgpa) >= Number(drive.minCGPA) &&
            Number(student.backlogs) <= Number(drive.maxBacklogs) &&
            eligibleBranches.includes(studentBranch);

        if (isEligible) {
            eligibleDrives++;
        }
    }

    // Applications

    const applications =
        await Application.find({
            student: student._id
        }).populate("drive");

    const appliedCount =
        applications.length;

    const selectedCount =
        applications.filter(
            app => app.status === "Selected"
        ).length;

    const pendingCount =
        applications.filter(
            app =>
                app.status === "Applied" ||
                app.status === "Shortlisted"
        ).length;

    // Latest Drives

    const latestDrives =
        await Drive.find({
            status: "Active"
        })
            .sort({ createdAt: -1 })
            .limit(4);

    res.render("student-dashboard", {

        student,

        eligibleDrives,

        appliedCount,

        selectedCount,

        pendingCount,

        latestDrives

    });

});

router.get("/student/profile", studentAuth, async (req, res) => {

    const student = await Student.findById(
        req.session.studentId
    );

    const success =
        req.session.success;

    req.session.success = null;

    res.render("student-profile", {
        student,
        success
    });

});

router.post("/student/profile", studentAuth, async (req, res) => {

    const {

        name,
        branch,
        cgpa,
        phone,
        tenthPercentage,
        twelfthPercentage,
        skills,
        backlogs

    } = req.body;

    await Student.findByIdAndUpdate(

        req.session.studentId,

        {

            name,
            branch,
            cgpa,
            phone,
            tenthPercentage,
            twelfthPercentage,
            skills,
            backlogs

        }

    );

    req.session.success =
        "Profile updated successfully";

    res.redirect("/student/profile");

});


router.get("/student/upload-resume", studentAuth, async (req, res) => {

    const student = await Student.findById(
        req.session.studentId
    );

    res.render("upload-resume", {
        student
    });
});

router.post(
    "/student/upload-resume",
    studentAuth,
    upload.single("resume"),
    async (req, res) => {

        try {

            if (!req.file) {
                return res.send("Please upload a PDF resume");
            }

            console.log(req.file.path);

            // Get current student first
            const student = await Student.findById(
                req.session.studentId
            );

            if (!student) {
                return res.status(404).send("Student not found");
            }

            // Delete previous resume from Cloudinary
            if (student.resumePublicId) {

                await cloudinary.uploader.destroy(
                    student.resumePublicId,
                    {
                        resource_type: "raw"
                    }
                );

            }

            // Upload new resume
            const result = await cloudinary.uploader.upload(
                req.file.path,
                {
                    folder: "placement-resumes",
                    resource_type: "raw"
                }
            );

            console.log(result);

            // Save Cloudinary details in MongoDB
            student.resume = result.secure_url;
            student.resumePublicId = result.public_id;

            await student.save();

            // Delete temporary local PDF
            fs.unlinkSync(req.file.path);

            res.redirect("/student-dashboard");

        } catch (err) {

            console.log("UPLOAD ERROR:");
            console.dir(err, { depth: null });

            res.status(500).send(
                "Error uploading resume"
            );

        }

    }
);

router.get("/student/drives", studentAuth, async (req, res) => {
    console.log("Apply route hit");

    try {
        const student =
            await Student.findById(
                req.session.studentId
            );

        const drives =
            await Drive.find({
                status: "Active"
            });

        const eligibleDrives = [];

        for (const drive of drives) {

            const studentBranch =
                student.branch.trim().toUpperCase();

            const eligibleBranches =
                drive.eligibleBranches.map(
                    branch => branch.trim().toUpperCase()
                );

            const isEligible =
                Number(student.cgpa) >= Number(drive.minCGPA) &&
                Number(student.backlogs) <= Number(drive.maxBacklogs) &&
                eligibleBranches.includes(studentBranch);

            console.log("Student:", {
                branch: student.branch,
                cgpa: student.cgpa,
                backlogs: student.backlogs
            });

            console.log("Drive:", {
                branches: drive.eligibleBranches,
                minCGPA: drive.minCGPA,
                maxBacklogs: drive.maxBacklogs
            });

            console.log("Eligible:", isEligible);

            if (isEligible) {

                const alreadyApplied = await Application.findOne({
                    student: student._id,
                    drive: drive._id
                });

                eligibleDrives.push({
                    ...drive.toObject(),
                    eligible: true,
                    applied: !!alreadyApplied
                });
            }
        }

        res.render("student-drives", {

            student,

            drives: eligibleDrives,

            eligibleCount:
                eligibleDrives.length

        });

    } catch (err) {

        console.log(err);

        res.send("Error loading drives");

    }
});

router.get("/student/apply/:id", studentAuth, async (req, res) => {

    try {

        const existing =
            await Application.findOne({

                student: req.session.studentId,

                drive: req.params.id

            });

        if (existing) {

            return res.redirect(
                "/student/drives"
            );

        }

        await Application.create({

            student: req.session.studentId,

            drive: req.params.id

        });

        res.redirect(
            "/student/drives"
        );

    } catch (err) {

        console.log(err);

        res.send("Application Error");

    }

});

router.get("/student/applications", studentAuth, async (req, res) => {

    const applications =
        await Application.find({

            student: req.session.studentId

        }).populate("drive");

    res.render(
        "student-applications",
        { applications }
    );

});

router.get("/student/logout", studentAuth, (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Logout Failed");
        }

        res.redirect("/student-login");

    });

});

module.exports = router;    