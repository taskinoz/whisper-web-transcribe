#!/bin/bash

# Prompt the user for the video name
# read -p "Enter the video filename (including the extension): " video_name

# Remove the file extension from the video name
video_name="downloaded_video.mp4"
video_name_no_ext="downloaded_video"

# Clear previous results
rm -rf "${video_name_no_ext}*"

# Run the two commands using the video name as input
ffmpeg -i "${video_name}" -vn -acodec pcm_s16le -ar 16000 -ac 2 "${video_name_no_ext}.wav"
./main.exe -m ggml-base.bin -f "${video_name_no_ext}.wav" --output-txt "${video_name_no_ext}.txt"

# Move the resulting files to separate folders inside the recipes directory
mkdir -p recipes/txt
mkdir -p recipes/wav
mv "${video_name_no_ext}.txt" recipes/txt
mv "${video_name_no_ext}.wav" recipes/wav
