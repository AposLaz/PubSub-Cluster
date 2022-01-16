const request = require('request');
const express = require('express');
const {spawn} = require('child_process')
const ngsi_parser = require('ngsi-parser')


///--------POST
const post_ngsi = (ngsi,content_type,url,callback)=>{
        const content_t = content_type
        const ngsi_l = JSON.stringify(ngsi)

        request.post({
            headers: {'content-type' : content_t },
            url:     url,
            body:    ngsi_l
        }, function(error, response, body){
            //return error if the entity exists
            callback(body) 
        })
}

//--POST attrs

const post_attrs_ngsi = (ngsi,url, content_type, Link,callback)=>{
        const ngsi_conv = JSON.stringify(ngsi) 
    
        request.post({
            headers: {'content-type' : content_type, 'Link' : Link },
            url:     url,
            body:    ngsi_conv
        }, function(error, response, body){
            //return error if the entity exists
            callback(body) 
        })
}

//--------PATCH attrs

const patch_attrs_ngsi = (ngsi,url, content_type, Link,callback)=>{
        const ngsi_conv = JSON.stringify(ngsi) 

        request.patch({
            headers: {'content-type' : content_type, 'Link' : Link  },
            url:     url,
            body:    ngsi_conv
        }, function(error, response, body){
            //return error if the entity exists
            callback(body) 
        })
}

//--------PATCH attrs ID
const patch_attrs_id_ngsi = (ngsi,url,callback)=>{
   
    const ngsi_conv = JSON.stringify(ngsi) 
    
    request.patch({
            headers: {'content-type' : 'application/json' },
            url:     url,
            body:    ngsi_conv
        }, function(error, response, body){
            //return error if the entity exists
            callback(body) 
        })
}   



module.exports = {
    post_ngsi,
    post_attrs_ngsi,
    patch_attrs_ngsi,
    patch_attrs_id_ngsi
};

