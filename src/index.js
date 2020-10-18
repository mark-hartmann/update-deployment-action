const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('yaml');
const fs = require('fs');

try {
    const image = core.getInput('image');
    const release = core.getInput('release');
    const manifest = core.getInput('deployment-manifest');

    console.log(`Trying to apply ${release} to ${manifest}!`);
    const documents = yaml.parseAllDocuments(fs.readFileSync('./test-deployment.yaml', 'utf8'));

    const docs = [];
    documents.forEach((doc) => {
        const json = doc.toJSON();
        if (json.kind && json.kind === 'Deployment') {
            const containers = json.spec.template.spec.containers || [];
            containers.forEach((c) => {
                c.image = `${image}:${release}`;
            })

            doc = yaml.stringify(json);
        }

        docs.push(doc);
    });

} catch (error) {
    core.setFailed(error.message);
}