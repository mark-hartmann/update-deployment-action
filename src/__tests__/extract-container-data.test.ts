import {extractContainerData} from "../extract-container-data";
import {adjectives, names, uniqueNamesGenerator} from 'unique-names-generator';

const getUsername = () => {
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

it('extracts the username, image and explicit tag', () => {
    const username = getUsername();
    const imageName = getImageName();
    const release = 'v4.34.764';

    const data = `${username}/${imageName}:${release}`;
    const extracted = extractContainerData(data);

    expect(extracted.repository).not.toBeDefined();
    expect(extracted.user).toEqual(username);
    expect(extracted.image).toEqual(imageName);
    expect(extracted.release).toEqual(release);
});

it('extracts the username and image but neither repo or release', () => {
    const username = getUsername();
    const imageName = getImageName();

    const data = `${username}/${imageName}`;
    const extracted = extractContainerData(data);

    expect(extracted.repository).not.toBeDefined();
    expect(extracted.release).not.toBeDefined();

    expect(extracted.image).toEqual(imageName);
    expect(extracted.user).toEqual(username);
});

it('extracts the repo, username and image', () => {
    const username = getUsername();
    const imageName = getImageName();
    const repo = 'ghcr.io';

    const data = `${repo}/${username}/${imageName}`;
    const extracted = extractContainerData(data);

    expect(extracted.release).not.toBeDefined();
    expect(extracted.repository).toEqual(repo);
    expect(extracted.image).toEqual(imageName);
    expect(extracted.user).toEqual(username);
});

it('extracts the username, image and explicit tag', () => {
    const username = getUsername();
    const imageName = getImageName();
    const release = 'v4.34.764';
    const repo = 'ghcr.io';

    const data = `${repo}/${username}/${imageName}:${release}`;
    const extracted = extractContainerData(data);

    expect(extracted.repository).toEqual(repo);
    expect(extracted.user).toEqual(username);
    expect(extracted.image).toEqual(imageName);
    expect(extracted.release).toEqual(release);
});

it.todo('can handle DockerHub officials (only the package (+ release))');