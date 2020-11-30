const express=require("express")
const morgan = require("morgan")
const app=express()
const fs=require ('fs')
const ytdl=require('ytdl-core')
const bodyParser = require("body-parser")

app.use(morgan("dev"))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.get("/:id/:name",(req,res,next)=>{
    id = req.params.id
    fName=req.params.name

    url = `https://www.youtube.com/watch?v=${id}`
    const writeableStream=fs.createWriteStream(`./${fName}.mkv`)
    writeableStream.on('finish',()=>{
        console.log(`downloaded successfully`);
        res.download(__dirname+`/${fName}.mkv`, (err) => {
            if(err) {
              console.log(err);
            }
            fs.unlinkSync(`./${fName}.mkv`);
          });    })
    ytdl(url)
    .pipe(writeableStream)
})

module.exports=app
