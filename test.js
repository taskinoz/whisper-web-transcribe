const {exec} = require('child_process');
const path = require('path');
const audioPath = path.join(__dirname, 'whisper-bin-x64', 'input.wav');
const fs = require('fs');
const command = `cd whisper-bin-x64 && main.exe -m ggml-base.bin -f input.wav --output-txt output.txt`;
//const command = `ls whisper-bin-x64/`;
function whisper(){
    exec(command, (err, stdout, stderr) => {
    if (err) {
        console.error('Execution error:', err);
    }
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
});
}

whisper()