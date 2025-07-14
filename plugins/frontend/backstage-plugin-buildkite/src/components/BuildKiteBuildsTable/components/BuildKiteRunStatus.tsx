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

import {
  StatusPending,
  StatusRunning,
  StatusOK,
  StatusWarning,
  StatusAborted,
  StatusError,
} from '@backstage/core-components';

export const BuildkiteStatus = ({ status }: { status: string | undefined }) => {
  if (status === undefined) return null;
  switch (status.toLowerCase()) {
    case 'queued':
    case 'scheduled':
      return (
        <>
          <StatusPending /> Queued
        </>
      );
    case 'running':
      return (
        <>
          <StatusRunning /> In progress
        </>
      );
    case 'unstable':
      return (
        <>
          <StatusWarning /> Unstable
        </>
      );
    case 'failed':
      return (
        <>
          <StatusError /> Failed
        </>
      );
    case 'passed':
      return (
        <>
          <StatusOK /> Completed
        </>
      );
    case 'canceled':
      return (
        <>
          <StatusAborted /> Aborted
        </>
      );
    default:
      return (
        <>
          <StatusWarning /> {status}
        </>
      );
  }
};
