# Iframe plugin

## Features

- Displays a simple iframe from a url

## Plugin Setup

1. If you have standalone app (you didn't clone this repo), then in the [packages/app](https://github.com/backstage/backstage/blob/master/packages/app/) directory of your backstage instance, add the plugin as a package.json dependency:

```bash
yarn add @roadiehq/backstage-plugin-iframe
```

2. Import the plugin to the [entityPage.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/components/catalog/EntityPage.tsx) source file:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { 
  iframePlugin,
  EntityIFrameCard,
  EntityIFrameContent,
} from '@roadiehq/backstage-plugin-iframe';
...

const contentProps = {
  frames: [
    {
      src: "https://example.com"
    }
  ],
  title: "super cool title"
}

const serviceEntityPage = (
  <EntityLayoutWrapper>
    ...
    <EntityLayout.Route 
      path="/mycustom-iframes"
      title="Iframes">
        <EntityIFrameContent {...iframeProps} />
    </EntityLayout.Route>
    ...
  </EntityLayoutWrapper>
);

const iframeProps = {
  src: "https://example.com"
}

const overviewContent = (
  <Grid container spacing={3}>
    ...
    <Grid item md={8}>
      <EntityIFrameCard {...iframeProps}/>
    </Grid>
    ...
  </Grid>
);
```

```tsx
// packages/app/src/components/home/HomePage.tsx
import { HomePageIFrameCard } from '@roadiehq/backstage-plugin-iframe';

export const HomePage = () => {
  return (
    ...
    <Grid item xs={12} md={6}>
        <HomePageIFrameCard
          title="Super cool title"
          src="https://example.com"
        />
      </Grid>
    ...
  );
};
```

## Allowlisting

This particular plugin supports allowlisting. What this means is you can add a domain to the plugin's configuration that will be verified during the creation of the plugins components.

The config is like so:
```
// app-config.yaml
iframe:
  allowList: ["some-domain.com"]
```

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
