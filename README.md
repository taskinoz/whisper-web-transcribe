# Whisper Web Transcribe

## Setup

1. Download whisper.cpp and extract it to `./whisper-bin-x64`
2. Download [ffmpeg](https://ffmpeg.org/download.html) and extract it to the root of the project
3. Download yt-dlp and also extract it to the root of the project
4. Run `npm install` to install dependencies
5. Run `node index.js` to start the server
6. Open `localhost:3000` in your browser

## Usage

1. Enter a YouTube/TikTok video URL or upload a video file
2. Wait for the video to be processed
3. You will recieve the transcribed text in the text box

## To-Do

- [ ] Incorporate [ffmpeg](https://ffmpeg.org/download.html) into the project using the node module
- [ ] Add yt-dlp to the project
- [ ] Clean up bash scripts and turn them into node scripts
- [ ] Clean up file structure for downloads
- [ ] Add instructions or scripts to download whisper.cpp