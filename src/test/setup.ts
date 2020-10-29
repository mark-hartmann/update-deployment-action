import {beforeEach} from "@jest/globals";
import fs from 'fs';
import {Config, DeploymentInfo, generateDeployment} from "../deployment-generator";
import {animals, uniqueNamesGenerator} from "unique-names-generator";

process.env.IMAGE = 'mark-hartmann/test-image';
process.env.TAG = '0.0.2';
process.env.DEPLOYMENT_MANIFEST = 'test-deployment.yaml';

export const testDataDirectory = process.cwd() + "/deployments";

beforeEach(() => {
    fs.mkdirSync(testDataDirectory);
});

afterEach(() => {
    fs.rmdirSync(testDataDirectory, {recursive: true});

    // reset all environment variables so we don't have to do it manually
    process.env.IMAGE = undefined;
    process.env.TAG = undefined;
    process.env.DEPLOYMENT_MANIFEST = undefined;
});

export const setup = (config?: Config): DeploymentInfo => {
    const deployment = generateDeployment(config);

    process.env.IMAGE = deployment.container?.name || uniqueNamesGenerator({
        dictionaries: [animals]
    });

    process.env.TAG = deployment.nextRelease || uniqueNamesGenerator({
        dictionaries: [animals]
    });

    process.env.DEPLOYMENT_MANIFEST = deployment.path;

    return deployment;
};