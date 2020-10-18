import {getInput} from '@actions/core';
import yaml, {Document} from 'yaml';
import fs from 'fs';
import Parsed = Document.Parsed;

const run = () => {
    const image = process.env.IMAGE || getInput('image');
    const release = process.env.RELEASE || getInput('release');
    const manifest = process.env.DEPLOYMENT_MANIFEST || getInput('deployment-manifest');

    console.log(`Trying to apply ${release} to ${manifest}!`);

    const individuals: any = [];
    fs.access(manifest, (err) => {

        if (err) {
            throw Error(err.message);
        }

        const yamlDocuments = yaml.parseAllDocuments(fs.readFileSync(manifest, 'utf8'));
        yamlDocuments.forEach((document: Parsed) => {
            const json = document.toJSON();

            // Check if its a deployment before trying to manipulate it
            if (json.kind && json.kind === 'Deployment') {
                const containers = json.spec.template.spec.containers || [];
                containers.forEach((c: any) => {
                    c.image = `${image}:${release}`;
                });

                individuals.push(yaml.stringify(json));
            } else {
                individuals.push(document);
            }
        });
    });

    console.log(yaml.stringify(individuals));
};

if (process.env.NODE_ENV !== 'test') {
    run();
}

export {run};