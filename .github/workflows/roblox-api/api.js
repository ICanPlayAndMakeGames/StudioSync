const axios = require('axios');

const getOperationUrl = "https://apis.roblox.com/cloud/v2/:operationPath";

const numberOfRetries = 10;
const retryPollingCadence = 5000;

const doneJSONKey = "done";
const apiKeyHeaderKey = "x-api-key";

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

module.exports = {
  pollForResults
}