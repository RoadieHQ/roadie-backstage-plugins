/*
 * Copyright 2026 Larder Software Limited
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

import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import {
  ArgoCDHistoryTable,
  ArgoCDHistoryTableRow,
} from './ArgoCDHistoryTable';

const renderTable = (row: Partial<ArgoCDHistoryTableRow>) =>
  renderInTestApp(
    <ArgoCDHistoryTable
      data={[
        {
          id: 0,
          revision: '6bed858de32a0e876ec49dad1a2e3c5840d3fb07',
          app: 'guestbook',
          appNamespace: 'argocd',
          deployStartedAt: undefined,
          deployedAt: undefined,
          ...row,
        },
      ]}
      retry={jest.fn()}
    />,
  );

describe('ArgoCDHistoryTable', () => {
  it('shows how long the deployment took', async () => {
    await renderTable({
      deployStartedAt: '2020-11-18T16:45:32Z',
      deployedAt: '2020-11-18T16:47:04Z',
    });

    expect(screen.getByText('Took 00:01:32')).toBeInTheDocument();
  });

  it('shows no duration when the end time is missing', async () => {
    await renderTable({ deployStartedAt: '2020-11-18T16:45:32Z' });

    expect(screen.getByText('guestbook')).toBeInTheDocument();
    expect(screen.queryByText(/^Took/)).not.toBeInTheDocument();
  });

  it('shows no duration when the start time is missing', async () => {
    await renderTable({ deployedAt: '2020-11-18T16:47:04Z' });

    expect(screen.getByText(/^Deployed at/)).toBeInTheDocument();
    expect(screen.queryByText(/^Took/)).not.toBeInTheDocument();
  });
});
