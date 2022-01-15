var amqp = require('amqplib');
var ret = null
var ret_ever = null
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

const consume_get = async function consume_get1(callback){
    try {
        const connect = await amqp.connect(RabbitSettings)
        console.log("CONSUME_GET:The connection establised with RabbitMQ...")

        const channel = await connect.createChannel()
        console.log("CONSUME_GET:The channel is created ...")

        const exchange = "direct_exchange"

        await channel.assertExchange(exchange,'direct',{
            durable:false
        })
        console.log(`CONSUME_GET:The Exchange ${exchange} is created ...`)

        const routingKey1 = "routingKey_post_get"

        const direct_queue = await channel.assertQueue('',{
            exclusive:true
        })
        await channel.bindQueue(direct_queue.queue,exchange,routingKey1)
        
        channel.prefetch(1);
        
         await channel.consume(direct_queue.queue,function(message){
               if(message.content != ""){
                    let entity = JSON.parse(message.content);
                    let final_entity_message = JSON.stringify(entity)
                    ret = final_entity_message
               }
               else{
                   const error = {"type":"https://uri.etsi.org/ngsi-ld/errors/ResourceNotFound","title":"Entity Not Found","detail":"urn:ngsi-"}
                   ret =  error
               }
            
            }, {
                noAck: true
            })
            
            console.log(ret)
           callback(null,ret)

        } catch (e) {
        console.log(e)
    }
}


module.exports = {
    consume_get
}