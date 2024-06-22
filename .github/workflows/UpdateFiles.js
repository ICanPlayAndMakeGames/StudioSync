const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SaveStudio = require('./roblox-api/save');
const GetStudio = require('./roblox-api/get')

let all_keys = {};
let sendData = {};
let files = process.env.Changed_Files.split(" ");
let deleted_files = process.env.Deleted_Files.split(" ");

const CodeSpaces = [
    "ServerScriptService", "ServerStorage", "Workspace", "ReplicatedStorage", 
    "ReplicatedFirst", "StarterGui", "StarterPack", "StarterPlayer", 
    "TextChatService", "SoundService", "Teams"
];

execSync('git config --global user.name "github-actions[bot]"');
execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');

async function checkFileExists(filePath) {
    try{
        await fs.promises.access(filePath)
        return true
    }catch{
        return false
    }
  }

async function createFiles(data) {
    all_keys = {};

    try {
        if (await checkFileExists('.github/workflows/update.now')){
        
        await fs.promises.unlink('.github/workflows/update.now');
        console.log('File deleted successfully')
        }
    } catch (err) {
        console.error('Error deleting file:', err);
    }

    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            createFolderStructure(data[key]);
        }
    }
}

function createFolderStructure(d, parentPath = 'Game') {
    for (const key in d) {
        if (d.hasOwnProperty(key) && key !== 'Name' && key !== 'Details') {
            const value = d[key];
            let folderName = CodeSpaces.includes(value['Name']) ? value['Name'] : key;
            const newParentPath = path.join(parentPath, folderName);
            const folderPath = path.join(parentPath, folderName);

            all_keys[key] = folderName;
            fs.mkdirSync(folderPath, { recursive: true });
            fs.writeFileSync(path.join(folderPath, 'Details.json'), JSON.stringify(value, null, 2));
            console.log("Created ", folderPath);

            if (value['Details']) {
                const details = value['Details'];
                if (Object.keys(details).length > 0) {
                    const scriptType = Object.keys(details)[0];
                    if (scriptType.includes('Script')) {
                        console.log("Was a script");
                        const scriptDetails = details[scriptType];
                        fs.writeFileSync(path.join(folderPath, 'Source.lua'), scriptDetails['Source']);
                        fs.writeFileSync(path.join(folderPath, 'Details.json'), JSON.stringify(value, null, 2));
                    }
                }
            }
            createFolderStructure(value, newParentPath);
        }
    }
}

async function retrieveFiles() {
    try {
        console.log(process.env['api_key']);
        const response = await GetStudio.main(process.env["uni_id"],process.env["place_id"],process.env["api_key"]);
        

        const data = await response.json();
        if (data) {
            await createFiles(data);
            console.log("Finished creating");
            fs.writeFileSync("keys [DO NOT DELETE].json", JSON.stringify(all_keys, null, 2));
            console.log('Changes committed and pushed successfully.');
        }
    } catch (error) {
        console.error('Error fetching CodeSpaceK:', error);
    }
}

async function UpdateJsonAndSend(file, contents) {
    file = file.replace("/Source.lua", "");
    try {
        let doesExist = await checkFileExists(file)
        if (doesExist){
        const data = await fs.promises.readFile(path.join(file, 'Details.json'), 'utf-8');
        let jsonData = JSON.parse(data);
        let fileName = path.basename(file);

        jsonData['Details']['Script']['Source'] = contents;

        fs.writeFileSync(path.join(file, 'Details.json'), JSON.stringify(jsonData, null, 2));
        delete jsonData['Name'];
        delete jsonData['Details']['Script']['RunContext'];
        delete jsonData['Details']['Script']['Enabled'];
        
        jsonData = { "engineInstance": jsonData };
        console.log("Send data: ", sendData);
        await SaveStudio.SendData(process.env["uni_id"],process.env["place_id"],process.env["api_key"],jsonData,fileName)
        }
    } catch (err) {
        console.error('Error updating JSON file:', err);
        throw err;
    }
}

async function sendUpdatedFile(file) {
    if (!file || file === " " || file === "") return;

    let NormalFile = file;

    if (file.includes("Game")) {
        try {
            const data = await fs.promises.readFile("keys [DO NOT DELETE].json", 'utf8');
            const keys = JSON.parse(data);
            for (const key in keys) {
                if (file.includes(key)) {
                    file = file.replace(key, keys[key]);
                }
            }
        } catch (err) {
            console.error('Error reading keys file:', err);
        }
    }

    console.log(file);

    if (!file.includes("workflows")) {
        try {
            console.log(NormalFile)
            const fileExists = await checkFileExists(NormalFile);
            console.log(fileExists)
            if (fileExists) {
                console.log('File exists, running code...');
                const data = await fs.promises.readFile(NormalFile, 'utf8');
                console.log('File contents:', JSON.stringify({ contents: data }));

                if (file.includes("Source.lua")) {
                    UpdateJsonAndSend(NormalFile, data);
                    
                }

                /*await fetch(`https://selective-proud-club.glitch.me/UpdateF?uniId=${process.env["uni_id"]}&placeId=${process.env["place_id"]}&api_key=${encodeURIComponent(process.env["api_key"])}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ contents: data, deleted: false, file: file, Data: sendData, Name: sendName })
                });*/
            }
        } catch (err) {
            console.error('Error reading or updating file:', err);
        }
    } else if (file.includes("update.now")) {
        retrieveFiles();
    }
}

files.forEach(file => sendUpdatedFile(file));
deleted_files.forEach(file => {
    if (!file.includes("update.now")) {
        sendUpdatedFile(file);
    }
});

console.log(files);
