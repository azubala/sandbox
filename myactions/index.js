const core = require('@actions/core');
const github = require('@actions/github');
const { Toolkit } = require('actions-toolkit')

try {
    const pullRequest = github.context.payload["pull_request"];

    // const payload = JSON.stringify(pullRequest, undefined, 2)
    // console.log(`The PR: \n\n${payload}\n\n`);

    const body = pullRequest["body"];
    const prLink = pullRequest["html_url"];
    const prNumber = pullRequest["number"];

    let tcRegexp = /- \[ \] run TC\s+\[(?<filename>[\w\.\/\-]+)\]\((?<link>[\w\:\/\-\.]+)\)/;
    var parsedTCs = [];

    var lines = body.split('\n');
    for(var i = 0;i < lines.length; i++){
        var line = lines[i];
        let match = line.match(tcRegexp);
        if (match != null) {
            let groups = match.groups;
            let testCase = {name: groups.filename, link: groups.link};
            parsedTCs.push(testCase);
        }
    }

    parsedTCs.forEach(function(testCase) {
        Toolkit.run(async tools => {

        const title = `[TC for PR #${prNumber}] ${testCase.name}`;
        const body = `Related PR: ${prLink}\n\n${testCase.link}`;

        const templated = {
            body: body,
            title: title
        }

        tools.log.debug('Templates compiled', templated)
        tools.log.info(`Creating new issue ${templated.title}`)

        // Create the new issue
        try {
            const issue = await tools.github.issues.create({
                ...tools.context.repo,
                ...templated,
                assignees: [],
                labels: ["test-case"]
            })
            tools.log.success(`Created issue ${issue.data.title}#${issue.data.number}: ${issue.data.html_url}`)
        } catch (err) {
            // Log the error message
            tools.log.error(`An error occurred while creating the issue. This might be caused by a malformed issue title, or a typo in the labels or assignees!`)
            tools.log.error(err)

            // The error might have more details
            if (err.errors) tools.log.error(err.errors)
                // Exit with a failing status
                tools.exit.failure()
            }
        }, {
            secrets: ['GITHUB_TOKEN']
        });
    });

} catch (error) {
      core.setFailed(error.message);
}