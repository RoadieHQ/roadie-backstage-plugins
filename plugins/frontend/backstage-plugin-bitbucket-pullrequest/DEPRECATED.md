# Deprecation Notice

This plugin has been deprecated in favor of the Backstage Community plugin: `@backstage-community/plugin-bitbucket-pull-requests`.

## Migration Guide

1. Uninstall this package:

   ```bash
   yarn remove @roadiehq/backstage-plugin-bitbucket-pullrequest
   ```

2. Install the community plugin:

   ```bash
   yarn add @backstage-community/plugin-bitbucket-pull-requests
   ```

3. Update your imports in `packages/app/src/components/catalog/EntityPage.tsx`:
   ```diff
   - import { EntityBitbucketPullRequestsContent } from '@roadiehq/backstage-plugin-bitbucket-pullrequest';
   + import { EntityBitbucketPullRequestsContent } from '@backstage-community/plugin-bitbucket-pull-requests';
   ```

No other changes are needed.

## Why was this deprecated?

This plugin has been migrated to the Backstage Community Plugins repository to ensure better maintenance and broader community support. The community version offers the same functionality and is actively maintained by the Backstage community.

## Need Help?

For issues with the new plugin, please file an issue in the [Backstage Community Plugins repository](https://github.com/backstage/community-plugins).
