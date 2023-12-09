const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

const fs = require('fs');

// Setup Multer for file uploads
const storage = multer.memoryStorage(); // This stores the file in memory. You can change this to diskStorage to save to disk.
const upload = multer({ storage: storage });

// Serve static files (HTML, JS, CSS) from a 'public' directory
app.use(express.static('public'));

app.use(express.json());

app.post('/download', upload.single('video'), (req, res) => {
    const url = req.body.url;

    if (!url && !req.file) {
        return res.status(400).send('Please provide a URL or upload a video.');
    }

    if (url && !url.match(/(tiktok\.com|youtube\.com|youtu\.be)/)) {
        return res.status(400).send('Invalid URL');
    }

    // Handle file upload
    if (req.file) {
        // For simplicity, let's save the file from memory to disk
        const fs = require('fs');
        const filePath = 'uploaded_video.' + (req.file.mimetype.split('/')[1] || 'mp4'); // Guessing file extension from mimetype
        fs.writeFileSync(filePath, req.file.buffer);

        // Convert the video to 16kHz audio using ffmpeg
        convertAndExecute(filePath, res);
        return;
    }

    // Download the video using yt-dlp for URL
    exec(`yt-dlp ${url} -o "whisper-bin-x64/downloaded_video.%(ext)s"`, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).send('Error downloading the video');
        }

        console.log('downloaded_video.%(ext)s');

        // Convert the video to 16kHz audio using ffmpeg
        convertAndExecute("downloaded_video.%(ext)s", res);
    });
});

function convertAndExecute(videoPath, res) {
    exec(`cd whisper-bin-x64 && sh ./trans-test.sh`, (err, stdout, stderr) => {
        if (err) {
            return res.status(500).send('Error converting the video to audio');
        }

        console.log('get transcription');

        // Run a placeholder terminal command
        const transcription = fs.readFileSync('whisper-bin-x64/downloaded_video.wav.txt', 'utf8');
        res.send(transcription);
    });
}

app.get('/', function (req, res) {
    console.log("GET /");
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
