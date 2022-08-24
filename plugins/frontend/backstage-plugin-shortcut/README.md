# Shortcut Plugin for Backstage

![a preview of the Shortcut plugin](./docs/shortcut.png)

This plugin provides overview of user stories which are not yet completed but are assigned to a user. In order to retrieve stories you will need to sign in to Backstage using same email address used for Shortcut account.

## Rate Limit

The Shortcut REST API limits requests to 200 per minute. Any requests over that limit will not be processed, and will return a 429 (“Too Many Requests”) response code.

## Authentication

The Shortcut API uses token-based authentication so in order to retrieve results you will need it. To generate an API token, go to https://app.shortcut.com/settings/account/api-tokens.

## Features

- Shortcut stories progress overview.

## How to add shortcut plugin to Backstage app:

If you have your own backstage application without this plugin, here it's how to add it:

1. Install the plugin inside `backstage/packages/app` :

```bash
cd packages/app
yarn add @roadiehq/backstage-plugin-shortcut
```

2. In the `app-config.yaml` file in the root directory, add shortcut to the proxy object:

```yml
proxy:
  ...
  '/shortcut/api':
    target: https://api.app.shortcut.com/api/v3
    headers:
      Shortcut-Token: '${SHORTCUT_API_TOKEN}'
```

## How to add Shortcut stories card to Home page:

In order to add the Shortcut stories card in your Home page, follow the instructions below:

```ts
// packages/app/src/components/home/HomePage.tsx
import { HomepageStoriesCard } from '@roadiehq/backstage-plugin-shortcut';
...

export const HomePage = () => {
  <PageWithHeader title="Home" themeId="home">
    <Content>
    ...
        <Grid item md={6} xs={12}>
            <HomepageStoriesCard />
        </Grid>
    ...
    </Content>
  </PageWithHeader>
);

```

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
