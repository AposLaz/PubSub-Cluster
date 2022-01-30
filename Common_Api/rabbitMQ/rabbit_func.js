var amqp = require('amqplib');
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

const RabbitSettings = {
    protocol: 'amqp',
    hostname: 'rabbit-1',
    port: 5672,
    username: 'guest',
    password: 'guest',
    vhost: '/',
    authMechanism: ['PLAIN','AMQPLAIN','EXTERNAL']
}
/*------------------------------------------------------------------------

                        Consume from POSTS

-------------------------------------------------------------------------*/


async function connectional1(){
  try {
    //Here is our connection
    const connect = await amqp.connect(RabbitSettings)
    console.log("The connection establised with RabbitMQ...")

    //Create a channel
    const channel = await connect.createChannel()
    console.log("The channel is created ...")

    const exchange = "direct_exchange"

    await channel.assertExchange(exchange,'direct',{
        durable:true
    })
    console.log(`The Exchange ${exchange} is created ...`)

    const routingKey = "routingKeyA"

    const direct_queue = await channel.assertQueue('',{
       // exclusive:true //delete the queue when the messages delivered
        durable: true
    })
         //bind
    await channel.bindQueue(direct_queue.queue,exchange,routingKey)

        channel.consume(direct_queue.queue,async function(message){
             await write_in_csv()
             it = it+1
             console.log(it)
        }, {
            noAck: true
        })

  } catch (e) {
      console.log(e)
  }
}

async function connectional2(){
    try {
      //Here is our connection
      const connect = await amqp.connect(RabbitSettings)
      console.log("The connection establised with RabbitMQ...")
  
      //Create a channel
      const channel = await connect.createChannel()
      console.log("The channel is created ...")
  
      const exchange = "direct_exchange"
  
      await channel.assertExchange(exchange,'direct',{
        durable:true
      })
      console.log(`The Exchange ${exchange} is created ...`)
  
      const routingKey = "routingKeyB"
  
      const direct_queue = await channel.assertQueue('',{
          //exclusive:true //delete the queue when the messages delivered
          durable:true
      })
           //bind
      await channel.bindQueue(direct_queue.queue,exchange,routingKey)
  
          channel.consume(direct_queue.queue,async function(message){
               await write_in_csv()
               it = it+1
               console.log(it)
          }, {
              noAck: true
          })
  
    } catch (e) {
        console.log(e)
    }
  }

  async function connectional3(){
    try {
      //Here is our connection
      const connect = await amqp.connect(RabbitSettings)
      console.log("The connection establised with RabbitMQ...")
  
      //Create a channel
      const channel = await connect.createChannel()
      console.log("The channel is created ...")
  
      const exchange = "direct_exchange"
  
      await channel.assertExchange(exchange,'direct',{
        durable:true
      })
      console.log(`The Exchange ${exchange} is created ...`)
  
      const routingKey = "routingKeyC"
  
      const direct_queue = await channel.assertQueue('',{
          //exclusive:true //delete the queue when the messages delivered
          durable:true
      })
           //bind
      await channel.bindQueue(direct_queue.queue,exchange,routingKey)
  
          channel.consume(direct_queue.queue,async function(message){
               await write_in_csv()
               it = it+1
               console.log(it)
          }, {
              noAck: true
          })
  
    } catch (e) {
        console.log(e)
    }
  }

  async function connectional4(){
    try {
      //Here is our connection
      const connect = await amqp.connect(RabbitSettings)
      console.log("The connection establised with RabbitMQ...")
  
      //Create a channel
      const channel = await connect.createChannel()
      console.log("The channel is created ...")
  
      const exchange = "direct_exchange"
  
      await channel.assertExchange(exchange,'direct',{
        durable:true
      })
      console.log(`The Exchange ${exchange} is created ...`)
  
      const routingKey = "routingKeyD"
  
      const direct_queue = await channel.assertQueue('',{
         // exclusive:true //delete the queue when the messages delivered
         durable:true
        })
           //bind
      await channel.bindQueue(direct_queue.queue,exchange,routingKey)
  
          channel.consume(direct_queue.queue,async function(message){
               await write_in_csv()
               it = it+1
               console.log(it)
          }, {
              noAck: true
          })
  
    } catch (e) {
        console.log(e)
    }
  }

connectional1();
connectional2();
connectional3();
connectional4();

