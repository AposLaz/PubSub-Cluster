const mongo = require('./mongo_init.js'); 
const express = require("express")
const { ServeGrip } = require( '@fanoutio/serve-grip' );

const app = express()
const port = process.env.PORT || 3030

const CHANNEL_NAME = 'send';
const CHANNEL_NAME_2 = 'ret';

const PUSHPIN_URL = "http://pushpin:5561/";

const serveGrip = new ServeGrip({
    grip: {
        control_uri: PUSHPIN_URL,
    },
});

app.use(serveGrip);

app.use(express.json({type: '*/*'}))      //for access json values and handle them with req
app.use(express.urlencoded({extended:true}))

///////////////////////////////////////////------------------------POST
app.get('/receive', (req, res)=>{
    
    if (req.grip.isProxied) {

        const gripInstruct = res.grip.startInstruct();
        gripInstruct.addChannel(CHANNEL_NAME);
        gripInstruct.setHoldStream();

        res.setHeader('Content-Type', 'application/json');
        res.end('[stream open]\n');

    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end("[not proxied]\n");

    }
})

app.get('/post', (req, res)=>{
    if (req.grip.isProxied) {

        const gripInstruct = res.grip.startInstruct();
        gripInstruct.addChannel(CHANNEL_NAME_2);
        gripInstruct.setHoldLongPoll(10000);

        //res.setHeader('Content-Type', 'application/json');
        res.end();

    } else {

        res.setHeader('Content-Type', 'application/ld+json');
        res.end("[not proxied]\n");

    }
})

/////////////////////////////////////////////////////////////---------------------GET
app.get('/receive_msg', (req, res)=>{
    if (req.grip.isProxied) {

        const gripInstruct = res.grip.startInstruct();
        gripInstruct.addChannel('receive_msg');
        gripInstruct.setHoldStream();

        res.setHeader("Content-Type", "text/plain");
        res.end();

    } else {

        res.setHeader('Content-Type', 'application/json');
        res.end("[not proxied]\n");

    }
})

app.get('/ret_msg', (req, res)=>{
    if (req.grip.isProxied) {

        const gripInstruct = res.grip.startInstruct();
        gripInstruct.addChannel('ret_msg');
        gripInstruct.setHoldLongPoll(10000);

        res.end();

    } else {

        res.setHeader('Content-Type', 'application/json');
        res.end("[not proxied]\n");

    }
})

app.listen(3030, () => {
    console.log('Server is up in port 3030')
})









//send data to channel
mongo.bootstrap((error,result)=>{
    const db=mongo.getDB();  //getDB

        app.post('/publish', (req, res)=>{ 
           
            const ngsi = req.body
            const ngsi_id = req.body.id
            const msg_suc = {
                id: ngsi_id , 
                note : "Posted succesfully "
            }
            const error_msg = {
                Error: "Resource already exists"
            }

            db.collection('entities').find({'id': ngsi_id}).toArray(async function(err, results) {
                if (results.length > 0) {
                
                    res.setHeader('Content-Type', 'application/ld+json');
                    res.end(JSON.stringify(error_msg));
                }
                else{
                    db.collection('entities').insertOne(ngsi, {'forceServerObjectId':true},async function (err, result) {
                        if (err) {
                            //res.setHeader('Content-Type', 'application/ld+json');
                            //res.end(JSON.stringify("Error : "+error_msg));
                        }
                        else{

                            res.setHeader('Content-Type', 'application/ld+json');
                            res.end(JSON.stringify("Error : "+msg_suc));
                        }
                    });
                }
            })
        })
    })

/*
        app.get('/get_msg/:id', (req,res)=>{
            const entityId = req.params.id
            
            db.collection("entities").find( {id: entityId}, {projection:{ _id: 0 }}).toArray(async function(err, result) {
                if (err) throw err;

                if(result == ''){
                result = {type:"https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound",title:"Entity Not Found"}
                console.log("---------------------------------------------")
                const publisher = serveGrip.getPublisher();
                await publisher.publishHttpStream(CHANNEL_NAME, JSON.stringify(result) + '\n');
                            
                res.setHeader('Content-Type', 'application/ld+json');
                res.end(JSON.stringify(result));
                }
                else{
                const publisher = serveGrip.getPublisher();
                await publisher.publishHttpStream(CHANNEL_NAME, JSON.stringify(result) + '\n');
                            
                res.setHeader('Content-Type', 'application/ld+json');
                res.end(JSON.stringify(result));
                }
            })
        })
})

//Subscribe to channel
//curl -i http://localhost:7999/receive

app.get('/receive', (req, res)=>{
    if (req.grip.isProxied) {

        const gripInstruct = res.grip.startInstruct();
        gripInstruct.addChannel(CHANNEL_NAME);
        gripInstruct.setHoldLongPoll();

        res.setHeader("Content-Type", "application/json");
        res.end();

    } else {

        res.setHeader('Content-Type', 'application/ld+json');
        res.end("[not proxied]\n");

    }
})

app.get('/post', (req, res)=>{
    if (req.grip.isProxied) {

        const gripInstruct = res.grip.startInstruct();
        gripInstruct.addChannel(CHANNEL_NAME_2);
        gripInstruct.setHoldStream();

        res.setHeader('Content-Type', 'application/ld+json');
        res.end('[stream open]\n');

    } else {

        res.setHeader('Content-Type', 'application/ld+json');
        res.end("[not proxied]\n");

    }
})

app.listen(3030, () => {
    console.log('Server is up in port 3030')
})

*/