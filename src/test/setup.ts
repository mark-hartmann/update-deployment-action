import {beforeEach} from "@jest/globals";
import fs from 'fs';

process.env.IMAGE = 'mark-hartmann/test-image';
process.env.RELEASE = '0.0.2';
process.env.DEPLOYMENT_MANIFEST = 'test-deployment.yaml';

export const testDataDirectory = process.cwd() + "/deployments";

beforeEach(() => {
    fs.mkdirSync(testDataDirectory);
});

afterEach(() => {
    fs.rmdirSync(testDataDirectory);
});