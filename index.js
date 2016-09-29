#! /usr/bin/env node

const GitHubApi = require('github');
const program = require('commander');

program
  .option('-r, --repo <mine>', 'A github repository')
  .parse(process.argv);

const split = program.repo.split('/');
const user = split[0];
const repo = split[1];

const github = new GitHubApi();
github.issues.getForRepo({
  user: user,
  repo: repo
}, function(err, res) {
  console.log(err, res);
});
