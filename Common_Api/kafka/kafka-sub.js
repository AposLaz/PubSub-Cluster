const fs = require('fs');
var csvWriter = require('csv-write-stream')
const ip = require('ip')
const {Kafka} = require('kafkajs');


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [`localhost:19092`,'localhost:29092','localhost:39092','localhost:49092'],
})

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
const topic = 'send'
const kafka_consumer_1 = kafka.consumer({groupId: 'consumer-group'})
const kafka_consumer_2 = kafka.consumer({groupId: 'consumer-group'})
const kafka_consumer_3 = kafka.consumer({groupId: 'consumer-group'})
const kafka_consumer_4 = kafka.consumer({groupId: 'consumer-group'})


const consume = async () => { 
    
    await kafka_consumer_1.connect() 
    await kafka_consumer_2.connect()
    await kafka_consumer_3.connect()
    await kafka_consumer_4.connect()
    
    await kafka_consumer_1.subscribe({topic})
    await kafka_consumer_2.subscribe({topic})
    await kafka_consumer_3.subscribe({topic})
    await kafka_consumer_4.subscribe({topic})

    kafka_consumer_1.run({
        autoCommitInterval: 600000,
        eachMessage: async ({ topic, partition, message }) => {
            await write_in_csv()
            it = it + 1
            console.log("Consumer_1 = "+it)
        },
    })
    kafka_consumer_2.run({
        autoCommitInterval: 600000,
        eachMessage: async ({ topic, partition, message }) => {
            await write_in_csv()
            it = it + 1
            console.log("Consumer_2 = "+it)
        },
    })
    kafka_consumer_3.run({
        autoCommitInterval: 600000,
        eachMessage: async ({ topic, partition, message }) => {
            await write_in_csv()
            it = it + 1
            console.log("Consumer_3 = "+it)
        },
    })
    kafka_consumer_4.run({
        autoCommitInterval: 600000,
        eachMessage: async ({ topic, partition, message }) => {
            await write_in_csv()
            it = it + 1
            console.log("Consumer_4 = "+it)
        },
    })
}

consume().catch(e => console.error(`[example/consumer] ${e.message}`, e))

// const data = async() => {
//     return kafka_consumer_1.describeGroup()
// }
// data().then((dat)=>{
//     console.log(dat)
// })

 
// const admin = kafka.admin()

// const fetch_partitions_MetaData = async() => {
//     const ret = await admin.fetchTopicMetadata({topic:'send'})
//     console.log(ret.topics[0].partitions)
// }

// const admin = kafka.admin()
// const fetch_Topic_Offsets = async() => {
//     const ret = await admin.fetchTopicOffsets('send')
//     console.log(ret)
// }

// fetch_Topic_Offsets()