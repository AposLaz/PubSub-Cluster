obj = {
    "id": "house2:smartrooms:room1",
    "type": "Room",
    "temperature": {
          "value": 23,
          "unitCode": "CEL",
          "type": "Property",
          "providedBy": {
                  "type": "Relationship",
                  "object": "smartbuilding:house2:sensor0815"
           }
     },
    "isPartOf": {
          "type": "Relationship",
          "object": "smartcity:houses:house2"
    },
    "isPartOf111111111111111111111111112334223eerrr4ertty23333333333hrtjgrtkjghtrkjghtrkjghrtkjghrtjkhgtrkjghrtkjghrtjkghrtjkghrtjkghrtjkghrtkjghrtkjghrtkjghrtkgjhrktjghrtkjghrtertertertertererterterkjghtrjkghrtjkghrtjkghrtjkghrtkjghrtkjghrtjkghrtjkghrtkjghrtkjgh333333333333333333333333333333453245345353478888888888888888324857378245783458734725347ferufgerjhergwergwfuyfwegyuerwgfyeurwgffffffffffffewrgfyuegrwfyugewryufegrwyfguwggggggggggggggggggggggggewuyrgferyuwgfeuywrgfewygferyuwgfewryugwyuergfweuygfweyurgfewyurfgeyuwgfyuewgf": {
          "type": "Relationship",
          "object": "smartcity:houses:house2"
    },
    "@context": [{"Room": "urn:mytypes:room", "temperature": "myuniqueuri:temperature", "isPartOf": "myuniqueuri:isPartOf"},"https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]
}
  

const size = Buffer.byteLength(JSON.stringify(obj))

console.log(size)