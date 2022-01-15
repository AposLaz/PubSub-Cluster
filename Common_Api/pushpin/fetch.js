const express = require("express")

const app = express()
const port = process.env.PORT || 3040


const fetch = require('node-fetch');

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
let it = 0
console.log("Fetching....");
//POST

    fetch('http://pushpin:7999/stream')
        .then(response => response.body)
        .then(res => res.on('readable', async () => {
            try {

            let chunk;
            while (null !== (chunk = res.read())) {
                    let js = chunk.toString();
                        
                        await write_in_csv()
                        console.log(it)
                        it = it + 1
                }
            }catch(error){
                console.log(error)
            }
    }))
    .catch(err => console.log(err));



app.listen(3040, () => {
    console.log('Server is up in port 3040')
})