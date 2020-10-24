import {run} from '../update-deployment';
import {setup} from "../test/setup";

it('throws an error if the deployment-file is not found', () => {
    process.env.DEPLOYMENT_MANIFEST = 'unknown.yaml';
    expect(run).toThrow();
});

it('throws an error if the deployment-file is found but empty', () => {
    setup({
        deployments: {
            amount: 0
        },
        services: {
            amount: 0
        }
    });

    expect(run).toThrow();
});

it('does not throw if the given deployment actually contains no deployment at all', () => {
    setup({
        deployments: {
            amount: 0
        },
        services: {
            amount: 1
        }
    });

    expect(run).not.toThrow();
});

it('finds the correct image by its name', () => {
    const deployment = setup({
        deployments: {
            amount: 1,
            containers: {
                amount: 1
            }
        }
    });
    const result = run();

    expect(result.found?.image).toBeDefined();
    expect(result.found?.image).toEqual(deployment.container.imageName);
});

it.todo('it applies the given release to the existing image');
it.todo('it can handle images with :latest');
it.todo('it can handle images with implicit :latest');
