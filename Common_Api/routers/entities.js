const express = require('express');
const { get } = require('request');
const router = new express.Router()
const request = require('request');
const qs = require('querystring')
const orion_scorpio = require('./functions/orion_scorpio');
const axios = require('axios').default;
const kafka_node = require('kafka-node')

/////////////////////////////////////---------------RABBIT CONSTS
//producer
const rabbit_producer = require('./direct_exchange/producer')
const rabbit_consumer = require('./direct_exchange/consumer_get')


/////////////////////////////////////----------------FAYE CONSTS
const faye = require('faye');

/////////////////////////////////////----------------KAFKA CONSTS
// const {Kafka} = require('kafkajs');

// const kafka = new Kafka({
//     clientId: 'my-app',
//     brokers: ['kafka:29092'],
// })

// const admin = kafka.admin()
// const run_admin = async ()=>{
//     await admin.connect()
//     await admin.createTopics({
//         topics: [
//             {
//                 topic: 'send'
//             }
//         ]
          
//     })
//     await admin.disconnect()
// }
// run_admin().then(console.log("ok started")).catch(e => console.error(`[example/admin] ${e.message}`, e))
// const kafka_producer = kafka.producer()
// const connect_prod = async () => { 
//     await kafka_producer.connect() 
// }

// connect_prod().then(console.log("producer connected")).catch(e => console.error('Producer didnt connected'))

//const kafka_consumer = kafka.consumer({ groupId: 'ngsi-gro1u222p' })

//////////////////////////////////////////////////////////////////////////////////////------------PUSHPIN

const { ServeGrip } = require( '@fanoutio/serve-grip' );
const { Publisher, PublishException } = require('@fanoutio/grip');



const CHANNEL_NAME = 'get_back';
const PUSHPIN_URL = "http://pushpin:5561/";

const serveGrip = new ServeGrip({
    grip: {
        control_uri: PUSHPIN_URL,
    },
});

const fetch = require('node-fetch');

const fs = require('fs');
const csvWriter = require('csv-write-stream')

const write_in_csv_T1 = () => {
    if (!fs.existsSync('./routers/T1.csv'))
        writer = csvWriter({ headers: ["T1"]});
    else
        writer = csvWriter({sendHeaders: false});
    

    writer.pipe(fs.createWriteStream('./routers/T1.csv', {flags: 'a'}));
    writer.write({
    T1: Date.now(),
    });
    writer.end();
}

const write_in_csv_T2 = () => {
    if (!fs.existsSync('./routers/T2.csv'))
        writer2 = csvWriter({ headers: ["T2"]});
    else
        writer2 = csvWriter({sendHeaders: false});

    writer2.pipe(fs.createWriteStream('./routers/T2.csv', {flags: 'a'}));
    writer2.write({
    T2: Date.now(),
    });
    writer2.end();
}

const write_in_csv_error = () => {
    if (!fs.existsSync('./routers/Error.csv'))
        writer3 = csvWriter({ headers: ["Error"]});
    else
        writer3 = csvWriter({sendHeaders: false});

    writer3.pipe(fs.createWriteStream('./routers/Error.csv', {flags: 'a'}));
    writer3.write({
    Error: Date.now(),
    });
    writer3.end();
}

///////////////////////////////////////////////////////////////////////////////////////////
/*

                        NGSI API CRUD

*/
////////////////////////////////////////////////////////////////--------POST

