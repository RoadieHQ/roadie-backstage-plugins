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

import { Entity } from '@backstage/catalog-model';
import { ErrorBoundary, InfoCard } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  MissingAnnotationEmptyState,
  useEntity,
} from '@backstage/plugin-catalog-react';
import { LinearProgress } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { isArgocdAvailable } from '../conditions';
import {
  ArgoCDAppDetails,
  ArgoCDAppHistoryDetails,
  ArgoCDAppList,
} from '../types';
import { useAppDetails } from './useAppDetails';
import {
  ARGOCD_ANNOTATION_APP_NAME,
  useArgoCDAppData,
} from './useArgoCDAppData';
import { ArgoCDApi, argoCDApiRef } from '../api';
import {
  ArgoCDHistoryTable,
  ArgoCDHistoryTableRow,
} from './ArgoCDHistoryTable';

const isHelmChart = (row: any): boolean => {
  return row.source?.chart !== undefined;
};

const getRevisionId = (row: any): string => {
  if (row.revision.hasOwnProperty('revisionID')) {
    return row.revision.revisionID;
  }
  return row.revision;
};

const withRevisionDetails = async (
  api: ArgoCDApi,
  url: string,
  row: any,
): Promise<ArgoCDHistoryTableRow> => {
  if (row.sources) {
    row.source = row.sources[0];
    row.revision = row.revisions[0];
  }
  if (isHelmChart(row)) {
    row.revisionDetails = { author: 'n/a', message: 'n/a', date: 'n/a' };
    return row;
  }

  row.revisionDetails = await api.getRevisionDetails({
    url: url,
    app: row.app,
    appNamespace: row.appNamespace,
    revisionID: getRevisionId(row),
    instanceName: row.instance,
  });
  return row;
};

const ArgoCDHistory = ({ entity }: { entity: Entity }) => {
  const [tableRows, setTableRows] = useState<ArgoCDHistoryTableRow[]>([]);

  const argoCDApi = useApi(argoCDApiRef);
  const { url, appName, appSelector, appNamespace, projectName } =
    useArgoCDAppData({ entity });
  const { loading, value, error, retry } = useAppDetails({
    url,
    appName,
    appSelector,
    appNamespace,
    projectName,
  });

  const revisionsToLoad =
    useApi(configApiRef).getOptionalNumber('argocd.revisionsToLoad') || -1;

  useEffect(() => {
    if (!value) {
      return;
    }
    let apps: ArgoCDAppDetails[];
    if ((value as ArgoCDAppList).items !== undefined) {
      apps = (value as ArgoCDAppList).items ?? [];
    } else if (Array.isArray(value)) {
      apps = value as Array<ArgoCDAppDetails>;
    } else {
      apps = [value as ArgoCDAppDetails];
    }

    const revisions: ArgoCDHistoryTableRow[] = apps
      .filter(app => app?.status?.history)
      .flatMap(app => {
        // @ts-ignore TS2532: The filter statement above prevents this from being undefined
        return app.status.history
          .sort(
            (a, b) =>
              new Date(b.deployedAt || '').valueOf() -
              new Date(a.deployedAt || '').valueOf(),
          )
          .slice(0, revisionsToLoad)
          .map((entry: ArgoCDAppHistoryDetails) => ({
            key: `${app.metadata.name}-${entry.revision}`,
            app: app.metadata.name,
            appNamespace: app.metadata.namespace,
            instance: app.metadata?.instance?.name,
            ...entry,
          }));
      });

    setTableRows(revisions);

    // Update all items at once because otherwise it could lead to the too many re-renders error
    Promise.all(
      revisions.map(
        async row => await withRevisionDetails(argoCDApi, url, row),
      ),
    ).then(rowsWithRevisions => {
      setTableRows(rowsWithRevisions.filter(row => row));
    });
  }, [value, argoCDApi, url, revisionsToLoad]);

  if (loading) {
    return (
      <InfoCard title="ArgoCD history">
        <LinearProgress />
      </InfoCard>
    );
  }
  if (error) {
    return (
      <InfoCard title="ArgoCD history">
        Error occurred while fetching data. {error.message}
      </InfoCard>
    );
  }

  if (tableRows.length) {
    return <ArgoCDHistoryTable data={tableRows} retry={retry} />;
  }

  return null;
};
export const ArgoCDHistoryCard = () => {
  const { entity } = useEntity();
  return !isArgocdAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={ARGOCD_ANNOTATION_APP_NAME} />
  ) : (
    <ErrorBoundary>
      <ArgoCDHistory entity={entity} />
    </ErrorBoundary>
  );
};
