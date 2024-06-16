
// Replace with your GitHub repository information
const owner = 'ICanPlayAndMakeGames';
const repo = 'TestIFFT';
const sha = process.env.GITHUB_SHA;

// GitHub GraphQL endpoint
const endpoint = 'https://api.github.com/graphql';

// GraphQL query to fetch commit details
const query = `
  query($owner: String!, $repo: String!, $sha: GitObjectID!) {
  repository(owner: $owner, name: $repo) {
    object(oid: $sha) {
      ... on Commit {
        message
        committedDate
        author {
          name
          email
        }
        changedFiles
        additions
        deletions
      }
    }
  }
}

`;


async function fetchCommitInfo() {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `bearer ${process.env.GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        query,
        variables: { owner, repo, sha }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(data)
      //const commitInfo = data.data.repository.object.history.edges[0].node;

      // Log or process commit information
      //console.log('Commit Message:', commitInfo.message);
      //console.log('Committed Date:', commitInfo.committedDate);
      //console.log('Author:', commitInfo.author.name);
      //console.log('Changed Files:', commitInfo.changedFiles);

      // Log files changed in the commit
      //console.log('Changed Files:');
      //commitInfo.files.nodes.forEach(file => {
        //console.log(`- ${file.path}`);
      //});

      // Optionally, you can perform further actions with commit information

    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching commit info:', error);
    process.exit(1);
  }
}

fetchCommitInfo();
