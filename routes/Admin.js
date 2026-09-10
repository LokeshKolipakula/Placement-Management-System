const express = require("express");
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const Drive = require("../models/Drive");
const Student = require("../models/Student");
const Application = require("../models/Application");
const adminAuth = require("../middlewares/adminAuth");

const router = express.Router();


router.get("/admin-login", (req, res) => {

    if (req.session.adminId) {
        return res.redirect("/admin-dashboard");
    }

    res.render("admin-login", {
        error: null
    });

});

router.post("/admin-login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const admin =
            await Admin.findOne({ email });

        if (!admin) {

            return res.render(
                "admin-login",
                {
                    error: "Invalid Email"
                }
            );

        }

        const isMatch =
            await bcrypt.compare(
                password,
                admin.password
            );

        if (!isMatch) {

            return res.render(
                "admin-login",
                {
                    error: "Invalid Password"
                }
            );

        }

        req.session.adminId =
            admin._id;

        res.redirect(
            "/admin-dashboard"
        );

    } catch (err) {

        console.log(err);

        res.render(
            "admin-login",
            {
                error:
                    "Something went wrong. Please try again."
            }
        );

    }

});


router.get("/admin-dashboard",adminAuth, async (req, res) => {

    console.log(req.session);

    const totalStudents =
        await Student.countDocuments();

    const activeDrives =
        await Drive.countDocuments({
            status: "Active"
        });

    const selectedStudents =
        await Application.countDocuments({
            status: "Selected"
        });

    const totalApplications =
        await Application.countDocuments();

    const recentDrives =
        await Drive.find()
            .sort({ createdAt: -1 })
            .limit(4);

    res.render("admin-dashboard", {

        totalStudents,

        activeDrives,

        selectedStudents,

        totalApplications,

        recentDrives

    });
});

router.get("/admin/create-drive",adminAuth, (req, res) => {

    res.render("create-drive");

});

router.post("/admin/create-drive",adminAuth, async (req, res) => {

    try {


        const {

            companyName,
            role,
            package,
            location,
            eligibleBranches,
            minCGPA,
            maxBacklogs,
            driveDate,
            applicationDeadline,
            description

        } = req.body;

        const drive = new Drive({

            companyName,

            role,

            package,

            location,

            eligibleBranches:
                eligibleBranches
                    .split(",")
                    .map(branch => branch.trim()),

            minCGPA,

            maxBacklogs,

            driveDate,

            applicationDeadline,

            description

        });

        await drive.save();

        res.redirect("/admin/drives");

    } catch (err) {

        console.log(err);

        res.status(500).send(
            "Error creating drive"
        );

    }

});

router.get("/admin/drives",adminAuth, async (req, res) => {

    const drives = await Drive.find();

    const activeDrives =
        drives.filter(
            d => d.status === "Active"
        ).length;

    const closedDrives =
        drives.filter(
            d => d.status === "Closed"
        ).length;

    res.render("admin-drives", {

        drives,
        activeDrives,
        closedDrives

    });

});

router.get("/admin/edit-drive/:id",adminAuth, async (req, res) => {

    const drive =
        await Drive.findById(req.params.id);

    if (!drive) {
        return res.send("Drive not found");
    }

    res.render("edit-drive", {
        drive
    });

});

router.post("/admin/edit-drive/:id",adminAuth, async (req, res) => {

    const {

        companyName,
        role,
        package,
        location,
        eligibleBranches,
        minCGPA,
        maxBacklogs,
        driveDate,
        applicationDeadline,
        description,
        status

    } = req.body;

    await Drive.findByIdAndUpdate(

        req.params.id,

        {

            companyName,
            role,
            package,
            location,

            eligibleBranches:
                eligibleBranches
                    .split(",")
                    .map(branch => branch.trim()),

            minCGPA,
            maxBacklogs,
            driveDate,
            applicationDeadline,
            description,
            status

        }

    );

    res.redirect("/admin/drives");

});

router.get("/admin/delete-drive/:id",adminAuth, async (req, res) => {

    const drive =
        await Drive.findById(req.params.id);

    if (!drive) {
        return res.send("Drive not found");
    }

    res.render("delete-drive", {
        drive
    });

});

