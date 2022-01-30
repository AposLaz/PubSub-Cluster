const fs = require('fs');
var csvWriter = require('csv-write-stream')
const ip = require('ip')
const {Kafka} = require('kafkajs');


const kafka = new Kafka({
    clientId: 'my-app',
    brokers: [`kafka:29093`],
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
const kafka_consumer = kafka.consumer({groupId: 'consumer-group'})

const consume = async () => { 
    await kafka_consumer.connect() 
    await kafka_consumer.subscribe({topic})
    await kafka_consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            await write_in_csv()
            it = it + 1
            console.log(it)
        },
    })
}

consume().catch(e => console.error(`[example/consumer] ${e.message}`, e))


