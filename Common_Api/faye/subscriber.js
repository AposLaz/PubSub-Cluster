var faye = require('faye');

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

var client = new faye.Client('http://faye:8000/faye');

//This was missing from the documentation
client.connect();

//------------------------------------------------------------------------------------------POST DATA

    
    var subscription = client.subscribe('/post',async function(message){
        it = it + 1
        console.log(it)
        await write_in_csv()

    }) 
    
    //This is optional
    subscription.then(function() {
        console.log('Subscription POST is now active!');
    });

