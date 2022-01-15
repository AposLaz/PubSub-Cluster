//begin the database
const mongodb = require("./rabbit_con_prod/mongodb-init.js")

mongodb.bootstrap((error,result)=>{
    //we run the consumer first
    const rabbit_consumer_post = require('./rabbit_con_prod/consumer_post')
    const rabbit_consumer_get = require('./rabbit_con_prod/consumer_get')

})