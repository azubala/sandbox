const core = require('@actions/core');
const github = require('@actions/github');

try {
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

    const pullRequest = github.context.payload["pull_request"];
    const body = pullRequest["body"];

    console.log(`The PR body: ${body}`);

    
    let dateRegexp = /- \[ \] run TC\s+\[(?<filename>[\w\.\/\-]+)\]\((?<link>[\w\:\/\-\.]+)\)/;
    var parsedTCs = [];

    var lines = body.split('\n');
    for(var i = 0;i < lines.length; i++){
        var line = lines[i];
        let match = line.match(dateRegexp);
        if (match != null) {
            let groups = match.groups;
            let testCase = {name: groups.filename, link: groups.link};
            parsedTCs.push(testCase);
        }
    }

    parsedTCs.forEach(function(testCase) {
        console.log(testCase);
    });    


} catch (error) {
      core.setFailed(error.message);
}