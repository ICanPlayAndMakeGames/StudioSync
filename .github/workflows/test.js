const fs = require('fs'); 
const { execSync } = require('child_process');

// Get the GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
console.log(GITHUB_TOKEN)
// Create example.txt
fs.writeFileSync('example.txt', 'This is an example file created by GitHub Actions');

// Configure Git
execSync('git config --global user.name "github-actions[bot]"');
execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
execSync(`git remote set-url origin https://${GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`);

// Add, commit, and push the file
execSync('git add example.txt');
execSync('git commit -m "Add example.txt created by GitHub Actions"');
execSync('git push');

fetch("https://selective-proud-club.glitch.me/")
