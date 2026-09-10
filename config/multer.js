const multer = require("multer");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/resumes");

    },

    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() + "-" + file.originalname
        );

    }

});

const fileFilter = (req, file, cb) => {

    if (file.mimetype === "application/pdf") {

        cb(null, true);

    } else {

        cb(
            new Error("Only PDF files are allowed"),
            false
        );

    }

};

module.exports = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});