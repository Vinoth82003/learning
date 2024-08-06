const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route to handle IP and location
app.get("/api/location", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  try {
    const response = await axios.get(`https://ipinfo.io/${ip}/json`);
    res.json(response.data);
    console.log(response.data);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch location" });
  }
});

// Route to handle file upload
app.post("/api/upload", upload.single("selfie"), (req, res) => {
  res.json({ filePath: req.file.path });
});

// Route to display all uploaded images
app.get("/view", (req, res) => {
  const uploadsDir = path.join(__dirname, "uploads");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Unable to read uploads directory" });
    }

    const images = files
      .map(
        (file) =>
          `<img src="/uploads/${file}" alt="${file}" style="width:200px;height:auto;display:block;margin-bottom:10px;">`
      )
      .join("");
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Uploaded Images</title>
      </head>
      <body>
        <h1>Uploaded Images</h1>
        ${images}
      </body>
      </html>
    `);
  });
});

// Serve the index.html file for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://192.168.0.116:${port}`);
});
