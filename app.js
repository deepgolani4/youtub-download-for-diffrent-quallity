const express=require("express")
const morgan = require("morgan")
const app=express()
const fs=require ('fs')
const ytdl=require('ytdl-core')
const bodyParser = require("body-parser")
const ffmpeg = require('ffmpeg-static');
const cp = require('child_process');
app.use(morgan("dev"))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.get("/:id",(req,res,next)=>{
    id = req.params.id
    ref = `https://www.youtube.com/watch?v=${id}`

    // const writeableStream=fs.createWriteStream(`video.mp4`)
    // writeableStream.on('finish',()=>{
    //     console.log(`downloaded successfully`);
    //     res.download(__dirname+'/video.mp4');
    // })
    // ytdl(url,{ quality: 'highest' })
    // .pipe(writeableStream)
    
    const audio = ytdl(ref, { filter: 'audioonly', quality: 'highestaudio' })
     .on('progress', (_, downloaded, total) => {
    });

    const video = ytdl(ref, { filter: 'videoonly', quality: 'highestvideo' })
    .on('progress', (_, downloaded, total) => {
    });

    const ffmpegProcess = cp.spawn(ffmpeg, [
        // Remove ffmpeg's console spamming
        '-loglevel', '0', '-hide_banner',
        // Redirect/enable progress messages
        '-progress', 'pipe:3',
        // 3 second audio offset
        '-itsoffset', '3.0', '-i', 'pipe:4',
        '-i', 'pipe:5',
        // Rescale the video
        '-vf', 'scale=1080:1920',
        // Choose some fancy codes
        '-c:v', 'libx265', '-x265-params', 'log-level=0',
        '-c:a', 'flac',
        // Define output container
        '-f', 'matroska', 'pipe:6',
      ], {
        windowsHide: true,
        stdio: [
          /* Standard: stdin, stdout, stderr */
          'inherit', 'inherit', 'inherit',
          /* Custom: pipe:3, pipe:4, pipe:5, pipe:6 */
          'pipe', 'pipe', 'pipe', 'pipe',
        ],
      });

      ffmpegProcess.on('close', () => {
        console.log('done');
      });

      ffmpegProcess.stdio[3].on('data', chunk => {
        // Parse the param=value list returned by ffmpeg
        const lines = chunk.toString().trim().split('\n');
        const args = {};
        for (const l of lines) {
          const [key, value] = l.trim().split('=');
          args[key] = value;
        }
      });
      audio.pipe(ffmpegProcess.stdio[4]);
      video.pipe(ffmpegProcess.stdio[5]);

      const writeableStream=fs.createWriteStream('./video.mkv')

      ffmpegProcess.stdio[6].pipe(writeableStream);
      writeableStream.on('finish',()=>{
        console.log(`downloaded successfully`);
        res.download(__dirname+'/video.mkv');
      })
      
    })

module.exports=app


