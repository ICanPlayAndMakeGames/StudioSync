const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process');

let files = process.env.Changed_Files
let deleted_files = process.env.Deleted_Files

const CodeSpaces = ["ServerScriptService", "ServerStorage", "Workspace", "ReplicatedStorage", "ReplicatedFirst", "StarterGui", "StarterPack", "StarterPlayer", "TextChatService", "SoundService", "Teams"];

files = files.split(" ")
deleted_files = deleted_files.split(" ")

execSync('git config --global user.name "github-actions[bot]"');
            execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
            // Stage all changes in the current directory and its subdirectories
            

async function createFiles(data) {
  
  
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
      let folderName = value['Name'];

      if (!CodeSpaces.includes(folderName)){
        folderName = key
      }

      const newParentPath = path.join(parentPath, folderName);
      const folderPath = path.join(parentPath, folderName);

      fs.mkdirSync(folderPath, { recursive: true });

      fs.writeFileSync(path.join(folderPath,'Details.json'),JSON.stringify(value, null, 2))
      
      console.log("Created ",folderPath)

      if (value['Details']) {
        const details = value['Details'];
        if (Object.keys(details).length > 0) {
          const scriptType = Object.keys(details)[0];
          if (scriptType.includes('Script')) {
            console.log("Was a script")
            const scriptDetails = details[scriptType];
            fs.writeFileSync(path.join(folderPath, 'Source.lua'), scriptDetails['Source']);
            //execSync('git add '+path.join(folderPath, 'Source.lua'))
            
            fs.writeFileSync(path.join(folderPath, 'Details.json'), JSON.stringify(value, null, 2));
            //execSync('git add '+path.join(folderPath, 'Details.json'))
          }
        }
      }
      //execSync('git add '+folderPath);
      createFolderStructure(value, newParentPath);
    }
  }
}

async function RetrieveFiles(){
  try { 
        console.log(process.env['api_key'])
        const response = await fetch('https://selective-proud-club.glitch.me/GetStudio?uniId='+process.env["uni_id"]+'&placeId='+process.env["place_id"]+'&api_key='+encodeURIComponent(process.env['api_key']));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data){
          await createFiles(data)
          console.log("finished creating")
          try {
            
            
           // execSync('git status -s');
            //console.log('Git status after staging:');

            // Commit changes with a specific commit message
           // execSync('git commit -m "Files made [skip ci]"');
        
            // Push changes to the remote repository
            //execSync('git push');
        
            console.log('Changes committed and pushed successfully.');
        } catch (error) {
            console.error('Error during git operations:', error);
            process.exit(1); // Exit with non-zero code to indicate failure
        }
        }
    } catch (error) {
        console.error('Error fetching CodeSpaceK:', error);
    }
}

function SendUpdatedFile(file){

  if (file.includes("Game") ){
    let cango = true
    
    if (cango == true){
    fs.access(file+"/Details.json", fs.constants.F_OK, (err) => { 
      if (!err) {
       
        
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file1:', err);
            process.exit(1); // Exit with error code
          } else {
            data = JSON.parse(data)
            if (data["Name"]){
              let files = file.split("/")
              files.pop()
              files.append(data["Name"])
              file = ""
              for (let i; i <= files.length-1;i++){
                file = file + files[i]
                file = file + "/"
              }
              str = file.substring(0, file.length - 1)
            }
          }
      })
    }
    })
  }
}

  console.log(file)

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
  if (!deleted_files[i].includes("update.now")){
  SendUpdatedFile(deleted_files[i])
  }
}

console.log(files)