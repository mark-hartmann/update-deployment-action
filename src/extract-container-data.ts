export interface ContainerData {
    user: string;
    image: string;
    release: string|undefined;
    repository: string|undefined;
}

const extractContainerData = (str: string): ContainerData => {

    const registryRegex = /(.*\/)/;
    const tagRegex = /(?<=:)(?<tag>.+)/;

    const pos = str.search(tagRegex);
    let release;
    if (pos !== -1) {
        release = str.substring(pos);
        str = str.substr(0, pos - 1);
    }

    const pos2 = str.split(registryRegex);

    const image = pos2.pop();
    const registry = pos2.join('');

    let repos;
    let users;
    if (registry) {
        const fragments = registry.replace(/[\/]+$/, "").split('/');
        users = fragments.pop();
        repos = fragments.join('/');
    }

    return {
        // @ts-ignore
        image: image,
        release: release,
        repository: repos || undefined,
        // @ts-ignore
        user: users,
    }
};

export {extractContainerData};