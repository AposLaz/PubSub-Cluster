const mongodb = require("mongodb")
const MongoClient = mongodb.MongoClient

const connectionURL = 'mongodb://mongo:27018'
const database = 'ngsi'
//define the db variable
let Clientdb

function getMongoClient(callback){

    if(!Clientdb){
        MongoClient.connect(connectionURL, {useNewUrlParser: true, useUnifiedTopology: true},(error,client)=>{
            if(error){
                console.log("unable to connect at db : ---- "+error)
                return callback(error)
            }
            Clientdb = client.db(database)
            console.log("connected to database ")
            callback(null,Clientdb)
        })
    }
    else{
        callback(null, connectedClientToDb) 
    }
}

let db

function bootstrap(callback){
    getMongoClient((err,result)=>{
        db = result
        callback(err,result)
    })
}

const getDB = ()=> {return db}

module.exports = {
    getDB,
    bootstrap
}