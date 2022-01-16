var amqp = require('amqplib');

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
  try {
    //Here is our connection
    const connect = await amqp.connect(RabbitSettings)
    console.log("The connection establised with RabbitMQ...")

    //Create a channel
    const channel = await connect.createChannel()
    console.log("The channel is created ...")

    const exchange = "direct_exchange"

    await channel.assertExchange(exchange,'direct',{
        durable:false
    })
    console.log(`The Exchange ${exchange} is created ...`)

    const routingKey = "routingKeyA"

    const direct_queue = await channel.assertQueue('',{
        exclusive:true //delete the queue when the messages delivered
    })
         //bind
    await channel.bindQueue(direct_queue.queue,exchange,routingKey)

        channel.consume(direct_queue.queue, function(message){
                let entity = JSON.parse(message.content);
                let final_entity_message = JSON.stringify(entity)
                console.log(`I consumed the entity with body : ${final_entity_message}`)
        }, {
            noAck: true
        })

  } catch (e) {
      console.log(e)
  }
}

connectional();
