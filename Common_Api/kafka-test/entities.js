const {Kafka} = require('kafkajs');

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:19092','localhost:29092','localhost:39092'],
})

const admin = kafka.admin()
const run_admin = async ()=>{
    await admin.connect()
    await admin.createTopics({
        topics: [
            {
                topic: 'send'
            }
        ]
          
    })
    await admin.disconnect()
}
run_admin().then(console.log("ok started")).catch(e => console.error(`[example/admin] ${e.message}`, e))
const kafka_producer = kafka.producer()
const connect_prod = async () => { 
    await kafka_producer.connect() 
}

connect_prod().then(console.log("producer connected")).catch(e => console.error('Producer didnt connected'))


// const run = async()=>{
//     await kafka_producer.send({
//         topic: 'send',
//         ack:1,
//         messages: [
//                     { value : JSON.stringify(ngsi) }
//                 ]
//             })
// }

// try{

//    run().then(async ()=>{
//      res.status(200).send("Entity posted succesfully")
//    }).catch(e => console.log("Error"))


// }catch (error){
//     console.error(error)
// }                

