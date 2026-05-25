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

## Building the src from an entity annotation

`EntityIFrameCard` can read the `src` directly out of an entity annotation
via `srcFromAnnotation`. By default the annotation value is used verbatim,
which means each entity has to store the full URL.

If you'd rather store only an identifier (a dashboard id, a project slug,
etc.) and have the iframe assemble the URL, pass a `transform` function. It
receives the raw annotation value and the entity, and returns the final
`src`. Two helpers are exported for the common cases:

```tsx
// packages/app/src/components/catalog/EntityPage.tsx
import {
  EntityIFrameCard,
  wrapAnnotation,
  intoTemplate,
} from '@roadiehq/backstage-plugin-iframe';

// 1) Prefix only — https://host/prefix/${annotation_value}
//    annotation "abc-123" => https://grafana.example.com/d/abc-123
<EntityIFrameCard
  srcFromAnnotation="grafana/dashboard-id"
  transform={wrapAnnotation('https://grafana.example.com/d/')}
/>

// 2) Prefix + suffix — https://host/foo/${annotation_value}/extra
<EntityIFrameCard
  srcFromAnnotation="my-org/widget-id"
  transform={wrapAnnotation('https://example.com/foo/', '/extra')}
/>

// 3) Free-form template — embed the value anywhere in the URL.
//    Use single quotes so ${value} is not a JS template literal.
<EntityIFrameCard
  srcFromAnnotation="my-org/widget-id"
  transform={intoTemplate('https://example.com/foo/${value}/extra')}
/>

// 4) Custom transform — the entity is the second argument, so you can mix
//    the annotation value with other entity context.
<EntityIFrameCard
  srcFromAnnotation="grafana/dashboard-id"
  transform={(value, entity) =>
    `https://grafana.example.com/d/${value}?var-service=${entity.metadata.name}`
  }
/>
```

The transformed URL is still subject to the `iframe.allowList` check and
the https-only protocol check, so the host you produce must be allowlisted
just like a literal `src`.

### Reading the prefix from frontend-visible config

When the base URL should differ between environments (dev / staging / prod),
hard-coding it in `EntityPage.tsx` is awkward. The factory helper
`wrapAnnotationFromConfig` reads the prefix from `app-config.yaml` instead.
The key must be marked `@visibility: frontend` (declare it in your plugin's
or app's `config.d.ts`) or its value will be stripped before reaching the
browser.

```yaml
# app-config.yaml
iframe:
  grafana:
    baseUrl: https://grafana.example.com/d/ # @visibility: frontend
```

```tsx
// packages/app/src/components/catalog/EntityPage.tsx
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  EntityIFrameCard,
  wrapAnnotationFromConfig,
} from '@roadiehq/backstage-plugin-iframe';
import { useMemo } from 'react';

export const GrafanaDashboardCard = () => {
  const config = useApi(configApiRef);
  // Memoize so the transform identity is stable across re-renders.
  const transform = useMemo(
    () => wrapAnnotationFromConfig(config, 'iframe.grafana.baseUrl'),
    [config],
  );
  return (
    <EntityIFrameCard
      srcFromAnnotation="grafana/dashboard-id"
      transform={transform}
    />
  );
};
```

For anything more involved than a fixed prefix — appending query parameters,
choosing between hosts, combining multiple annotations — write your own
factory with the same shape:

```tsx
import type { Config } from '@backstage/config';
import type { IFrameSrcTransform } from '@roadiehq/backstage-plugin-iframe';

// Custom factory: reads both a base URL and a theme name from config, and
// embeds them alongside the entity's namespace in the final URL.
const grafanaDashboardTransform = (config: Config): IFrameSrcTransform => {
  const baseUrl = config.getString('iframe.grafana.baseUrl');
  const theme = config.getOptionalString('iframe.grafana.theme') ?? 'light';
  return (dashboardId, entity) => {
    const params = new URLSearchParams({
      theme,
      'var-namespace': entity.metadata.namespace ?? 'default',
    });
    return `${baseUrl}${dashboardId}?${params.toString()}`;
  };
};

const GrafanaDashboardCard = () => {
  const config = useApi(configApiRef);
  const transform = useMemo(() => grafanaDashboardTransform(config), [config]);
  return (
    <EntityIFrameCard
      srcFromAnnotation="grafana/dashboard-id"
      transform={transform}
    />
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

---

Roadie gives you a hassle-free, fully customisable SaaS Backstage. Find out more here: [https://roadie.io](https://roadie.io).