router.post('/service_discovery/:service_id', (req, res)=>{


        write_in_csv_T1()       //write files 

        const service_id = req.params.service_id
        const content_type = req.get('Content-type');
        const ngsi = req.body
    
            if(service_id == 'orion')
            {
            const url = 'http://orion:1026/ngsi-ld/v1/entities/'
           // console.log(url)
            orion_scorpio.post_ngsi(ngsi,content_type,url , (err,body)=>{
                    if(err)
                    {
                        res.send(err)
                    }
                    else{
                        res.send(body)
                    }   
            })

            }
            else if(service_id == 'scorpio'){
            
            const url = 'http://scorpio:9090/ngsi-ld/v1/entities/'
            //console.log(ngsi)
            orion_scorpio.post_ngsi(ngsi,content_type,url , (err,body)=>{
                if(err)
                {
                    res.send(err)
                }
                else{
                    res.send(body)
                }   
            })

            }
            else if(service_id == 'rabbit'){

    
                rabbit_producer.rabbit_direct_producer(ngsi, (err,body)=>{
                    if(err)
                    {
                        res.send(err)
                    }
                    else{
                            res.send(body)
                        } 
                })
             
            }
            else if (service_id == 'stellio'){
                const url = 'http://entity-service:8082/ngsi-ld/v1/entities'

                orion_scorpio.post_ngsi(ngsi,content_type,url , (err,body)=>{
                    if(err)
                    {
                        res.send(err)
                    }
                    else{
                        res.send(body)
                    }   
                })
            }
            else if(service_id == 'pushpin'){
                console.log(ngsi)
                const pub = new Publisher({
                    'control_uri': 'http://pushpin:5561/',
                });
                
                
                            pub.publishHttpStream('test', JSON.stringify(ngsi) )
                                .then(async () => {
                                    await write_in_csv_T2()
                                    res.send('Publish successful!');
                                })
                                .catch(async () => {
                                    await write_in_csv_error()
                                    res.send("Error-msg")
                                });
            }
            else if(service_id == 'faye'){

                const client = new faye.Client('http://faye:8000/faye');
                client.connect();

                const publication = client.publish('/post', ngsi);

                publication.then(async function() {
                        await write_in_csv_T2()
                        res.send("Pub success")
                    },async function(error) {
                        await write_in_csv_error()
                    res.send('There was a problem: ' + error.message);
                })
            }
            else if(service_id == 'kafka'){

                const run = async()=>{
                    await kafka_producer.send({
                        topic: 'send',
                        ack:1,
                        messages: [
                                    { value : JSON.stringify(ngsi) }
                                ]
                            })
                }

                try{
                
                   run().then(async ()=>{
                     await write_in_csv_T2()
                     res.status(200).send("Entity posted succesfully")
                   }).catch(e => write_in_csv_error())


                }catch (error){
                    console.error(error)
                }                

            }
            else if(service_id == 'kafka1'){
                const run = async()=>{
                    await kafka_producer.connect()
                    await kafka_producer.send({
                        topic: 'send',
                        messages: [
                                    { key: ngsi.id , value : JSON.stringify(ngsi) , partition: 0 }
                                ]
                            })
                    await kafka_producer.disconnect()
                    res.status(200).send("OK")
                }

                run()
            }
            else{
                res.send('This Service doesnt exist')
            } 
        
})
/////////////////////////////////////////////////////////////////----GET
router.get('/service_discovery/:service_id', (req, res)=>{
    const service = req.params.service_id
    const qs_query = ""+qs.stringify(req.query)
    const query = "?"+qs_query

    //check if there is a query
    const valid = (qs_query === "") ? false : true;
    
    if(valid === false){
        res.send("Invalid Request. Need query params")
    }
    else{
        if(service == 'orion'){
       
            const url = 'http://orion:1026/ngsi-ld/v1/entities/' + query
            
            const options = {
                method: 'Get',
                url: url,
                headers:  {
                    'accept': 'application/ld+json',
                    'link': '<https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
                }
            }
            function callback(err, response, body){
                if(err)throw err;
                res.send(body)
            }
     
            request(options,callback)
         }
         else if(service == 'scorpio'){
            const url = 'http://scorpio:9090/ngsi-ld/v1/entities/' + query
            const options = {
                method: 'Get',
                url: url,
                headers:  {
                    'accept': 'application/ld+json'
                }
            }
            function callback(err, response, body){
                if(err)throw err;
                res.send(body)
            }
     
            request(options,callback)
         }
         else if(service == 'rabbit'){
            const rabbit_query = req.query
            //console.log(rabbit_query)
            //check if there is a query
            const validity = (qs_query === "") ? false : true;
    
            rabbit_producer.rabbit_get(rabbit_query,(err,result_rab)=>{
                if(err){
                    res.send("entity doesn't exist")
                }else{
                        res.send(result_rab)
                }
            })
        }
        else if(service == 'stellio'){
            const url = 'http://entity-service:8082/ngsi-ld/v1/entities/' + query
            const options = {
                method: 'Get',
                url: url,
                headers:  {
                    'accept': 'application/ld+json'
                }
            }
            function callback(err, response, body){
                if(err)throw err;
                res.send(body)
            }
     
            request(options,callback)
        }             
        else{
             res.send('This Service doesnt exist')
         }
    }
    
})
////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------GET------ENTITY BY ID

