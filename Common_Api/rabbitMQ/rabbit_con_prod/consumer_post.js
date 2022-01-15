var amqp = require('amqplib/callback_api');
const mongo = require('./mongodb-init'); 
const db=mongo.getDB();  //getDB

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

                        Consume from POSTS

-------------------------------------------------------------------------*/


async function connectional(){
    
    amqp.connect(RabbitSettings, function(error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function(error1, channel) {
          if (error1) {
            throw error1;
          }
          console.log("POST: channel created")
          var queue = 'rpc_queue_post';
      
          channel.assertQueue(queue, {
            durable: false
          });
          channel.prefetch(1);
          console.log('POST: waiting for requests');
      
          channel.consume(queue, function reply(msg) {
            //console.log('POST: ............');
              let query = JSON.parse(msg.content);
                let result = {
                    ok : "ok"
                }
               // console.log(query.id)

                db.collection('entities').find({'id': query.id}).toArray(function(err, results) {
                    if (results.length > 0) {
                        res = {Error: 'Resource already exists'}
                        channel.sendToQueue(msg.properties.replyTo,
                            Buffer.from(JSON.stringify(res)), {
                              correlationId: msg.properties.correlationId
                            });
                    } else {
                        db.collection('entities').insertOne(query, {'forceServerObjectId':true},function (err, result) {
                            if (err) {
                                channel.sendToQueue(msg.properties.replyTo,
                                    Buffer.from(JSON.stringify(err)), {
                                      correlationId: msg.properties.correlationId
                                    });
                            } else {
                                resulta = {
                                    Location: '/entities:'+query.id
                                }
                                channel.sendToQueue(msg.properties.replyTo,
                                    Buffer.from(JSON.stringify(resulta)), {
                                      correlationId: msg.properties.correlationId
                                    });
                            }
                    
                        }); 
                    }
                }); 
              //let final_entity_message = JSON.stringify(query)
      
              //console.log("Try find : "+JSON.stringify(query));

              
              
            channel.ack(msg);
          });
          
        });
      });
}

connectional();
