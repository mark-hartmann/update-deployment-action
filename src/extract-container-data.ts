export interface ContainerData {
    user: string;
    image: string;
    release: string|undefined;
    repository: string|undefined;
}

const extractContainerData = (str: string): ContainerData => {
    const regex = /(?<user>.+)\/(?<name>[\w-]+)(?<release>.+)?/gm;

    let repo;
    let user: string;
    let image: string;
    let release;

    let m;
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {

            if (groupIndex === 0) {
                return;
            }

            switch (groupIndex) {
                case 1:
                    if (match.includes('/')) {
                        const fragments = match.split('/');
                        // @ts-ignore
                        user = fragments.pop();
                        repo = fragments.join('/');
                    } else {
                        user = match;
                    }
                    break;
                case 2:
                    image = match;
                    break;
                case 3:
                    release = match ? match.replace(':', '') : undefined;
                    break;
            }
        });
    }

    return {
        // @ts-ignore
        image: image,
        release: release,
        repository: repo,
        // @ts-ignore
        user: user,
    }
};

export {extractContainerData};