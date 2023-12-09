function processVideo() {
    const urlInput = document.getElementById('urlInput').value;
    const fileInput = document.getElementById('fileInput').files[0];
    const responseText = document.getElementById('responseText');

    if (!urlInput && !fileInput) {
        responseText.textContent = 'Please provide a URL or upload a video.';
        return;
    }

    const formData = new FormData();

    if (urlInput) {
        formData.append('url', urlInput);
    } else if (fileInput) {
        formData.append('video', fileInput);
    }

    // reset response text
    responseText.textContent = 'Processing...';

    fetch('/download', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            responseText.textContent = data;
        })
        .catch(error => {
            responseText.textContent = 'Error: ' + error;
        });
}
