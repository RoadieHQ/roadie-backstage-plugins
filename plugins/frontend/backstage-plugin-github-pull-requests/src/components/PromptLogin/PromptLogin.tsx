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
import React, {useCallback} from 'react';
import Button from '@material-ui/core/Button';
import { EmptyState } from '@backstage/core-components';
import {githubAuthApiRef, useApi} from "@backstage/core-plugin-api";

type Props = {
  title: string
}

export const PromptLogin = (props: Props) => {
  const { title } = props;
  const auth = useApi(githubAuthApiRef);

  const handleLogin = useCallback(() => {
    auth.getAccessToken(['repo']);
  }, [auth]);

  const description = (
      <>
        The <code>{title}</code> plugin requires a login to GitHub.
      </>
  );
  return (
    <EmptyState
      missing="field"
      title={title}
      description={description}
      action={
        <>
          <Button
              color="primary"
              onClick={handleLogin}
          >
            Login
          </Button>
        </>
      }
  />)
};
