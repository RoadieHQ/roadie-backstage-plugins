# BambooHR plugin

## Features

- Displays a simple iframe from a url

## Plugin Setup

1. If you have standalone app (you didn't clone this repo), then in the [packages/app](https://github.com/backstage/backstage/blob/master/packages/app/) directory of your backstage instance, add the plugin as a package.json dependency:

```bash
yarn add @roadiehq/backstage-plugin-iframe
```

2. Import the plugin to the [entityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) source file:

```tsx
// packages/app/src/components/home/HomePage.tsx
import { HomePageBambooHrWhosOut } from '@roadiehq/backstage-plugin-home-markdown';

export const HomePage = () => {
  return (
    ...
    <Grid item xs={12} md={6}>
        <HomePageMarkdown
            title="Neeews!"
            owner="RoadieHQ"
            repo="roadie-backstage-plugins"
            path=".backstage/README.md"
        />
    </Grid>
    ...
  );
};
```

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
