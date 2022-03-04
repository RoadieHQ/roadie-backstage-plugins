# Markdown Home page plugin

A react component that renders a markdown file from github as a homepage component. You can configure the plugin to point to a remote markdown file in github and it will fetch that markdown file and render it inside a card componenet.
It fetches on every render but it caches based on the etag that gets returned by the github api.

## Preview

## Setup

If you didn't set up the HomePage plugin you can see the official documentation about it [here](https://github.com/backstage/backstage/tree/master/plugins/home). You'll need to have it setup to be able to include this plugin.
Add the following componenet to your HomePage.tsx file. The `HomePageMarkdown` props are the following type.

```bash
yarn add @roadiehq/backstage-home-plugin-markdown
```

```ts
export type MarkdownContentProps = {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
};
```

```tsx
// packages/app/src/components/home/HomePage.tsx
import { HomePageMarkdown } from '@roadiehq/backstage-home-plugin-markdown';

export const HomePage = () => {
  return (
    ...
    <Grid item xs={12} md={6}>
        <HomePageMarkdown
            title="Neeews!"
            owner="test"
            repo="roadie-backstage-plugins"
            path=".backstage/README.md"
        />
    </Grid>
    ...
  );
};
```
