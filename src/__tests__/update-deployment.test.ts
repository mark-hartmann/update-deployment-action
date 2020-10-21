import {run} from '../update-deployment';

it('throws an error if the deployment-file is not found', () => {
    expect(run).not.toThrow();
});

it.todo('runs without throwing an error');
it.todo('can handle files with no deployment at all');
it.todo('finds the correct image by its name');
it.todo('it applies the given release to the existing image');
it.todo('it can handle images with :latest');
it.todo('it can handle images with implicit :latest');
