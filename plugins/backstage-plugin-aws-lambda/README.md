# AWS Lambda Plugin

![preview of Lambda Widget](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-aws-lambda/main/docs/lambda-widget.png)

## Repository migration notice (June/July 2021)

In order to make testing and deployment of our plugins easier we are migrating all Roadie plugins to a monorepo at https://github.com/RoadieHQ/roadie-backstage-plugins.
The plugins will still be published to the same place on NPM and will have the same package names so nothing should change for consumers of these plugins.

## Plugin Setup

1. Install the plugin in the `packages/app` directory

```bash
yarn add @roadiehq/backstage-plugin-aws-lambda
```

2. Add widget component to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityAWSLambdaOverviewCard,
  isAWSLambdaAvailable
} from '@roadiehq/backstage-plugin-aws-lambda';

...

const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
   <EntitySwitch>
      <EntitySwitch.Case if={e => Boolean(isAWSLambdaAvailable(e))}>
        <Grid item md={6}>
          <EntityAWSLambdaOverviewCard />
        </Grid>
      </EntitySwitch.Case>
   </EntitySwitch>
  </Grid>
);
```

## Authentication

In order to perform requests to AWS lambda plugin first asks backend for temporary credentials via /api/aws/credentials

(it uses @roadiehq/backstage-plugin-aws-auth backend plugin)

Regardless of what auth method you use - you can also decide what functions to show in the table (what functions particular service uses) by annotating backstage.yaml with name of the functions separated by comma, like:

```yaml
metadata:
  annotations:
    aws.com/lambda-function-name: HelloWorld
    aws.com/lambda-region: us-east-1
```

Make sure you have AWS auth backend plugin installed in your backstage backend (installation guide in the readme https://github.com/RoadieHQ/backstage-plugin-aws-auth)
