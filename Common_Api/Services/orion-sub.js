const express = require('express')
// write in csv
var fs = require('fs');
var csvWriter = require('csv-write-stream')

const write_in_csv = () => {
    if (!fs.existsSync('T3.csv'))
        writer = csvWriter({ headers: ["T3"]});
    else
        writer = csvWriter({sendHeaders: false});

    writer.pipe(fs.createWriteStream('T3.csv', {flags: 'a'}));
    writer.write({
    T3: Date.now(),
    });
    writer.end();
}

const app = express()
const port = process.env.PORT || 3030

app.use(express.json({type: '*/*'}))      //for access json values and handle them with req
app.use(express.urlencoded({extended:true}))


app.post('/app',async (req,res)=>{
    await write_in_csv()
    //console.log(req)
    res.status(200).send()
})

app.listen(port, ()=>{
    console.log('Server is up on Port '+port)
})