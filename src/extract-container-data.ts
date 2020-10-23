export interface ContainerData {
    registry: string|undefined;
    author: string|undefined;
    image: string;
    tag: string|undefined;
}

const extractContainerData = (str: string): ContainerData => {

    const registryRegex = /(.*\/)/;
    const tagRegex = /(?<=:)(?<tag>.+)/;

    let image;
    let registry;
    let author;
    let tag;

    // extract the tag if present
    const tagPosition = str.search(tagRegex);

    if (tagPosition !== -1) {
        tag = str.substring(tagPosition);
        str = str.substr(0, tagPosition - 1);
    }

    const imagePrefixParts = str.split(registryRegex);

    image = imagePrefixParts.pop();
    registry = imagePrefixParts.join('');

    if (registry) {
        // trim the last forward slash which is a result of the image extraction
        const registryParts = registry.replace(/[\/]+$/, "").split('/');

        // naively assuming that every registry uses the authors name at the end
        author = registryParts.pop();
        registry = registryParts.join('/');
    }

    if (image === undefined) {
        throw new Error('This should never ever be thrown...');
    }

    return {
        registry: registry || undefined,
        author: author || undefined,
        image,
        tag: tag || undefined
    }
};

export {extractContainerData};