router.post("/admin/delete-drive/:id", adminAuth,async (req, res) => {

    await Drive.findByIdAndDelete(
        req.params.id
    );

    res.redirect("/admin/drives");

});

router.get("/admin/manage-students",adminAuth, async (req, res) => {

    const students =
        await Student.find();

    res.render(
        "manage-students",
        { students }
    );
});


router.get("/admin/edit-student/:id",adminAuth, async (req, res) => {

    const student =
        await Student.findById(req.params.id);

    res.render(
        "edit-student",
        { student }
    );

});

router.post("/admin/edit-student/:id",adminAuth, async (req, res) => {

    await Student.findByIdAndUpdate(

        req.params.id,

        {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            branch: req.body.branch,
            cgpa: req.body.cgpa,
            tenthPercentage: req.body.tenthPercentage,
            twelfthPercentage: req.body.twelfthPercentage,
            backlogs: req.body.backlogs,
            placementStatus: req.body.placementStatus
        }

    );

    res.redirect("/admin/manage-students");

});


router.get("/admin/delete-student/:id", adminAuth,async (req, res) => {
    const student =
        await Student.findById(req.params.id);

    if (!student) {
        return res.send("Student not found");
    }

    res.render("delete-student", {
        student
    });

});

router.post("/admin/delete-student/:id",adminAuth, async (req, res) => {

    try {

        await Student.findByIdAndDelete(
            req.params.id
        );

        res.redirect(
            "/admin/manage-students"
        );

    } catch (err) {

        console.log(err);

        res.status(500).send(
            "Error deleting student"
        );

    }

});

router.get("/admin/applications", adminAuth,async (req, res) => {

    const {
        status,
        company,
        sort
    } = req.query;

    let applications =
        await Application.find()
            .populate("student")
            .populate("drive");

    // Filter By Status

    if (status && status !== "All") {

        applications = applications.filter(
            app => app.status === status
        );

    }

    // Filter By Company

    if (company && company !== "All") {

        applications = applications.filter(
            app =>
                app.drive &&
                app.drive.companyName === company
        );

    }

    // Sort By CGPA

    if (sort === "high") {

        applications.sort(
            (a, b) =>
                b.student.cgpa - a.student.cgpa
        );

    }

    if (sort === "low") {

        applications.sort(
            (a, b) =>
                a.student.cgpa - b.student.cgpa
        );

    }

    // Statistics

    const totalApplications =
        applications.length;

    const appliedCount =
        applications.filter(
            app => app.status === "Applied"
        ).length;

    const selectedCount =
        applications.filter(
            app => app.status === "Selected"
        ).length;

    const rejectedCount =
        applications.filter(
            app => app.status === "Rejected"
        ).length;

    // Companies for dropdown

    const companies =
        [...new Set(
            applications.map(
                app => app.drive.companyName
            )
        )];

    res.render(
        "admin-applications",
        {
            applications,
            companies,
            totalApplications,
            appliedCount,
            selectedCount,
            rejectedCount
        }
    );

});

router.post(
    "/admin/application/:id/accept",
    adminAuth,
    async (req, res) => {

        const application =
            await Application.findByIdAndUpdate(

                req.params.id,

                {
                    status: "Selected"
                },

                {
                    new: true
                }

            );

        await Student.findByIdAndUpdate(

            application.student,

            {
                placementStatus: "Placed"
            }

        );

        res.redirect(
            "/admin/applications"
        );

    }
);

router.post(
    "/admin/application/:id/reject",
    adminAuth,
    async (req, res) => {

        const application =
            await Application.findByIdAndUpdate(

                req.params.id,

                {
                    status: "Rejected"
                },

                {
                    new: true
                }

            );

        await Student.findByIdAndUpdate(

            application.student,

            {
                placementStatus: "Not Placed"
            }

        );

        res.redirect(
            "/admin/applications"
        );

    }
);

router.get("/admin/applicants/:id",adminAuth, async (req, res) => {

    const drive = await Drive.findById(
        req.params.id
    );

    const applications = await Application.find({
        drive: req.params.id
    }).populate("student");

    res.render("drive-applicants", {
        drive,
        applications
    });

});

router.get("/admin/logout", adminAuth,(req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Logout Failed");
        }

        res.redirect("/admin-login");

    });

});
module.exports = router;