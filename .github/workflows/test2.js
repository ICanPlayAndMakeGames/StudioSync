const fs = require('fs')
const files = process.env.Changed_Files

fs.readFile(files, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    process.exit(1); // Exit with error code
  } else {
    console.log('File contents:');
    console.log(data);
    // You can process the file contents further here if needed
  }
});


console.log(files)
