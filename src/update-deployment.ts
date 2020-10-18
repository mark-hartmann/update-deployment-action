import * as core from '@actions/core';

const run = async () => {
    const release = core.getInput('release') || 'no release given';
    console.log(release);
};

if (process.env.NODE_ENV !== 'test') {
    run();
}

export default {run};