const axios = require('dependencies/node_modules/axios/index.js')

const getOperationUrl = "https://apis.roblox.com/cloud/v2/:operationPath";

const numberOfRetries = 10;
const retryPollingCadence = 5000;

const doneJSONKey = "done";
const apiKeyHeaderKey = "x-api-key";
const contentTypeHeaderKey = "Content-type"
const contentTypeHeaderValue = "application/json"

async function getOperation(operationPath,api_key) {
    
    const url = getOperationUrl.replace(':operationPath', operationPath);
    const headers = { [apiKeyHeaderKey]: api_key };

    try {
        const results = await axios.get(url, { headers });
        return results.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function pollForResults(operationPath,api_key) {
    let currentRetries = 0;
    while (currentRetries < numberOfRetries) {
        await new Promise(resolve => setTimeout(resolve, retryPollingCadence));
        const results = await getOperation(operationPath,api_key);
        currentRetries += 1;
        if (results && results[doneJSONKey]) {
            return results;
        }
    }
}

async function SendData(uni_id,place_id,api_key,data,name){
  let updateInstanceUrl = `https://apis.roblox.com/cloud/v2/universes/${uni_id}/places/${place_id}/instances/${name}`
  
  const headers = {
    [apiKeyHeaderKey]: api_key,
    [contentTypeHeaderKey]: contentTypeHeaderValue
};

axios.patch(updateInstanceUrl, data, { headers })
    .then(async response =>  {
        try{
          const result = await pollForResults(response.data.path,api_key)
          console.log(result)
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