router.get('/service_discovery/:service_id/:entityId' ,(req, res)=>{
    const service_id = req.params.service_id
    const entityId = req.params.entityId
    const content_type = req.get('Content-type');
    const accept = req.get('Accept')
    const Link = req.get('Link')
    
    const qs_query = ""+qs.stringify(req.query)
    const query = "?"+qs_query
    
    //pairnoume to url gia to telos
    const back1 = entityId + "/" + query  
    const back2 = entityId

    //Get the right back_uri
    const back = (qs_query === "") ? back2 : back1;    

    if(service_id == 'orion')
    {
       const url = 'http://orion:1026/ngsi-ld/v1/entities/' + back

       const options = {
           method: 'GET',
           url: url,
           headers:  {
               'accept': accept,
               'content-type': content_type,
               'Link': Link
           }
       }

       function callback(err, response, body){
           if(err)throw err;
           res.send(body)
       }

       request(options,callback)

    }
    else if(service_id == 'scorpio'){
        
       const url = 'http://scorpio:9090/ngsi-ld/v1/entities/' + back
       const options = {
        method: 'GET',
        url: url,
        headers:  {
            'accept': accept,
            'content-type': content_type,
                'Link': Link
            }
        }

       function callback(err, response, body){
           if(err)throw err;
           res.send(body)
       }

       request(options,callback)

    }
    else if(service_id == 'rabbit'){
        const rabbit_query = req.query
        //check if there is a query
        const validity = (qs_query === "") ? false : true;

        if (validity === false){

            const ngsi_ld = {
                id : entityId
            }
            rabbit_producer.rabbit_get(ngsi_ld,(err,result_rab)=>{
                if(err){
                    res.send("entity doesn't exist")
                }else{
                        res.send(result_rab)
                }
            })
        }
        else
        {
            rabbit_query.id = entityId

            rabbit_producer.rabbit_get(rabbit_query,(err,result_rab)=>{
                if(err){
                    res.send("entity doesn't exist")
                }else{
                        res.send(result_rab)
                }
            })
        }
    }
    else if(service_id == 'stellio'){
        
        const url = 'http://entity-service:8082/ngsi-ld/v1/entities/' + back
        const options = {
         method: 'GET',
         url: url,
         headers:  {
             'accept': accept,
             'content-type': content_type,
             'Link': Link
             }
         }
 
        function callback(err, response, body){
            if(err)throw err;
            res.send(body)
        }
 
        request(options,callback)
 
     }
     else if(service_id == 'pushpin'){
        const pub = new Publisher({
            'control_uri': 'http://pushpin:5561/',
        });
            console.log(typeof(entityId))
            //console.log(back2)

                    fetch('http://pushpin:7999/ret_msg')
                        .then(response => response.body)
                        .then(respo => respo.on('readable', () => {
                        let chunk;
                        while (null !== (chunk = respo.read())) {

                            res.send(chunk.toString())
                        }
                    }))
                    .catch(err => console.log(err));           

                    pub.publishHttpStream('receive_msg', entityId + '\n' )
                        .then(() => {
                            console.log('Publish successful!');
                        })
                        .catch(({entityId, context}) => {
                            console.log('Publish failed!');
                            console.log('Message: ' + entityId);
                            console.log('Context: ');
                            console.log(JSON.stringify(context, null, 4));
                        });
     }
     else if(service_id == 'faye'){
         //entityId
         const client = new faye.Client('http://faye:8000/faye');
        client.connect()

         const publication = client.publish('/get', entityId);

            publication.then( function() {
                
                }, function(error) {
                res.send('There was a problem: ' + error.message);
            })
            var subscription = client.subscribe('/return_get', function(message){ 
                subscription.cancel();
                res.send(message)
            })
     }
     else if(service_id == 'kafka'){

                //kafka-node
                options = {
                    kafkaHost: 'kafka:9092'
                }
                const client_node = new kafka_node.KafkaClient(options);

                let Consumer = kafka_node.Consumer
                let consumer_node = new Consumer(
                    client_node,
                    [
                        { topic: 'receive.kafka.entities', partition: 0 , offset: 0}
                    ],
                    {
                        autoCommit: false,
                        fetchMaxBytes: 1024 * 1024,
                        fromOffset: true, 
                        groupId: Math.random().toString(),
                        //asyncPush: true,
                        //onRebalance: (isAlreadyMember, callback) => { callback(); }
                    }
                );

        const read = (callback)=>{
            let ret = { 
                id:"1" 
            }
            consumer_node.on('message',async function (message) {
                var parse1 = JSON.parse(message.value)
                var parse2 = JSON.parse(parse1.payload)
                var id = parse2.fullDocument.id
                var lastOffset = message.highWaterOffset - 1
                //check if there is a query
                console.log(back2 , id)
                if(lastOffset <= message.offset || ret.id != "1"){
                    if(id === back2){
                        ret = parse2.fullDocument
                        return callback(ret)
                        //console.log("OK")
                    }
                    else{
                        //console.log(ret.id)
                        return callback(ret)
                    }
                }
                else if(id === back2){
                    ret = parse2.fullDocument
                    //console.log("OK")
                }
            }); 
        }

        let error = {
            id: "The entity " + back2 + " not found "
        }
        read((data)=>{
            console.log(data)
            consumer_node.close(true,function(message){
                if(data != "1" || data.id != "1"){
                    res.status(200).send(data)
                }
                else{
                    res.status(200).send(error)
                }
            })
        })
     }
    else{
        res.send('This Service doesnt exist')
    }
})




