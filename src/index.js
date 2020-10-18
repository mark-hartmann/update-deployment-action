const core = require('@actions/core');
const github = require('@actions/github');

try {
    const release = core.getInput('release');
    const manifest = core.getInput('deployment-manifest');

    console.log(`Trying to apply ${release} to ${manifest}!`);


    const time = (new Date()).toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}