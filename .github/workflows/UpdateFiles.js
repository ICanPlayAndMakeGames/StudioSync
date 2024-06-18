const fs = require('fs')
const path = require('path')
let files = process.env.Changed_Files

files = files.split(" ")

console.log('https://selective-proud-club.glitch.me/GetStudio?code='+process.env["JS_AuthentiCode"])

async function RetrieveFiles(){
  try {
        const response = await fetch('https://selective-proud-club.glitch.me/GetStudio?code='+process.env["JS_AuthentiCode"]);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error fetching CodeSpaceK:', error);
    }
}

function SendUpdatedFile(file){
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
}else if(file.includes("update")){
  RetrieveFiles()
}
}

for (let i = 0; i <= files.length - 1;i++){
    SendUpdatedFile(files[i])
}

console.log(files)
