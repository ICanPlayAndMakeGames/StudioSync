const axios = require('axios');
const api = require('./api')


const apiKeyHeaderKey = "x-api-key";

const CodeSpaces = ["ServerScriptService", "ServerStorage", "Workspace", "ReplicatedStorage", "ReplicatedFirst", "StarterGui", "StarterPack", "StarterPlayer", "TextChatService", "SoundService", "Teams"];

let CodeSpaceK = {};
let UnOrganisedIds = [];


async function listChildren(instanceId,uni_id,place_id,api_key) {
    
    const listChildrenUrl =     `https://apis.roblox.com/cloud/v2/universes/${uni_id}/places/${place_id}/instances/:instanceId:listChildren`;
    const url = listChildrenUrl.replace(':instanceId', instanceId);
    const headers = { [apiKeyHeaderKey]: api_key };

    try {
        const results = await axios.get(url, { headers });
        return results.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}





async function getChildrenMain(instanceId,uni_id,place_id,api_key) {

    if (api_key){
        console.log("Is api key woah")
    }

    const response = await listChildren(instanceId,uni_id,place_id,api_key);
    if (!response) {
        console.log("Failed");
        await new Promise(resolve => setTimeout(resolve, 15000));
        return getChildrenMain(instanceId,uni_id,place_id,api_key);
    }

    const operationPath = response.path;
    const result = await api.pollForResults(operationPath,api_key);

    try {
        return result.response.instances;
    } catch (e) {
        console.error(e);
        await new Promise(resolve => setTimeout(resolve, 15000));
        return getChildrenMain(instanceId,uni_id,place_id,api_key);
    }
}

async function listDescendants(indexId, check,uni_id,place_id,api_key) {
    const localChildren = {};
    const instances = await getChildrenMain(indexId,uni_id,place_id,api_key);

    if (!instances) {
        console.log("Something oofed");
        return;
    }

    const tasks = instances.map(async instance => {
        const { Name: instanceName, Id: instanceId } = instance.engineInstance;

        if (!check || (instance.hasChildren && CodeSpaces.includes(instanceName))) {
            if (instance.hasChildren) {
                const value = await listDescendants(instanceId, false,uni_id,place_id,api_key);
                localChildren[instanceId] = { Name: instanceName, children: value };
            } else {
                localChildren[instanceId] = { Name: instanceName, children: false };
            }
        }
    });

    await Promise.all(tasks);

    //console.log(localChildren);
    return localChildren;
}

async function getDescendantsForObject(CodeSpaceName, ParentId,uni_id,place_id,api_key) {
    let Path = CodeSpaceK[CodeSpaceName];
    const Parents = [];
    let LastId = ParentId;

    while (true) {
        if (LastId in UnOrganisedIds) {
            LastId = UnOrganisedIds[LastId];
            Parents.push(LastId);
        } else {
            break;
        }
    }

    Parents.reverse();

    for (const i of Parents) {
        if (i in Path) {
            Path = Path[i];
        }
    }

    const Name = Path[ParentId]["Name"];
    const Details = Path[ParentId]["Details"];
    const localChildren = {};
    const instances = await getChildrenMain(ParentId,uni_id,place_id,api_key);

    if (!instances) {
        console.log("Something oofed");
        return;
    }

    for (const instance of instances) {
        const { Name: instanceName, Id: instanceId, Details: instanceDetails } = instance.engineInstance;
        UnOrganisedIds[instanceId] = ParentId;
        localChildren[instanceId] = { Name: instanceName, Details: instanceDetails };
    }

    localChildren["Name"] = Name;
    localChildren["Details"] = Details;
    Path[ParentId] = localChildren;

    const tasks = instances.map(instance => {
        const { Name: instanceName, Id: instanceId } = instance.engineInstance;
        if (instance.hasChildren && CodeSpaces.includes(instanceName)) {
            return getDescendantsForObject(CodeSpaceName, instanceId,uni_id,place_id,api_key);
        }
    });

    await Promise.all(tasks);

    return localChildren;
}

async function start(uni_id,place_id,api_key) {
    const instances = await getChildrenMain("root",uni_id,place_id,api_key);

    if (!instances) {
        console.log("Something oofed");
        return;
    }

    const tasks = instances.map(instance => {
        const { Name: instanceName, Id: instanceId, Details: instanceDetails } = instance.engineInstance;
        if (CodeSpaces.includes(instanceName) && instance.hasChildren) {
            CodeSpaceK[instanceName] = {};
            CodeSpaceK[instanceName][instanceId] = { Name: instanceName, Details: instanceDetails };
            return getDescendantsForObject(instanceName, instanceId,uni_id,place_id,api_key);
        }
    });

    await Promise.all(tasks);

    //console.log("Finished");
    //console.log(CodeSpaceK);
    return CodeSpaceK
}

async function main(uni_id,place_id,api_key) {
    
    if (api_key){
        console.log("IS api key")
    }

    return await start(uni_id,place_id,api_key);
  
}

module.exports = {
    main
};
