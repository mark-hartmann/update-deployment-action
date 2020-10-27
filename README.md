# update-deployment-action

A simple action for automatically updating docker tags in a Kubernetes deployment within a workflow.

What is it good for? Well, I have tried to find a solution for the deplyoment of multi-repository microservices, which allows the automatic replication of new releases by the services telling the master-repository about a new release per event. are there already better and more sophisticated options? Definitely.

# Usage
When using this action three parameters are passed:

| Input         | Required           | Description  |
| :----------- |:-------------:| :----- |
| tag      | true | The image release/tag you want to deploy |
| name      | true |   The name of the container (in the k8s deployment, not the image name) you want to apply the tag to |
| deployment | true      | the path to the deployment yaml file |

**Important**: the name refers to the name an image was given, not the name of the actual image!

``` yaml
...
  ...
    spec:
      containers:
        - name: <some-name> # this is what you pass as name
          image: <some-author>/<some-image>:<some-tag>
```
---
**Example**: A service repository triggers an event named new-release when creating a tag:

``` yaml
name: generic workflow
on:
  repository_dispatch:
    types: [new-release]
jobs:
  updateDeployment:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout master-repository
        uses: actions/checkout@v2
      - name: Apply the new tag to the image
        uses: mark-hartmann/update-deployment-action@develop
        with:
          tag: ${{ github.event.client_payload.ref }} # refs/tags/ gets automatically removed
          name: name-of-deployment
          deployment: generic-deployment.yaml
```

## Attention
This action commits no changes! Due to flexibility, the change must be committed by the user himself. For example, you could use [this action](https://github.com/ad-m/github-push-action "github-push-action").
