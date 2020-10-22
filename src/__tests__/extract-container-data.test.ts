import {extractContainerData} from "../extract-container-data";

it('does stuff', () => {
    console.log(extractContainerData('mark-hartmann/img-name:latest'));
    console.log(extractContainerData('github.io/mark-hartmann/img-name'));
});