router.delete('/service_discovery/:service_id/:entityId' ,(req, res)=>{
    const service_id = req.params.service_id
    const entityId = req.params.entityId

    if(service_id == 'orion')
    {
       const url = 'http://orion:1026/ngsi-ld/v1/entities/' + entityId
       
        request.delete({url: url},function(error, response, body){
            //console.log(response);
            res.send(body)
        })
    }
    else if(service_id == 'scorpio'){
         const url = 'http://scorpio:9090/ngsi-ld/v1/entities/' + entityId
       
        request.delete({url: url},function(error, response, body){
            res.send(body)
        })
    }
    else if(service_id == 'rabbit'){

    }
    else{
        res.send('This Service doesnt exist')
    }
})


module.exports = router




//---------------------------------------------------------------------ENTITY ATTRIBUTE LIST
router.post('/service_discovery/:service_id/:entityId/attrs', (req, res)=>{

    write_in_csv_T1()

    const service_id = req.params.service_id
    const entity_id = req.params.entityId
    const ngsi = req.body
    const content_type = req.get('Content-type');
    const Link = req.get('Link')

    if(service_id == 'orion')
    {
        const url = 'http://orion:1026/ngsi-ld/v1/entities/' + entity_id + '/attrs/'
        
        orion_scorpio.post_attrs_ngsi(ngsi,url, content_type, Link , async (err,body)=>{
            if(err)
            {
                await write_in_csv_error()
                res.send(err)
            }
            else{
                await write_in_csv_T2()
                res.send(body)
            }   
       })
    }
    else if(service_id == 'scorpio'){
        const url = 'http://scorpio:9090/ngsi-ld/v1/entities/' + entity_id + '/attrs/'
        orion_scorpio.post_attrs_ngsi(ngsi,url, content_type, Link , async (err,body)=>{
            if(err)
            {
                await write_in_csv_error()
                res.send(err)
            }
            else{
                await write_in_csv_T2()
                res.send(body)
            }   
       })
    }
    else if(service_id == 'stellio'){
        const url = 'http://entity-service:8082/ngsi-ld/v1/entities/' + entity_id + '/attrs/'
        orion_scorpio.post_attrs_ngsi(ngsi,url, content_type, Link , (err,body)=>{
            if(err)
            {
                res.send(err)
            }
            else{
                res.send(body)
            }   
       })
    }
    else if(service_id == 'rabbit'){
        
    }
    else{
        res.send('This Service doesnt exist')
    }
})

