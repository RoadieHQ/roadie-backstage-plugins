# backstage-plugin-amplitude

This plugin allows you to display statistics from Amplitude.

You will first need to configure a proxy with the api key and secret for the Amplitude API and encode it for a basic Authorization header.

```yaml
proxy:
  '/amplitude':
    target: 'https://amplitude.com/api'
    headers:
      Authorization: Basic ${AMPLITUDE_API_SECRET}
```

It can show the data from an existing dashboard on the backstage homeapge using the `AmplitudeChartCard` by adding the following to your `HomePage.tsx`:

```typescript jsx
import { AmplitudeChartCard } from '@roadiehq/backstage-plugin-amplitude';
...

export const HomePage = () => {
  return (
    <PageWithHeader title="Home" themeId="home">
      <Content>
        <Grid container spacing={3}>
          ...
          <Grid item md={6} xs={12}>
            <AmplitudeChartCard
              chartId="abcdef"
              title="Chart Data"
            />
          </Grid>
          ...
```
