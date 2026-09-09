const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Student = require("./models/Student");

async function encryptStudentPasswords() {
    try {

        await mongoose.connect(process.env.MONGO_URL);

        console.log("MongoDB Connected");

        const students = await Student.find();

        for (const student of students) {

            // Skip already hashed passwords
            if (student.password.startsWith("$2b$")) {
                console.log(`${student.email} already encrypted`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(
                student.password,
                10
            );

            student.password = hashedPassword;

            await student.save();

            console.log(
                `Password updated for ${student.email}`
            );
        }

        console.log("All student passwords updated");

        process.exit();

    } catch (err) {

        console.error(err);

        process.exit(1);
    }
}

encryptStudentPasswords();