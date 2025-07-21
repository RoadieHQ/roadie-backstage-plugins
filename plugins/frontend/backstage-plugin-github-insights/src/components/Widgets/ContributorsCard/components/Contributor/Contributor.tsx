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

import { Avatar, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ContributorTooltipContent from '../ContributorTooltipContent';
import { ContributorData } from '../../../../types';

type Props = {
  contributor: ContributorData;
};

const LightTooltip = withStyles({
  tooltip: {
    backgroundColor: 'white',
    border: '1px solid lightgrey',
    color: '#333',
    minWidth: '320px',
  },
})(Tooltip);

const Contributor = ({ contributor }: Props) => (
  <LightTooltip
    title={<ContributorTooltipContent contributorLogin={contributor.login} />}
    interactive
  >
    <Avatar
      key={contributor.login}
      alt={contributor.login}
      src={contributor.avatar_url}
    />
  </LightTooltip>
);

export default Contributor;
