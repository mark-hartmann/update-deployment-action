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

function shuffle(a: any) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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


const deploymentFragment = (config: { containers: { amount: number } }): Deployment => {

    const templatePath = './src/test/templates/deployment-template.json';
    const content = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    const nContainers = config.containers.amount;

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

export interface Config {
    services?: {
        amount: number
    },
    deployments?: {
        amount: number,
        containers?: {
            amount: number
        }
    },
    shuffle?: boolean
}

export const generateDeployment = (config?: Config): DeploymentInfo => {

    const documents = [];

    const totalServices = config?.services?.amount || 3
    const totalDeployments = config?.deployments?.amount || 1
    const totalContainersPerDocument = config?.deployments?.containers?.amount || -1;

    let containerToTest: Container;

    for (let i = 0; i < totalServices; i++) {
        documents.push(serviceFragment());
    }

    for (let i = 0; i < totalDeployments; i++) {
        const nContainers = totalContainersPerDocument > -1 ? totalContainersPerDocument : randomIntFromInterval(1, 4);
        const deployment: Deployment = deploymentFragment({
            containers: {
                amount: nContainers
            }
        });

        containerToTest = deployment.containers[Math.floor((Math.random() * nContainers))];
        documents.push(deployment.manifest);
    }

    const deploymentFile = `${testDataDirectory}/${generateImageName()}-deployment.yaml`;

    console.log(shuffle(documents));
    fs.writeFileSync(deploymentFile, yaml.stringify(shuffle(documents)));

    return {
        isValid: totalDeployments !== 0,
        nextRelease: generateReleaseName(),
        // @ts-ignore
        container: containerToTest,
        path: deploymentFile
    };
}