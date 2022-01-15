var amqp = require('amqplib/callback_api');
const mongo = require('./mongodb-init'); 
const db=mongo.getDB();  //getDB

//console.log(db)

const RabbitSettings = {
    protocol: 'amqp',
    hostname: 'rabbitmq',
    port: 5672,
    username: 'guest',
    password: 'guest',
    vhost: '/',
    authMechanism: ['PLAIN','AMQPLAIN','EXTERNAL']
}

/*------------------------------------------------------------------------

                        Consume from GET

-------------------------------------------------------------------------*/
async function consume_get(){

    amqp.connect(RabbitSettings, function(error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function(error1, channel) {
          if (error1) {
            throw error1;
          }
          console.log("GET: channel created")
          var queue = 'rpc_queue_get';
      
          channel.assertQueue(queue, {
            durable: false
          });
          channel.prefetch(1);
          console.log('GET: waiting for requests');
      
          channel.consume(queue, function reply(msg) {
            console.log('GET: ............');
              let query = JSON.parse(msg.content);
              //let final_entity_message = JSON.stringify(query)
      
             // console.log("Try find : "+JSON.stringify(query));

              db.collection("entities").find(query, {projection:{ _id: 0 }}).toArray(function(err, result) {
                     if (err) throw err;
               //      console.log("Send back : "+JSON.stringify(result));
                     if(result == ''){
                        result = {type:"https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound",title:"Entity Not Found"}
                     }

                     channel.sendToQueue(msg.properties.replyTo,
                        Buffer.from(JSON.stringify(result)), {
                          correlationId: msg.properties.correlationId
                        });
                 })
              
            channel.ack(msg);
          });
          
        });
      });
      
}

consume_get()

/*
    async function consume_get(){
    try {
        //Here is our connection
        const connect = await amqp.connect(RabbitSettings)
        console.log("GET:The connection establised with RabbitMQ...")

        //Create a channel
        const channel = await connect.createChannel()
        console.log("GET:The channel is created ...")

        const exchange = "direct_exchange"

        await channel.assertExchange(exchange,'direct',{
            durable:false
        })
        console.log(`GET:The Exchange ${exchange} is created ...`)

        const routingKey = "routingKey_get"

        const direct_queue = await channel.assertQueue('',{
            exclusive:true //delete the queue when the messages delivered
        })
             //bind
        await channel.bindQueue(direct_queue.queue,exchange,routingKey)

        channel.prefetch(1);

           await channel.consume(direct_queue.queue, function(message){
               if(message.content != ""){
                    let query = JSON.parse(message.content);
                    //console.log(query)
                   db.collection("entities").find(query, {projection:{ _id: 0 }}).toArray(function(err, result) {
                    if (err) throw err;
                    //console.log(result);
                        //start Producer
                        const routingKey_post_get = "routingKey_post_get"
                         channel.publish(exchange, routingKey_post_get ,Buffer.from(JSON.stringify(result)), { 
                            persistent: true 
                        })

                    });
                
               }
            }, {
                noAck: true
            })
                
    } catch (e) {
        console.log(e)
    }
}
*/
