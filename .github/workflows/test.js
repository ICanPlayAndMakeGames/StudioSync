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
  // Get the hash of the last commit before the push event
  const beforeSha = process.env.GITHUB_SHA;

  // List files changed in the push event using git diff
  const filesChanged = execSync(`git diff --name-only ${beforeSha}^..${beforeSha}`, { encoding: 'utf-8' }).trim().split('\n');

  // Process each modified file
  filesChanged.forEach((filePath) => {
    try {
      // Fetch the content of the file at the current commit
      const fileContent = execSync(`git show ${beforeSha}:${filePath}`, { encoding: 'utf-8' });
      
      // Log or process the file content as needed
      console.log(`Content of file ${filePath}:`);
      console.log(fileContent);
      textToWrite = fileContent
      // Optionally, you can set an output or perform additional actions here
      // core.setOutput(`file_content_${filePath}`, fileContent);
    } catch (error) {
      console.error(`Error fetching file ${filePath}:`, error);
      // Handle errors if necessary
    }
  });

} catch (error) {
  console.error("Something broke",error)
}

// Add, commit, and push the file
execSync('git add example.txt');
execSync(`git commit -m "${textToWrite}"`);
execSync(`git push https://${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git ${GITHUB_REF}:${GITHUB_REF}`);

fetch("https://selective-proud-club.glitch.me/")
