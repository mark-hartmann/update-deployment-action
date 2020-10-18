import * as core from '@actions/core';
import yaml, {Document} from 'yaml';
import fs from 'fs';
import Parsed = Document.Parsed;

const run = async () => {
    const image = core.getInput('image');
    const release = core.getInput('release');
    const manifest = core.getInput('deployment-manifest');

    console.log(`Trying to apply ${release} to ${manifest}!`);

    const individuals: any = [];
    fs.access(manifest, (err) => {

        if (err) {
            console.error(err)
            return
        }

        const yamlDocuments = yaml.parseAllDocuments(fs.readFileSync(manifest, 'utf8'));
        yamlDocuments.forEach((document: Parsed) => {
            const json = document.toJSON();

            // Check if its a deployment before trying to manipulate it
            if (!json.kind || json.kind !== 'Deployment') {
                individuals.push(document);
            }

            const containers = json.spec.template.spec.containers || [];
            containers.forEach((c: any) => {
                c.image = `${image}:${release}`;
            });

            individuals.push(yaml.stringify(json));
        });
    });


    console.log(yaml.stringify(individuals));
};

if (process.env.NODE_ENV !== 'test') {
    run();
}

export default {run};