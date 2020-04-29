
const express = require('express');
const path = require('path')
const app = express();

app.use(express.static(path.join(__dirname+'/public')));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname+'/public/index.html'));
})

const port = process.env.port || 3000;

const server = app.listen(port,function(){
    console.log("Server up on "+port);
});