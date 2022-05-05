# RSS Home page plugin

A react component that renders a RSS feed as a homepage component.
You can configure the plugin to point to a remote RSS feed and it will fetch that RSS feed and render it inside a card componenet.

## Setup

If you didn't set up the HomePage plugin you can see the official documentation about it [here](https://github.com/backstage/backstage/tree/master/plugins/home). You'll need to have it setup to be able to include this plugin.
Add the following componenet to your HomePage.tsx file. The `HomePageRSS` props are the following type.

```bash
yarn add @roadiehq/backstage-plugin-home-rss
```

```ts
export type RSSContentProps = {
  feedURL: string
};
```

You will need to setup a proxy in order to bypass the CORs checks in the browser:

```yaml
proxy:
  "/reuters-news-feed":
    target: "https://www.reutersagency.com/feed"
```

Then you can add a card component to your Home Page.

```tsx
// packages/app/src/components/home/HomePage.tsx
import { HomePageRSS } from '@roadiehq/backstage-plugin-home-rss';

export const HomePage = () => {
  return (
    ...
    <Grid item xs={12} md={6}>
        <HomePageRSS
            feedURL="http://localhost:7007/api/proxy/reuters-news-feed/?best-topics=tech&post_type=best"
            title="Reuters News"
        />
    </Grid>
    ...
  );
};
```