router.patch('/service_discovery/:service_id/:entityId/attrs', (req, res)=>{
    const service_id = req.params.service_id
    const entity_id = req.params.entityId
    const ngsi = req.body
    const content_type = req.get('Content-type');
    const Link = req.get('Link')

    if(service_id == 'orion')
    {
        const url = 'http://orion:1026/ngsi-ld/v1/entities/' + entity_id + '/attrs/'
        orion_scorpio.patch_attrs_ngsi(ngsi,url , (err,body)=>{
            if(err)
            {
                res.send(err)
            }
            else{
                res.send(body)
            }   
       })
    }
    else if(service_id == 'scorpio'){
        const url = 'http://scorpio:9090/ngsi-ld/v1/entities/' + entity_id + '/attrs/'
        orion_scorpio.patch_attrs_ngsi(ngsi,url, content_type, Link , (err,body)=>{
            if(err)
            {
                res.send(err)
            }
            else{
                res.send(body)
            }   
       })
    }
    else if(service_id == 'stellio'){
        const url = 'http://entity-service:8082/ngsi-ld/v1/entities/' + entity_id + '/attrs/'
        orion_scorpio.patch_attrs_ngsi(ngsi,url , (err,body)=>{
            if(err)
            {
                res.send(err)
            }
            else{
                res.send(body)
            }   
       })
    }
    else if(service_id == 'rabbit'){
        
    }
    else{
        res.send('This Service doesnt exist')
    }
})

//--------------------------------------------------------------------------ENTITY ATTRIBUTE BY ID
router.patch('/service_discovery/:service_id/:entityId/attrs/:attrId', (req, res)=>{
    const service_id = req.params.service_id
    const entity_id = req.params.entityId
    const attr_id = req.params.attrId
    const ngsi = req.body

    if(service_id == 'orion')
    {
        const url = 'http://orion:1026/ngsi-ld/v1/entities/' + entity_id + '/attrs/' + attr_id
        orion_scorpio.patch_attrs_id_ngsi(ngsi,url, (err,body)=>{
            if(err)
            {
                res.send(err)
            }
            else{
                res.send(body)
            }   
       })
    }
    else if(service_id == 'scorpio'){
        const url = 'http://scorpio:9090/ngsi-ld/v1/entities/' + entity_id + '/attrs/' + attr_id
       // console.log(url)
        orion_scorpio.patch_attrs_id_ngsi(ngsi,url, (err,body)=>{
            if(err)
            {
                res.send(err)
            }
            else{
                res.send(body)
            }   
       })
    }
    else if(service_id == 'stellio'){
        const url = 'http://entity-service:8082/ngsi-ld/v1/entities/' + entity_id + '/attrs/' + attr_id
       // console.log(url)
        orion_scorpio.patch_attrs_id_ngsi(ngsi,url, (err,body)=>{
            if(err)
            {
                res.send(err)
            }
            else{
                res.send(body)
            }   
       })
    }
    else if(service_id == 'rabbit'){
        
    }
    else{
        res.send('This Service doesnt exist')
    }
})

/*
router.delete('/service_discovery/:service_id/:entityId/attrs/:attrId', (req, res)=>{
    const service_id = req.params.service_id

    if(service_id == 'orion')
    {
    
    }
    else if(service_id == 'scorpio'){

    }
    else if(service_id == 'rabbit'){
        
    }
    else{
        res.send('This Service doesnt exist')
    }
})*/

////////////////////////////////////////////////////////////////////////////////////////////

/*

                                    SUBSCRIPTIONS

*/

router.post('/service_discovery/:service_id/subscription/', (req, res)=>{

    const service_id = req.params.service_id
    const content_type = req.get('Content-type');
    const ngsi = req.body

    console.log(ngsi)
        if(service_id == 'orion')
        {
            const url = 'http://orion:1026/ngsi-ld/v1/subscriptions/'
            //console.log(url)
            request.post({
                headers: {'content-type' : 'application/ld+json' },
                url:     url,
                body:    JSON.stringify(ngsi)
            }, function(error, response, body){
                //return error if the entity exists
                res.send(body) 
            })

        }
        else if(service_id == 'scorpio'){
        
                const url = 'http://scorpio:9090/ngsi-ld/v1/subscriptions/'
                request.post({
                    headers: {'content-type' : 'application/ld+json' },
                    url:     url,
                    body:    JSON.stringify(ngsi)
                }, function(error, response, body){
                    //return error if the entity exists
                    res.send(body)
                })
        }
        else if(service_id == 'stellio'){
        
            const url = 'http://subscription-service:8084/ngsi-ld/v1/subscriptions/'
            request.post({
                headers: {'content-type' : 'application/ld+json' },
                url:     url,
                body:    JSON.stringify(ngsi)
            }, function(error, response, body){
                //return error if the entity exists
                res.send(body)
            })
    }
        else{
            res.send('This Service doesnt exist')
        } 
  
    
})

