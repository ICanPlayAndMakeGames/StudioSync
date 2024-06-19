const fs = require('fs')
const path = require('path')
let files = process.env.Changed_Files
let deleted_files = process.env.Deleted_Files

files = files.split(" ")
deleted_files = deleted_files.split(" ")


async function createFiles(data) {
  fs.access('Game', fs.constants.F_OK, (err) => { 
    if (!err) {
        fs.rmdirSync('Game', { recursive: true });;
    }
  })
  
  fs.access('.github/workflows/update.now', fs.constants.F_OK, (err) => { 
    if (!err) {
        fs.rmdirSync('.github/workflows/update.now', { recursive: true });;
    }
  })
    
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
      const folderName = value['Name'];
      const newParentPath = path.join(parentPath, folderName);
      const folderPath = path.join(parentPath, folderName);

      fs.mkdirSync(folderPath, { recursive: true });

      if (value['Details']) {
        const details = value['Details'];
        if (Object.keys(details).length > 0) {
          const scriptType = Object.keys(details)[0];
          if (scriptType.includes('Script')) {
            const scriptDetails = details[scriptType];
            fs.writeFileSync(path.join(folderPath, 'Source.lua'), scriptDetails['Source']);
            delete scriptDetails['Source'];
            fs.writeFileSync(path.join(folderPath, 'Details.json'), JSON.stringify(scriptDetails, null, 2));
          }
        }
      }

      createFolderStructure(value, newParentPath);
    }
  }
}

async function RetrieveFiles(){
  try {
        const response = await fetch('https://selective-proud-club.glitch.me/GetStudio?code='+process.env["JS_AuthentiCode"]);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data){
          await createFiles(data)
        }
    } catch (error) {
        console.error('Error fetching CodeSpaceK:', error);
    }
}

function SendUpdatedFile(file){
    if (!file | file == " " | file == ""){return}
    if (!file.includes("workflows")){

fs.access(file, fs.constants.F_OK, (err) => { 
    if (!err) {
        console.log('File exists, running code...'); 
        fs.readFile(file, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    process.exit(1); // Exit with error code
  } else {
    console.log('File contents:');
    console.log(JSON.stringify({contents:data}));
   try{
     fetch("https://selective-proud-club.glitch.me/UpdateF",{
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({contents:data,deleted:false,file:file})
     })
   }catch{
     console.error("idk1")
   }
  }
  }) 
    }else{
        try{
     fetch("https://selective-proud-club.glitch.me/UpdateF",{
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({contents:null,deleted:true,file:file})
     })
   }catch{
     console.error("idk1")
   }
    }
});
}else if(file.includes("update.now")){
  RetrieveFiles()
}
}

for (let i = 0; i <= files.length - 1;i++){
    SendUpdatedFile(files[i])
}

for (let i = 0; i <= deleted_files.length - 1;i++){
  SendUpdatedFile(deleted_files[i])
}

console.log(files)