var amqp = require('amqplib');
var amqp_callback = require('amqplib/callback_api');


const fs = require('fs');
const csvWriter = require('csv-write-stream')

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


const RabbitSettings = {
    protocol: 'amqp',
    hostname: 'rabbit-1',
    port: 5672,
    username: 'guest',
    password: 'guest',
    vhost: '/',
    authMechanism: ['PLAIN','AMQPLAIN','EXTERNAL']
}
/*-----------------------------------------------------------------------
                             POST
-------------------------------------------------------------------------*/
const rabbit_direct_producer_1 = async function connect(channel1, ngsi,callback){
      const exchange = "direct_exchange"
      routing_key = "routingKeyA"
      channel1.publish(exchange, routing_key, Buffer.from(JSON.stringify(ngsi)), {},async function (err,ok){
         if (err !== null){ 
           //console.warn('Message nacked!')
           await write_in_csv_error()
           callback(err,null)
          }
         else {
           //console.log('Message acked')
           await write_in_csv_T2()
           callback(null,ok)
         }
      });

}


const rabbit_direct_producer_2 = async function connect(channel2, ngsi,callback){
  const exchange = "direct_exchange"
  routing_key = "routingKeyB"
  channel2.publish(exchange, routing_key, Buffer.from(JSON.stringify(ngsi)), {},async function (err,ok){
      if (err !== null){ 
        //console.warn('Message nacked!')
        await write_in_csv_error()
        callback(err,null)
      }
      else {
        //console.log('Message acked')
        await write_in_csv_T2()
        callback(null,ok)
      }
  });


}


const rabbit_direct_producer_3 = async function connect(channel3 ,ngsi,callback){
  const exchange = "direct_exchange"
  routing_key = "routingKeyC"
  channel3.publish(exchange, routing_key, Buffer.from(JSON.stringify(ngsi)), {},async function (err,ok){
    if (err !== null){ 
      //console.warn('Message nacked!')
      await write_in_csv_error()
      callback(err,null)
    }
    else {
      //console.log('Message acked')
      await write_in_csv_T2()
      callback(null,ok)
    }
});

}


const rabbit_direct_producer_4 = async function connect(channel4, ngsi,callback){
  const exchange = "direct_exchange"
  routing_key = "routingKeyD"
  channel4.publish(exchange, routing_key, Buffer.from(JSON.stringify(ngsi)), {},async function (err,ok){
    if (err !== null){ 
      //console.warn('Message nacked!')
      await write_in_csv_error()
      callback(err,null)
    }
    else {
      //console.log('Message acked')
      await write_in_csv_T2()
      callback(null,ok)
    }
});


}


module.exports = {
    rabbit_direct_producer_1,
    rabbit_direct_producer_2,
    rabbit_direct_producer_3,
    rabbit_direct_producer_4
}
