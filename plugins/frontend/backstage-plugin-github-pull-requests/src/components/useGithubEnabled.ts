import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { UserEntity } from '@backstage/catalog-model';
import { useAsync } from 'react-use';

export const useGithubEnabled = () => {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const { loading, value, error } = useAsync(async () => {
    const userIdentity = await identityApi.getBackstageIdentity();
    const userEntity = (await catalogApi.getEntityByRef(
      userIdentity.userEntityRef,
    )) as UserEntity;

    return !userEntity.metadata.annotations?.hasOwnProperty(
      'github.com/read-only',
    );
  });
  return { loading, value, error };
};
