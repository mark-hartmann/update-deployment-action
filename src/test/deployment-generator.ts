import {adjectives, animals, names, uniqueNamesGenerator} from 'unique-names-generator';
import {testDataDirectory} from "./setup";
import fs from 'fs';
import yaml from 'yaml';

export interface DeploymentInfo {
    path: string,
    isValid: boolean;
    container: Container,
    nextRelease: string;
}

export interface Container {
    name: string,
    author: string,
    imageName: string,
    release: string,
    repository: string,
}

export interface Deployment {
    manifest: string,
    containers: Container[],
}

function randomIntFromInterval(min: number, max: number): number { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const generateImageName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        length: 2,
        style: "lowerCase",
        separator: '-'
    });
}

const generateReleaseName = () => {
    return uniqueNamesGenerator({
        dictionaries: [['r'], animals],
        separator: '-',
        style: "lowerCase"
    });
}

const generateAuthorName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, names],
        length: 2,
        style: "lowerCase"
    });
}

const serviceFragment = (): string => {
    const templatePath = './src/test/templates/service-template.json';
    return yaml.stringify(JSON.parse(fs.readFileSync(templatePath, 'utf8')));
};


const deploymentFragment = (): Deployment => {

    const templatePath = './src/test/templates/deployment-template.json';
    const content = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    const nContainers = randomIntFromInterval(1, 4);

    const containers: Container[] = [];

    for (let i = 0; i < nContainers; i++) {
        const image = generateImageName();
        const author = generateAuthorName();
        const release = generateReleaseName();
        const repository = ['', 'ghcr.io/'][Math.round(Math.random())];

        content.spec.template.spec.containers.push({
            name: image,
            image: `${repository}${author}/${image}:${release}`
        });

        containers.push({
            name: image,
            author: author,
            release: release,
            imageName: image,
            repository: repository === '' ? 'Docker' : 'Github'
        });
    }

    return {
        manifest: yaml.stringify(content),
        containers: containers,
    };
};

export const generateDeployment = (): DeploymentInfo => {

    const documents = [];
    const maxDocuments = [1, 2, 3, 4];
    const totalDocuments = maxDocuments[Math.floor(Math.random() * maxDocuments.length)];

    let services = 0;
    let deployments = 0;
    let containerToChange: Container;

    for (let i = 0; i < totalDocuments; i++) {
        const create = deployments > 0
            ? 'Service'
            : ['Service', 'Deployment'][Math.round(Math.random())];

        if (create === 'Service') {
            documents.push(serviceFragment());
            services++;
        }

        if (create === 'Deployment') {
            const deployment: Deployment = deploymentFragment();
            const n = deployment.containers.length;

            containerToChange = deployment.containers[Math.floor((Math.random() * n))];
            documents.push(deployment.manifest);

            deployments++;
        }
    }

    const deploymentFile = `${testDataDirectory}/${generateImageName()}-deployment.yaml`;

    fs.writeFileSync(deploymentFile, yaml.stringify(documents));

    return {
        isValid: deployments !== 0,
        nextRelease: generateReleaseName(),
        // @ts-ignore
        container: containerToChange,
        path: deploymentFile
    };
}