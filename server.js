
const express = require('express');

const app = express();

app.use(express.static('public'));

app.get('/',(req,res)=>{
    res.sendFile('index.html');
})

const server = app.listen(80,function(){
    console.log("Server up on 80");
});