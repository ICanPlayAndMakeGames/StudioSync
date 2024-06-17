const fs = require('fs')
const path = require('path')
const files = process.env.Changed_Files


path.exists('foo.txt', function(exists) { 
  if (exists) { 
    fs.readFile(files, 'utf8', (err, data) => {
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
       body: JSON.stringify({contents:data,deleted:false})
     })
   }catch{
     console.error("idk1")
   }
  }
  } 
}else{
    try{
     fetch("https://selective-proud-club.glitch.me/UpdateF",{
       method: 'POST',
       headers: {
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({contents:null,deleted:true})
     })
   }catch{
     console.error("idk1")
   }
});


});


console.log(files)
