test a change

This repo contains the Backstage plugins created and maintained by [Roadie](https://roadie.io). Roadie is a SaaS Backstage solution.

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).

Amongst others, the following plugins can be found within this repo:

- [AI Assistant - RAG AI](https://www.npmjs.com/package/@roadiehq/rag-ai)

- [Github Pull Requests](https://www.npmjs.com/package/@roadiehq/backstage-plugin-github-pull-requests)

- [Github Insights](https://www.npmjs.com/package/@roadiehq/backstage-plugin-github-insights)

- [AWS Lambda](https://www.npmjs.com/package/@roadiehq/backstage-plugin-aws-lambda)

- [Jira](https://www.npmjs.com/package/@roadiehq/backstage-plugin-jira)

- [Datadog](https://www.npmjs.com/package/@roadiehq/backstage-plugin-datadog)

- [Travis CI](https://www.npmjs.com/package/@roadiehq/backstage-plugin-travis-ci)

- [Security Insights](https://www.npmjs.com/package/@roadiehq/backstage-plugin-security-insights)

- [Buildkite](https://www.npmjs.com/package/@roadiehq/backstage-plugin-buildkite)

- [Bugsnag](https://www.npmjs.com/package/@roadiehq/backstage-plugin-bugsnag)

- [Argo CD](https://www.npmjs.com/package/@roadiehq/backstage-plugin-argo-cd) (created in collaboration with [American Airlines](https://github.com/AmericanAirlines))

- [Argo CD Backend](https://www.npmjs.com/package/@roadiehq/backstage-plugin-argo-cd-backend) (contributed by [American Airlines](https://github.com/AmericanAirlines))

- [Cloudsmith](https://www.npmjs.com/package/@roadiehq/backstage-plugin-cloudsmith)

Installation instructions for each plugin can be found in their individual README files.

Backstage is an open platform for creating developer portals. To learn more about the problems it can help solve, please check out our [Ultimate Guide to Backstage by Spotify](https://roadie.io/backstage-spotify/).

##

## Getting Started

To get up and running with this repository, you will need to clone it off of GitHub and run an initial build.

```bash
git clone https://github.com/RoadieHQ/roadie-backstage-plugins.git
cd roadie-backstage-plugins
```

## Fetch dependencies and run an initial build from root directory

```bash
yarn install
yarn tsc
yarn build
```

You will be able to see plugins which are already integrated and installed in package.json inside

```bash
cd packages/app
```

folder.

Inside this repository you can add other plugins by running

```bash
// packages/app
yarn add <<plugin>>
```

followed by

```bash
// packages/app
yarn install
```

and running same command in root directory.

You should be able to run application from root directory, by running

```bash
yarn dev
```

## Structure of the repository.

This repository is a place where all of the RoadieHQ plugins we are developed are integrated under `/plugins` folder. Depending on the type of the plugin they are separated in frontend or backend folder. Please note the scaffolder actions are handled separately. Plugins may be used and/or modified by following steps below:

### Plugins container

Navigate to

```bash
cd roadie-backstage-plugin/plugins
cd backend/frontend
cd selected-plugin
```

Plugin folders consist separate unit tests per every plugin, while general e2e tests are written under

```bash
cd roadie-backstage-plugin/packages/app/cypress/integration
```

folder.

### Sample service

In order to make E2E testing isolated from real entities, we have created `test-entity.yaml` under `packages/entitites`, which will be shown as sample-service entity when you start the app. This is used only for testing purposes and can be modified accordingly.

```bash
cd roadie-backstage-plugin/plugins
cd backend or cd frontend
cd selected-plugin
```

Plugin folders consist of separate unit tests for each plugin, while general E2E tests are written under

```bash
cd roadie-backstage-plugin/packages/app/cypress/integration
```

folder.

## Community

- [Discord chatroom](https://discord.gg/d9SJrQR5uH) - Get support
- [Contributing](https://github.com/RoadieHQ/roadie-backstage-plugins/blob/master/CONTRIBUTING.md) - Start here if you want to contribute
- Give us a star ⭐️ - If you are using Backstage or think it is an interesting project, we would love a star ❤️

## License

Copyright 2022 Larder Software Limited. Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
