const fs = require('fs');
const { execSync } = require('child_process');

// Environment variables from GitHub Actions
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_ACTOR = process.env.GITHUB_ACTOR;
const GITHUB_EVENT_NAME = process.env.GITHUB_EVENT_NAME;
const GITHUB_REF = process.env.GITHUB_REF;
const GITHUB_SHA = process.env.GITHUB_SHA;

console.log(GITHUB_REF)

// Check if the push event is from the github-actions[bot]
if (GITHUB_EVENT_NAME === 'push' && GITHUB_ACTOR === 'github-actions[bot]') {
  console.log('Stop execution: Push event from github-actions[bot]');
  process.exit(0);
}

// Create example.txt
const filePath = 'example.txt';
const content = 'This is an example file created by GitHub Actions ahhhhhhh';
fs.writeFileSync(filePath, content);

// Configure Git
execSync('git config --global user.name "github-actions[bot]"');
execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');

let textToWrite = "Hey there"

let CommandThing = 'git commit -m '
CommandThing = CommandThing.concat('"'+textToWrite+'"')
console.log(CommandThing)
// Add, commit, and push the file
execSync('git add example.txt');
execSync('git commit -m "Add example.txt created by GitHub Actions"');
execSync(`git push https://${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git ${GITHUB_REF}:${GITHUB_REF}`);

fetch("https://selective-proud-club.glitch.me/")
