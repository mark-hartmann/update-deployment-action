import {adjectives, animals, names, uniqueNamesGenerator} from 'unique-names-generator';
import {testDataDirectory} from "./test/setup";
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
    registry: string | undefined,
    author: string | undefined,
    image: string | undefined,
    tag: string | undefined,
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

const generateTagName = () => {
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


const deploymentFragment = (config: {
    containers: {
        amount: number,
        implicitTag: boolean,
        explicitTag: boolean,
    }
}): Deployment => {

    const templatePath = './src/test/templates/deployment-template.json';
    const content = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    const nContainers = config.containers.amount;

    const containers: Container[] = [];

    for (let i = 0; i < nContainers; i++) {
        const image = generateImageName();
        const author = generateAuthorName();
        const registry = ['', 'ghcr.io/'][Math.round(Math.random())];

        const useExplicitTag = config.containers.explicitTag;
        const useImplicitTag = config.containers.implicitTag;
        const useGeneratedTag = !(useImplicitTag || useExplicitTag);

        let tag;
        if (useGeneratedTag) {
            tag = generateTagName();
        } else if (useExplicitTag) {
            tag = 'latest';
        }

        const tagSuffix = tag ? `:${tag}` : '';
        content.spec.template.spec.containers.push({
            name: image,
            image: `${registry}${author}/${image}${tagSuffix}`
        });

        containers.push({
            name: image,
            registry: registry === '' ? 'Docker' : 'Github',
            author: author,
            image: image,
            tag: tag
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
            amount: number,
            tags?: {
                explicitLatest?: boolean;
                implicitLatest?: boolean;
            }
        }
    },
    shuffle?: boolean
}

export const generateDeployment = (config?: Config): DeploymentInfo => {

    const documents = [];

    const totalServices = config?.services?.amount !== undefined
        ? config.services.amount
        : 3;
    const totalDeployments = config?.deployments?.amount !== undefined
        ? config.deployments.amount
        : 1;
    const totalContainersPerDocument = config?.deployments?.containers?.amount !== undefined
        ? config.deployments.containers.amount
        : -1;

    const useExplicitLatest = config?.deployments?.containers?.tags?.explicitLatest || false;
    const useImplicitLatest = config?.deployments?.containers?.tags?.implicitLatest || false;

    if (useExplicitLatest && useImplicitLatest) {
        throw new Error('Unable to use bot implicit and explicit tags at the same time.');
    }

    let containerToTest: Container;

    for (let i = 0; i < totalServices; i++) {
        documents.push(serviceFragment());
    }

    for (let i = 0; i < totalDeployments; i++) {
        const nContainers = totalContainersPerDocument > -1 ? totalContainersPerDocument : randomIntFromInterval(1, 4);
        const deployment: Deployment = deploymentFragment({
            containers: {
                amount: nContainers,
                explicitTag: useExplicitLatest,
                implicitTag: useImplicitLatest
            }
        });

        containerToTest = deployment.containers[Math.floor((Math.random() * nContainers))];
        documents.push(deployment.manifest);
    }

    const deploymentFile = `${testDataDirectory}/${generateImageName()}-deployment.yaml`;

    // for some reason the yaml package is not able to create a stream of documents. They recommend concatenating all
    // documents using ...\n, but we're using ---\n instead
    // @see https://eemeli.org/yaml/#yaml-stringify
    // @see https://yaml.org/spec/1.1/index.html#document%20boundary%20marker/
    let content = '';
    for (let i = 0; i < documents.length; i++) {
        const separator = (i !== documents.length - 1) ? '---\n' : '\n';
        content = content + documents[i] + separator;
    }

    fs.writeFileSync(deploymentFile, content);

    return {
        isValid: totalDeployments !== 0,
        nextRelease: generateTagName(),
        // @ts-ignore
        container: containerToTest,
        path: deploymentFile
    };
}