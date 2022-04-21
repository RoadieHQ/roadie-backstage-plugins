# backstage-plugin-aws

To use this plugin, you will need to add the cards to the entity page in the frontend app.

Edit the `packages/app/src/components/catalog/EntityPage.tsx` and add the imports

```typescript jsx
import {
    S3BucketCard,
    LambdaFunctionCard,
    IAMUserCard
} from '@roadiehq/backstage-plugin-aws';
```

Then add the following components:

```typescript jsx
<Grid item md={6}>
    <LambdaFunctionCard />
</Grid>
<Grid item md={6}>
    <S3BucketCard />
</Grid>
<Grid item md={6}>
    <IAMUserCard />
</Grid>
```