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
  let repo = program.repo;
  if (!repo) {
    return inquirer.prompt([{
        name: 'repo',
        message: 'What repo are you interested in?'
      }])
      .then(function(answers) {
        repo = answers.repo;
        return repo;
      });
  };
  return repo;
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
  return issues.forEach(issue => console.log(issue));
}

function handleErrors(error) {
  console.error('Something went wrong!');
  console.error('Please let us know and send us this message:');
  console.error(error.stack);
}

function getIssuesFromRepo(repo) {
  return Promise.resolve({repo})
    .then(parseUserAndRepoName)
    .then(getIssues)
    .then(getTitles);
}

function getIssuesFromArgs(args) {
  return Promise.resolve(getCommandLineInputs(args))
    .then(getRepoIfMissing)
    .then(getIssuesFromRepo)
    .then(sendToStdOut)
    .catch(handleErrors);
}

function getIssuesFromStdIn(stdin) {
  const rl = readline.createInterface({
    input: process.stdin
  });

  const promises = [];
  rl.on('line', function(line) {
    const linePromise = getIssuesFromRepo(line).then(sendToStdOut);
    promises.push(linePromise);
  });

  rl.on('close', function() {
    Promise.all(promises)
      .then(x => process.exit(0))
      .catch(handleErrors);
  });
}

function main() {
  if(process.stdin.isTTY) {
    getIssuesFromArgs(process.argv);
  } else {
    getIssuesFromStdIn(process.stdin);
  }
}

if (require.main === module) {
  main();
}
