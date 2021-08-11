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
import { Link, makeStyles } from '@material-ui/core';
import ExternalLinkIcon from '@material-ui/icons/Launch';
import { FunctionData } from '../types';
import moment from 'moment';
import { StructuredMetadataTable } from '@backstage/core-components';

const useStyles = makeStyles({
  externalLinkIcon: {
    fontSize: 'inherit',
  },
  link: {
    textAlign: 'center',
  },
});

export const FirebaseFunctionDetailsCard = ({
  firebaseFunction,
}: {
  firebaseFunction: FunctionData;
}) => {
  const classes = useStyles();

  return (
    <StructuredMetadataTable
      metadata={{
        name: (
          <Link
            href={`https://console.cloud.google.com/functions/details/${firebaseFunction.region}/${firebaseFunction.name}?project=${firebaseFunction.project}`}
            target="_blank"
            className={classes.link}
          >
            {firebaseFunction.name}
            <ExternalLinkIcon className={classes.externalLinkIcon} />
          </Link>
        ),
        status: firebaseFunction.status,
        'last modified': moment(firebaseFunction.updateTime).fromNow(),
        project: firebaseFunction.project,
        'link to logs': (
          <Link
            href={`https://console.cloud.google.com/logs/viewer?project=${firebaseFunction.project}&resource=cloud_function%2Ffunction_name%2F${firebaseFunction.name}%2Fregion%2F${firebaseFunction.region}`}
            target="_blank"
          >
            view logs
          </Link>
        ),
      }}
    />
  );
};
