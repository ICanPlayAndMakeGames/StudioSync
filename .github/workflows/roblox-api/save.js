const axios = require('axios')
const api = require('./api')

const apiKeyHeaderKey = "x-api-key";
const contentTypeHeaderKey = "Content-type"
const contentTypeHeaderValue = "application/json"


async function SendData(uni_id,place_id,api_key,data,name){
  console.log("this was fired")
  let updateInstanceUrl = `https://apis.roblox.com/cloud/v2/universes/${uni_id}/places/${place_id}/instances/${name}`
  
  const headers = {
    [apiKeyHeaderKey]: api_key,
    [contentTypeHeaderKey]: contentTypeHeaderValue
};

axios.patch(updateInstanceUrl, data, { headers })
    .then(async response =>  {
        try{
          const result = await api.pollForResults(response.data.path,api_key)
          console.log("results: " + result)
        }catch{
          console.error("Something went wrong")
        }
    })
    .catch(error => {
        console.error(error);
    });
}

module.exports = {
    SendData
};