router.get('/subscription/:service_id', (req, res)=>{

    const service_id = req.params.service_id

    if(service_id == 'orion')
        {
            const url = 'http://orion:1026/ngsi-ld/v1/subscriptions/'
                const options = {
                    method: 'GET',
                    url: url,
                    headers:  {
                        'accept': 'application/ld+json'
                    }
                }

                function callback(err, response, body){
                    if(err)throw err;
                    res.send(body)
                }

                request(options,callback)

        }
        else if(service_id == 'scorpio'){
        
            const url = 'http://scorpio:9090/ngsi-ld/v1/subscriptions/'
                    const options = {
                        method: 'GET',
                        url: url,
                        headers:  {
                            'accept': 'application/ld+json'
                        }
                    }

                    function callback(err, response, body){
                        if(err)throw err;
                        res.send(body)
                    }

                    request(options,callback)
        }
        else if(service_id == 'stellio'){
        
            const url = 'http://subscription-service:8084/ngsi-ld/v1/subscriptions/'
                    const options = {
                        method: 'GET',
                        url: url,
                        headers:  {
                            'accept': 'application/ld+json'
                        }
                    }

                    function callback(err, response, body){
                        if(err)throw err;
                        res.send(body)
                    }

                    request(options,callback)
        }
        else{
            res.send('This Service doesnt exist')
        } 
  
    
})


///////////////////////////////////////////////////////////////////////////////////////////
/*
                            REGISTRATIONS
*/

router.post('/service_discovery/:service_id/csourceRegistrations/', (req, res)=>{

    const service_id = req.params.service_id
    const content_type = req.get('Content-type');
    const ngsi = req.body

    console.log(ngsi)
        if(service_id == 'orion')
        {
            const url = 'http://orion:1026/ngsi-ld/v1/csourceRegistrations/'
            //console.log(url)
            request.post({
                headers: {'content-type' : 'application/json' },
                url:     url,
                body:    JSON.stringify(ngsi)
            }, function(error, response, body){
                //return error if the entity exists
                res.send(body) 
            })

        }
        else if(service_id == 'scorpio'){
        
                const url = 'http://scorpio:9090/ngsi-ld/v1/csourceRegistrations/'
                request.post({
                    headers: {'content-type' : 'application/ld+json' },
                    url:     url,
                    body:    JSON.stringify(ngsi)
                }, function(error, response, body){
                    //return error if the entity exists
                    res.send(body)
                })
        }
        else{
            res.send('This Service doesnt exist')
        } 
  
    
})

router.get('/csourceRegistrations/:service_id', (req, res)=>{

    const service_id = req.params.service_id
    const qs_query = ""+qs.stringify(req.query)
    const query = "?"+qs_query
    
    

    if(service_id == 'orion')
        {
            const url = 'http://orion:1026/ngsi-ld/v1/csourceRegistrations/'+query
                const options = {
                    method: 'GET',
                    url: url,
                    headers:  {
                        'accept': 'application/ld+json'
                    }
                }

                function callback(err, response, body){
                    if(err)throw err;
                    res.send(body)
                }

                request(options,callback)

        }
        else if(service_id == 'scorpio'){
        
            const url = 'http://scorpio:9090/ngsi-ld/v1/csourceRegistrations/'+query
                    const options = {
                        method: 'GET',
                        url: url,
                        headers:  {
                            'accept': 'application/json',
                            'Link': '<https://fiware.github.io/tutorials.Step-by-Step/tutorials-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
                        }
                    }

                    function callback(err, response, body){
                        if(err)throw err;
                        res.send(body)
                    }

                    request(options,callback)
        }
        else{
            res.send('This Service doesnt exist')
        } 
  
    
})


/////////////////////////---------------KAFKA


