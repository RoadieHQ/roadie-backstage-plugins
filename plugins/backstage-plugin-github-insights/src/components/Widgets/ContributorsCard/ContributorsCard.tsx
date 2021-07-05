/*
 * Copyright 2020 RoadieHQ
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core-components';
import { Entity } from '@backstage/catalog-model';
import ContributorsList from './components/ContributorsList';
import { useRequest } from '../../../hooks/useRequest';
import { useUrl } from '../../../hooks/useUrl';
import { useProjectEntity } from '../../../hooks/useProjectEntity';
import { useEntity } from "@backstage/plugin-catalog-react";

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
  },
}));

type Props = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
};

const ContributorsCard = (_props: Props) => {
  const { entity } = useEntity();
  const { owner, repo } = useProjectEntity(entity);
  const classes = useStyles();
  const { value, loading, error } = useRequest(entity, 'contributors', 10);
  const { hostname } = useUrl();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return (
      <Alert severity="error" className={classes.infoCard}>
        {error.message}
      </Alert>
    );
  }

  return (
    <InfoCard
      title="Contributors"
      deepLink={{
        link: `//${hostname}/${owner}/${repo}/graphs/contributors`,
        title: 'People',
        onClick: e => {
          e.preventDefault();
          window.open(`//${hostname}/${owner}/${repo}/graphs/contributors`);
        },
      }}
      className={classes.infoCard}
    >
      <ContributorsList contributors={value || []} />
    </InfoCard>
  );
};

export default ContributorsCard;
