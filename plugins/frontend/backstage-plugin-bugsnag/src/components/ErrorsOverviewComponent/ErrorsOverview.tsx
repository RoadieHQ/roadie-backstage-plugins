/*
 * Copyright 2021 Larder Software Limited
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

import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { Grid } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  Page,
  Content,
  ContentHeader,
  SupportButton,
  MissingAnnotationEmptyState,
  Progress,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { bugsnagApiRef } from '../..';
import { ErrorsTable } from '../ErrorsTableComponent';
import {
  BUGSNAG_ANNOTATION,
  useBugsnagData,
  useProjectName,
} from '../../hooks/useBugsnagData';

export const isBugsnagAvailable = (entity: Entity) => {
  return Boolean(entity?.metadata.annotations?.[BUGSNAG_ANNOTATION]);
};

export const ErrorsOverview = () => {
  const { entity } = useEntity();
  const organisationName = useBugsnagData()[0];
  const projectApiKey = useBugsnagData()[1];
  const projectName = useProjectName();
  const api = useApi(bugsnagApiRef);
  const configApi = useApi(configApiRef);
  const [slug, setOrganisationSlug] = useState('');
  const perPage = configApi?.getOptionalNumber('bugsnag.resultsPerPage');

  const { value, loading, error } = useAsync(async () => {
    const organisations = await api.fetchOrganisations();
    const organisation = organisations.find(org =>
      org.name.includes(organisationName),
    );
    setOrganisationSlug(organisation?.slug || '');

    const projects = await api.fetchProjects({
      organisationId: organisation ? organisation.id : undefined,
      projectName: projectName ? projectName : undefined,
      perPage,
    });

    const filteredProject = projects.find(proj =>
      proj.api_key.includes(projectApiKey),
    );
    return filteredProject;
  });

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return isBugsnagAvailable(entity) ? (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="Bugsnag logs">
          <SupportButton>Overview of Bugsnag errors</SupportButton>
        </ContentHeader>
        <Grid>
          {value ? (
            <Grid item>
              <ErrorsTable project={value || {}} organisationName={slug} />
            </Grid>
          ) : null}
        </Grid>
      </Content>
    </Page>
  ) : (
    <MissingAnnotationEmptyState annotation={BUGSNAG_ANNOTATION} />
  );
};