/*

else if(service_id == 'kafka'){
                //kafka-node
                options = {
                    kafkaHost: 'kafka:9092'
                }
                const client_node = new kafka_node.KafkaClient(options);

                let Consumer = kafka_node.Consumer
                let consumer_node = new Consumer(
                    client_node,
                    [
                        { topic: 'receive.kafka.entities', partition: 0 , offset: 0}
                    ],
                    {
                        autoCommit: false,
                        fetchMaxBytes: 1024 * 1024,
                        fromOffset: true, 
                        groupId: Math.random().toString(),
                        //asyncPush: true,
                        //onRebalance: (isAlreadyMember, callback) => { callback(); }
                    }
                );
                /*var options1 = {
                    kafkaHost: 'kafka:9092', 
                    groupId: 'kafka-node-group',
                    fromOffset: 'earliest',
                    fetchMaxWaitMs: 100,
                    autoCommit: false,
                    //commitOffsetsOnFirstJoin: true,
                    asyncPush: false,
                    onRebalance: (isAlreadyMember, callback) => { callback(); }
                }
                //var ConsumerGroup = kafka_node.Consumer
                var consumer_node = new kafka_node.ConsumerGroup(options1,'receive.kafka.entities') 
                const read = (callback)=>{
                    let ret = "1"
                    consumer_node.on('message', function (message) {
                        let parse1 = JSON.parse(message.value)
                        let parse2 = JSON.parse(parse1.payload)
                        let id = parse2.fullDocument.id
                        let lastOffset = message.highWaterOffset - 1
                        //check if there is a query
                       if(lastOffset <= message.offset){
                            if(id === ngsi.id){
                                ret = "The entity " + id +" Already Exists"
                                    return callback(ret)
                            }
                            else{
                                    return callback(ret)
                            }
                        }
                        else if(id === ngsi.id){
                            //result = "The entity " + id +" Already Exists"
                            ret = "The entity " + id +" Already Exists"
                            //console.log(ret)
                                return callback(ret)
                        }
                    }); 
                }
                /*const kafka_consumer = kafka.consumer({ 
                    groupId: Math.random().toString(),
                    rebalanceTimeout: 200,
                    maxWaitTimeInMs: 200
                })

                const run = async()=>{
                    await kafka_producer.connect()
                    await kafka_producer.send({
                        topic: 'send',
                        messages: [
                                    { key: ngsi.id , value : JSON.stringify(ngsi) , partition: 0 }
                                ]
                            })
                    await kafka_producer.disconnect()
                    res.status(200).send("OK")
                }

              /*  const sub = async(callback)=>{
                    let ret = "1"
                    await kafka_consumer.connect()
                    await kafka_consumer.subscribe({ topic: 'receive.kafka.entities', fromBeginning: true })
                    //console.log("begin1")
                    await kafka_consumer.run({
                        autoCommit: true,
                        eachMessage: async ({ topic, partition, message }) => {
                            console.log("begin")
                            var parse1 = JSON.parse(message.value)
                            var parse2 = JSON.parse(parse1.payload)
                            var id = parse2.fullDocument.id
                            var lastOffset = message.highWaterOffset - 1
                            //check if there is a query
                            if(lastOffset === message.offset || ret !== "1"){
                                    //console.log(ret)
                                    if(id === ngsi.id){
                                        //result = "The entity " + id +" Already Exists"
                                        ret = "The entity " + id +" Already Exists"
                                            //console.log(ret)
                                        return callback(ret)
                                    }
                                    else{
                                        return callback(ret)
                                    }
                                }
                            else if(id === ngsi.id){
                                    //result = "The entity " + id +" Already Exists"
                                    ret = "The entity " + id +" Already Exists"
                                        //console.log(ret)
                                    return callback(ret)
                            }
                        },
                    })                    
                }

                const disc = async (callback)=> {
                    await kafka_consumer.disconnect()
                    callback(1)
                }
                try{
                    /*sub((data)=>{
                        disc((val)=>{
                            if(val==1){
                                if(data != "1"){
                                    res.status(404).send(data)
                                }else{
                                    run()
                                }
                            }
                            else(
                                res.send("error")
                            )
                        })
                    })
                   read((data)=>{
                       // console.log("The return function is : "+data)
                        consumer_node.close(true, function(message){
                            if(data != "1"){
                                //console.log("CLOSEEEEEE")
                                res.status(404).send(data)
                            }else{
                                run()     
                            }
                        })
                    })


                }catch (error){
                    console.error(error)
                }
            }

*/