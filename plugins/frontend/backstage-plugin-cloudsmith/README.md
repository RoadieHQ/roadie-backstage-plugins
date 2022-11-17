# backstage-plugin-cloudsmith

To use this plugin, you will need to add the cards to the entity page in the frontend app.

Edit the `packages/app/src/components/home/Homepage.tsx` and add the imports

Then add the following components:

```typescript jsx
<Grid item md={6}>
  <CloudsmithStatsCard repo="repo" owner="owner" />
</Grid>
```
