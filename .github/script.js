const { execSync } = require('child_process');
const { Octokit } = require("@octokit/core");

const token = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

const prNumber = process.env.GITHUB_REF.split('/')[2];
const repoFull = process.env.GITHUB_REPOSITORY;
const [owner, repo] = repoFull.split('/');

// Check if the file was modified
const diff = execSync(`git fetch origin ${process.env.GITHUB_BASE_REF} && git diff origin/${process.env.GITHUB_BASE_REF} -- CheckinSourceEnum.java`, { encoding: 'utf-8' });

const addedLines = diff
  .split('\n')
  .filter(line => line.startsWith('+') && !line.startsWith('+++'))
  .map(line => line.substring(1).trim());

const enumChanges = addedLines.filter(line => /^[A-Z0-9_]+\s*(,|\;)?$/.test(line));

if (enumChanges.length > 0) {
  const todos = enumChanges.map(enumName =>
    `- [ ] Handle logic for new check-in source: \`${enumName}\`\n`
  ).join('');

  const prDescription = execSync(`gh pr view ${prNumber} --json body -q .body`, { encoding: 'utf-8' });

  if (!prDescription.includes(enumChanges[0])) {
    const updatedDescription = `${prDescription}\n\n### 📝 TODOs Added by Bot:\n${todos}`;

    execSync(`gh pr edit ${prNumber} --body "${updatedDescription.replace(/"/g, '\\"')}"`);
    console.log("PR description updated with TODOs.");
  } else {
    console.log("Enum TODOs already present.");
  }
} else {
  console.log("No enum changes detected.");
}
