const core = require('@actions/core');
const github = require('@actions/github');

try {
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

    const pullRequest = github.context.payload["pull_request"];
    const body = pullRequest["body"];

    console.log(`The PR body: ${body}`);



} catch (error) {
      core.setFailed(error.message);
}