var amqp = require('amqplib');
var amqp_callback = require('amqplib/callback_api');

const RabbitSettings = {
    protocol: 'amqp',
    hostname: 'rabbitmq',
    port: 5672,
    username: 'guest',
    password: 'guest',
    vhost: '/',
    authMechanism: ['PLAIN','AMQPLAIN','EXTERNAL']
}
/*-----------------------------------------------------------------------
                             POST
-------------------------------------------------------------------------*/
const rabbit_direct_producer = async function connect(ngsi,callback){
  amqp_callback.connect(RabbitSettings, function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertQueue('', {
        exclusive: true
      }, function(error2, q) {
        if (error2) {
          throw error2;
        }

        var correlationId = "routingKey_post";
        
        channel.consume(q.queue, function(msg) {
          if (msg.properties.correlationId == correlationId) {
            const final_con = JSON.parse(msg.content);
            const final = JSON.stringify(final_con);
           // console.log("I CONSUMED"+final);
            callback(null,final)
          }
        }, {
          noAck: true
        });
  
        channel.sendToQueue('rpc_queue_post',
          Buffer.from(JSON.stringify(ngsi)),{ 
            correlationId: correlationId, 
            replyTo: q.queue });
            //console.log("I SENT ........." + JSON.stringify(ngsi))
      });
    });
  });

}

/*-----------------------------------------------------------------------
                             GET
-------------------------------------------------------------------------*/

const rabbit_get = async function connect(ngsi,callback){

    amqp_callback.connect(RabbitSettings, function(error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function(error1, channel) {
          if (error1) {
            throw error1;
          }
          channel.assertQueue('', {
            exclusive: true
          }, function(error2, q) {
            if (error2) {
              throw error2;
            }

            var correlationId = "post_get_without_id";
            
            channel.consume(q.queue, function(msg) {
              if (msg.properties.correlationId == correlationId) {
                const final_con = JSON.parse(msg.content);
                const final = JSON.stringify(final_con);
              //  console.log("I CONSUMED"+final);
                callback(null,final)
              }
            }, {
              noAck: true
            });
      
            channel.sendToQueue('rpc_queue_get',
              Buffer.from(JSON.stringify(ngsi)),{ 
                correlationId: correlationId, 
                replyTo: q.queue });
             //   console.log("I SENT ........." + JSON.stringify(ngsi))
          });
        });
      });
}

module.exports = {
    rabbit_direct_producer,
    rabbit_get
}
