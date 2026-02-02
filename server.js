const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static('public'));

// হোম পেজ সার্ভ করা
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ডাউনলোড লজিক
app.get('/download', async (req, res) => {
    try {
        const { url, format, quality } = req.query;

        if (!ytdl.validateURL(url)) {
            return res.status(400).send('Invalid YouTube URL');
        }

        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        
        let headerType = format === 'mp3' ? 'audio/mpeg' : 'video/mp4';
        let extension = format === 'mp3' ? 'mp3' : 'mp4';

        res.header('Content-Disposition', `attachment; filename="${title}.${extension}"`);

        ytdl(url, {
            format: format,
            quality: format === 'mp3' ? 'highestaudio' : (quality || 'highestvideo'),
            filter: format === 'mp3' ? 'audioonly' : 'videoandaudio'
        }).pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).send('Something went wrong!');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
