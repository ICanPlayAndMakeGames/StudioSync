const fs = require('fs'); 
const { execSync } = require('child_process');

// Environment variables from GitHub Actions
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_ACTOR = process.env.GITHUB_ACTOR;
const GITHUB_EVENT_NAME = process.env.GITHUB_EVENT_NAME;
const GITHUB_REF = process.env.GITHUB_REF;
const GITHUB_SHA = process.env.GITHUB_SHA;

// Check if the push event is from the github-actions[bot]
if (GITHUB_EVENT_NAME === 'push' && GITHUB_ACTOR === 'github-actions[bot]') {
  console.log('Stop execution: Push event from github-actions[bot]');
  process.exit(0);
}

// Create example.txt
const filePath = 'example.txt';
const content = 'This is an example file created by GitHub Actions';
fs.writeFileSync(filePath, content);

// Configure Git
execSync('git config --global user.name "github-actions[bot]"');
execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');

let textToWrite = "N/A"

try {
  // Get the hash of the last commit
  const lastCommitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();

  // List all files in the last commit
  const filesInLastCommit = execSync(`git diff-tree --no-commit-id --name-only -r ${lastCommitHash}`, { encoding: 'utf-8' }).trim().split('\n');

  // Assuming you want to retrieve content of the first file in the last commit
  if (filesInLastCommit.length > 0) {
    const filePath = filesInLastCommit[0]; // Change index as needed
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    textToWrite = fileContent
  } else {
    console.log('No files found in the last commit.');
  }
} catch (error) {
  console.error('Error retrieving last committed file:', error.message);
}

// Add, commit, and push the file
execSync('git add example.txt');
execSync(`git commit -m "${textToWrite}"`);
execSync(`git push https://${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git ${GITHUB_REF}:${GITHUB_REF}`);

fetch("https://selective-proud-club.glitch.me/")
