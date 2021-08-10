import { Entity } from '@backstage/catalog-model';
import React from 'react';
import { ContextProvider } from './ContextProvider';
import { LastBuildCard } from './LastBuildCard';

type Props = {
  entity: Entity;
};

export const RecentTravisCIBuildsWidget: React.FC<Props> = ({ entity }) => {
  return (
    <ContextProvider entity={entity}>
      <LastBuildCard />
    </ContextProvider>
  );
};
