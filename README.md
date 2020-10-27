# update-deployment-action

A simple action for automatically updating docker tags in a Kubernetes deployment within a workflow.

What is it good for? Well, I have tried to find a solution for the deplyoment of multi-repository microservices, which allows the automatic replication of new releases by the services telling the master-repository about a new release per event. are there already better and more sophisticated options? Definitely.

# Usage

Example: A service repository triggers an event named new-release when creating a tag:

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
