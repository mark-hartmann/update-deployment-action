import {getInput} from '@actions/core';
import yaml, {Document} from 'yaml';
import fs from 'fs';
import {ContainerData, extractContainerData} from "./extract-container-data";
import Parsed = Document.Parsed;


export interface UpdateResult {
    found: ContainerData | undefined;
    changedTo: ContainerData | undefined;
}

const run = (): UpdateResult => {
    const tag = process.env.TAG || getInput('tag');
    const deploymentName = process.env.IMAGE || getInput('name');
    const deployment = process.env.DEPLOYMENT_MANIFEST || getInput('deployment');

    if (!fs.existsSync(deployment)) {
        throw new Error(`Unable to find ${deployment}`);
    }

    const fileContents = fs.readFileSync(deployment, 'utf8');

    if (fileContents === '') {
        throw new Error('File is empty');
    }

    const documents: any = [];
    const yamlDocuments = yaml.parseAllDocuments(fileContents);

    let modifiedData;
    let originalData;

    yamlDocuments.forEach((document: Parsed) => {
        const json = document.toJSON();

        // Check if its a deployment before trying to manipulate it. If not, return early
        if (!json.kind || json.kind !== 'Deployment') {
            documents.push(document);
            return;
        }

        const containers = json.spec.template.spec.containers || [];
        containers.forEach((c: any) => {
            const containerData = extractContainerData(c.image);
            originalData = containerData;

            // check if this container is the one we try to apply the tag to
            if (containerData.image === deploymentName) {
                let newValue = `${containerData.image}`;

                if (containerData.author) {
                    newValue = `${containerData.author}/${newValue}`;
                }

                if (containerData.registry) {
                    newValue = `${containerData.registry}/${newValue}`;
                }

                c.image = `${newValue}:${tag}`;
            }

            modifiedData = extractContainerData(c.image);
        });

        documents.push(yaml.stringify(json));

        // for some reason the yaml package is not able to create a stream of documents. They recommend concatenating all
        // documents using ...\n, but we're using ---\n instead
        // @see https://eemeli.org/yaml/#yaml-stringify
        // @see https://yaml.org/spec/1.1/index.html#document%20boundary%20marker/
        let content = '';
        for (let i = 0; i < documents.length; i++) {
            const separator = (i !== documents.length - 1) ? '---\n' : '\n';
            content = content + documents[i] + separator;
        }

        fs.writeFileSync(deployment, content);
    });

    return {
        found: originalData,
        changedTo: modifiedData
    }
};

if (process.env.NODE_ENV !== 'test') {
    run();
}

export {run};