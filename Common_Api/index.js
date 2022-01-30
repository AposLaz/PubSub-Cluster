const express = require('express')
const Service_Discovery = require('./routers/entities')
const body_parser = require('body-parser')
//can use mongoose for validation and npm-validator
//res.status(400).send(error) px gia na epistrefoume to status pou prepei
// 
// https://medium.com/@cachecontrol/validating-api-parameters-in-node-js-e8afb7920327

//const Ajv = require('ajv');

const app = express()
const port = process.env.PORT || 3001

app.use(express.json({type: '*/*'}))      //for access json values and handle them with req
app.use(express.urlencoded({extended:true}))

app.use(Service_Discovery)




app.listen(port, ()=>{
    console.log('Server is up on Port '+port)
})