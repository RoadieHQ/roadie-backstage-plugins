import { Entity } from '@backstage/catalog-model';
import { FC } from 'react';
import { Builds } from './BuildsPage';
import { ContextProvider } from './ContextProvider';

type Props = {
  entity: Entity;
};

export const TravisCIBuildsPage: FC<Props> = ({ entity }) => {
  return (
    <ContextProvider entity={entity}>
      <Builds />
    </ContextProvider>
  );
};
