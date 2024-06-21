const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let all_keys = {};
let sendData = {}
let sendName = ""
let files = process.env.Changed_Files.split(" ");
let deleted_files = process.env.Deleted_Files.split(" ");

const CodeSpaces = ["ServerScriptService", "ServerStorage", "Workspace", "ReplicatedStorage", "ReplicatedFirst", "StarterGui", "StarterPack", "StarterPlayer", "TextChatService", "SoundService", "Teams"];

execSync('git config --global user.name "github-actions[bot]"');
execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');

async function createFiles(data) {
    all_keys = {};

    fs.access('.github/workflows/update.now', fs.constants.F_OK, (err) => { 
        if (!err) {
            fs.unlink('.github/workflows/update.now', (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                    return;
                }
                console.log('File deleted successfully');
            });
        }
    });
  
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
        const response = await fetch(`https://selective-proud-club.glitch.me/GetStudio?uniId=${process.env["uni_id"]}&placeId=${process.env["place_id"]}&api_key=${encodeURIComponent(process.env['api_key'])}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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

async function UpdateJson(file,contents){
  file = file.replace("/Source.lua","")
  return fs.access(file,fs.constants.F_OK,async (err) =>{
    if (!err){
      return await fs.access(file+"/Details.json",fs.constants.F_OK, async(err) =>{
        if (!err){
          return await fs.readFile(file+"/Details.json",'utf-8',async (err,data) =>{
            if (err) {
              console.error('Error reading file1:', err);
              process.exit(1);
          } else {
            data = JSON.parse(data)
            try{

              let fileName = file.split("/")
              fileName = fileName[fileName.length - 1]
               
              data['Details']['Script']['Source'] = contents
              fs.writeFileSync(file+"/Details.json",JSON.stringify(data, null, 2))
              delete data['Name'] 
              delete data['Details']['RunContext']
              sendData = {"engineInstance":data}
              
              sendName = fileName
              console.log("Send data: ",sendData)
              return {"engineInstance":data}
              
            }catch{
              console.error('Json file was adjusted in some way recomend to press fix:', err);
              process.exit(1);
            }
          }
          })
        }
      })
    }
  })
}

async function sendUpdatedFile(file) {
    if (!file || file === " " || file === "") return;

    let NormalFile = file  

    if (file.includes("Game")) {
        fs.access("keys [DO NOT DELETE].json", fs.constants.F_OK, (err) => {
            if (!err) {
                fs.readFile("keys [DO NOT DELETE].json", 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file1:', err);
                        process.exit(1);
                    } else {
                        data = JSON.parse(data);
                        for (const key in data) {
                            if (file.includes(key)) {
                                file = file.replace(key, data[key]);
                            }
                        }
                    }
                });
            }
        });
    }

    console.log(file);

    if (!file.includes("workflows")) {
        fs.access(file, fs.constants.F_OK, (err) => {
            if (!err) {
                console.log('File exists, running code...');
                fs.readFile(file, 'utf8', async (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        process.exit(1);
                    } else {
                        console.log('File contents:', JSON.stringify({ contents: data }));
                        try {
                            
                            if (file.includes("Source.lua")){
                              UpdateJson(NormalFile,JSON.stringify(data))
                              await new Promise(resolve => setTimeout(resolve, 750))
                              console.log(sendData,sendName)
                            }

                            fetch(`https://selective-proud-club.glitch.me/UpdateF?uniId=${process.env["uni_id"]}&placeId=${process.env["place_id"]}&api_key=${encodeURIComponent(process.env["api_key"])}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ contents: data, deleted: false, file: file, Data: sendData,Name: sendName})
                            });
                        } catch (error) {
                            console.error("Error:", error);
                        }
                    }
                });
            } else {
                try {
                    fetch("https://selective-proud-club.glitch.me/UpdateF", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ contents: null, deleted: true, file: file })
                    });
                } catch (error) {
                    console.error("Error:", error);
                }
            }
        });
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
