const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const ytdlp = require('ytdlp-nodejs');
const Ffmpeg = require('fluent-ffmpeg');

const app = express();
const port = process.env.PORT || 3000;

// Setup Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files from 'public' directory
app.use(express.static('public'));
app.use(express.json());

app.post('/download', upload.single('video'), async (req, res) => {
    try {
        const url = req.body.url;
        if (!url && !req.file) {
            return res.status(400).send('Please provide a URL or upload a video.');
        }

        if (url && !isValidURL(url)) {
            return res.status(400).send('Invalid URL');
        }

        if (req.file) {
            await handleFileUpload(req, res);
        } else {
            await downloadAndConvert(url, res);
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

function isValidURL(url) {
    return url.match(/(tiktok\.com|youtube\.com|youtu\.be)/);
}

async function handleFileUpload(req, res) {
    const fileExtension = req.file.mimetype.split('/')[1] || 'mp4';
    const filePath = path.join(__dirname, 'uploads', `uploaded_video.${fileExtension}`);

    try {
        fs.writeFileSync(filePath, req.file.buffer);
        await convertAndExecute(filePath, res);
    } catch (err) {
        console.error('Error handling file upload:', err);
        res.status(500).send('Error processing uploaded file');
    }
}

async function downloadAndConvert(url, res) {
    try {
        const outputFilePath = path.join(__dirname, 'whisper-bin-x64', 'downloaded_video.mp3');

        ytdlp.download(url, {
            filter: 'audioonly',
            output: {
                fileName: 'downloaded_video.mp3',
                outDir: path.join(__dirname, 'whisper-bin-x64'),
            },
        }).on("progress", (info) => {
            console.log("Download progress:", info);
        }).on("finished", (info) => {
            console.log("Download finished");
            convertAndExecute(outputFilePath, res);
        }).on("error", (err) => {
            console.error("Download error:", err);
            res.status(500).send('Error downloading the video');
        });
    } catch (err) {
        console.error('Error downloading and converting video:', err);
        res.status(500).send('Error processing video download');
    }
}

function convertAndExecute(videoPath, res) {
    const outputAudioPath = path.join(__dirname, 'whisper-bin-x64', 'input.wav');
    const ffmpeg = new Ffmpeg(videoPath);

    ffmpeg
        .noVideo() // Extract audio only
        .audioCodec('pcm_s16le') // Set audio codec to pcm_s16le
        .audioFrequency(16000) // Set audio sample rate to 16000 Hz
        .audioChannels(2) // Set audio to stereo (2 channels)
        .on('error', (err) => {
            console.error('FFmpeg error:', err);
            res.status(500).send('Error converting the video');
        })
        .on('end', () => {
            executeWhisper(outputAudioPath, res);
        })
        .save(outputAudioPath);
}

function executeWhisper(audioPath, res) {
    const command = `cd whisper-bin-x64 && main.exe -m ggml-base.bin -f "${audioPath}" --output-txt output.txt`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error('Execution error:', err);
            return res.status(500).send('Error executing the whisper binary');
        }

        // wait till the output file is created
        const outputFilePath = path.join(__dirname, 'whisper-bin-x64', 'output.txt');
        const timeout = 1000;
        let elapsedTime = 0;
        const interval = setInterval(() => {
            elapsedTime += timeout;
            if (fs.existsSync(outputFilePath)) {
                clearInterval(interval);
                const outputText = fs.readFileSync(outputFilePath, 'utf8');
                console.log(outputText);
                return res.status(200).send(outputText);
            }

            if (elapsedTime >= 100000) {
                clearInterval(interval);
                return res.status(500).send('Error processing the audio');
            }
        }, timeout);

        console.log(stdout);
    });
}
