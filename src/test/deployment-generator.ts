import {adjectives, animals, Config, names, NumberDictionary, uniqueNamesGenerator} from 'unique-names-generator';
import {testDataDirectory} from "./setup";
import fs from 'fs';
import yaml, {Document} from 'yaml';

export interface DeploymentInfo {
    path: string;
    author: string;
    isValid: boolean;
    imageName: string
    initialRelease: string;
    nextRelease: string;
}

const customConfig: Config = {
    dictionaries: [adjectives, names],
    separator: '',
    length: 2,
    style: "lowerCase"
};

export const generateDeployment = (): DeploymentInfo => {
    const author = uniqueNamesGenerator({
        dictionaries: [adjectives, names],
        length: 2,
        style: "lowerCase"
    });
    const imageName = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        length: 2,
        style: "lowerCase",
        separator: '-'
    });
    const releaseConfig: Config = {
        dictionaries: [['r'], animals],
        separator: '-',
        style: "lowerCase"
    };
    const initialRelease = uniqueNamesGenerator(releaseConfig);
    const nextRelease = uniqueNamesGenerator(releaseConfig);

    const documents = [];
    const maxDocuments = [1, 2, 3, 4];
    const totalDocuments = maxDocuments[Math.floor(Math.random()*maxDocuments.length)];

    let services = 0;
    let deployments = 0;
    for (let i = 0; i < totalDocuments; i++) {
        const create = deployments > 0
            ? 'Service'
            : ['Service', 'Deployment'][Math.round(Math.random())];

        if (create === 'Service') {
            services++;
            const content = JSON.parse(fs.readFileSync('./src/test/templates/service-template.json', 'utf8'));
            documents.push(yaml.stringify(content));
        }

        if (create === 'Deployment') {
            deployments++;

            const content = JSON.parse(fs.readFileSync('./src/test/templates/deployment-template.json', 'utf8'));
            const containers = content.spec.template.spec.containers || [];
            containers.forEach((c: any) => {
                c.image = `${author}/${imageName}:${initialRelease}`;
            });

            documents.push(yaml.stringify(content));
        }
    }

    fs.writeFileSync(`${testDataDirectory}/${imageName}-deployment.yaml`, yaml.stringify(documents));

    return {
        author: uniqueNamesGenerator(customConfig),
        initialRelease: initialRelease,
        nextRelease: nextRelease,
        isValid: deployments !== 0,
        imageName: imageName,
        path: `${testDataDirectory}/${imageName}-deployment.yaml`
    }
}