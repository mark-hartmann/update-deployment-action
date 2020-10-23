import {extractContainerData} from "../extract-container-data";
import {adjectives, names, uniqueNamesGenerator} from 'unique-names-generator';

const getAuthorName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, names],
        length: 2,
        style: "lowerCase"
    });
};

const getImageName = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, names],
        length: 2,
        style: "lowerCase"
    });
};

it('extracts the author, image and explicit tag', () => {
    const author = getAuthorName();
    const image = getImageName();
    const tag = 'v4.34.764';

    const data = `${author}/${image}:${tag}`;
    const extracted = extractContainerData(data);

    expect(extracted.registry).not.toBeDefined();
    expect(extracted.author).toEqual(author);
    expect(extracted.image).toEqual(image);
    expect(extracted.tag).toEqual(tag);
});

it('extracts the author and image but neither registry or tag', () => {
    const author = getAuthorName();
    const image = getImageName();

    const data = `${author}/${image}`;
    const extracted = extractContainerData(data);

    expect(extracted.registry).not.toBeDefined();
    expect(extracted.tag).not.toBeDefined();

    expect(extracted.image).toEqual(image);
    expect(extracted.author).toEqual(author);
});

it('extracts the registry, author and image', () => {
    const author = getAuthorName();
    const image = getImageName();
    const registry = 'ghcr.io';

    const data = `${registry}/${author}/${image}`;
    const extracted = extractContainerData(data);

    expect(extracted.tag).not.toBeDefined();
    expect(extracted.registry).toEqual(registry);
    expect(extracted.image).toEqual(image);
    expect(extracted.author).toEqual(author);
});

it('extracts the author, image and explicit tag', () => {
    const author = getAuthorName();
    const image = getImageName();
    const tag = 'v4.34.764';
    const registry = 'ghcr.io';

    const data = `${registry}/${author}/${image}:${tag}`;
    const extracted = extractContainerData(data);

    expect(extracted.registry).toEqual(registry);
    expect(extracted.author).toEqual(author);
    expect(extracted.image).toEqual(image);
    expect(extracted.tag).toEqual(tag);
});

it('can handle DockerHub officials (only the package name)', () => {
    const image = getImageName();

    const data = `${image}`;
    const extracted = extractContainerData(data);

    expect(extracted.registry).not.toBeDefined();
    expect(extracted.author).not.toBeDefined();
    expect(extracted.tag).not.toBeDefined();
    expect(extracted.image).toEqual(image);
});

it('can handle DockerHub officials (package name + tag)', () => {
    const image = getImageName();
    const tag = 'v4.34.764';

    const data = `${image}:${tag}`;
    const extracted = extractContainerData(data);

    expect(extracted.registry).not.toBeDefined();
    expect(extracted.author).not.toBeDefined();

    expect(extracted.tag).toEqual(tag);
    expect(extracted.image).toEqual(image);
});