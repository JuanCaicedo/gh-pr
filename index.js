#! /usr/bin/env node
'use strict';

const GitHubApi = require('github');
const commander = require('commander');
const inquirer = require('inquirer');
const readline = require('readline');

function getCommandLineInputs(args) {
  return commander
    .option('-r, --repo <user/repo-name>', 'A github repository')
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

  if(!user) {
    console.error('Please provide a username');
    process.exit(1);
  }

  if(!repoName) {
    console.error('Please provide a full repo name');
    process.exit(1);
  }

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

function handleErrors(error) {
  console.error('Something went wrong!');
  console.error('Please let us know and send us this message:');
  console.error(error.stack);
}

function getIssuesFromArgs(args) {
  return Promise.resolve(getCommandLineInputs())
    .then(getRepoIfMissing)
    .then(parseUserAndRepoName)
    .then(getIssues)
    .then(getTitles)
    .then(sendToStdOut)
    .catch(handleErrors);
}

function getIssuesFromStdIn(stdin) {
  const rl = readline.createInterface({
    input: process.stdin
  });
  rl.on('line', (line) => console.log(line));
}

function main() {
  let issues;
  if(process.stdin.isTTY) {
    issues = getIssuesFromArgs(process.argv);
  } else {
    issues = getIssuesFromStdIn(process.stdin);
  }
  issues
}

if (require.main === module) {
  main();
}
