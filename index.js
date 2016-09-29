#! /usr/bin/env node

const GitHubApi = require('github');
const commander = require('commander');
const inquirer = require('inquirer');

function getCommandLineInputs(args) {
  return commander
    .option('-r, --repo <mine>', 'A github repository')
    .parse(args);
}

function getRepoIfMissing(program) {
  if (!program.repo) {
    return inquirer.prompt([{
        name: 'repo',
        message: 'What repo are you interested in?'
      }])
      .then(function(answers) {
        program.repo = answers.repo;
        return program;
      });
  };
  return program;
}

function parseUserAndRepoName(program) {
  const split = program.repo.split('/');
  const user = split[0];
  const repoName = split[1];

  program.user = user;
  program.repoName = repoName;
  return program;
}

function getIssues(program) {
  const github = new GitHubApi();
  return github.issues.getForRepo({
    user: program.user,
    repo: program.repoName
  });
}

function getTitles(issues) {
  return issues.map(issue => issue.title);
}

function sendToStdOut(issues) {
  issues.forEach(issue => console.log(issue));
}
function main() {
  Promise.resolve(getCommandLineInputs(process.argv))
    .then(getRepoIfMissing)
    .then(parseUserAndRepoName)
    .then(getIssues)
    .then(getTitles)
    .then(sendToStdOut);
}

if (require.main === module) {
  main();
}
