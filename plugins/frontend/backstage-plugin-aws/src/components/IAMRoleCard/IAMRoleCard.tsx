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

import { useState } from 'react';
import {
  InfoCard,
  InfoCardVariants,
  StructuredMetadataTable,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { Box, CircularProgress, makeStyles } from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { useEntity } from '@backstage/plugin-catalog-react';
import { awsApiRef } from '../../api/AwsApi';
import { IAM_ROLE_ARN_ANNOTATION } from '../../constants';
import { parse as parseArn } from '@aws-sdk/util-arn-parser';
import { useAsync } from 'react-use';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
    '& .MuiCardContent-root': {
      padding: theme.spacing(2, 1, 2, 2),
    },
    '& td': {
      whiteSpace: 'normal',
    },
  },
}));

type Props = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
  variant?: InfoCardVariants;
};

export const IAMRoleCard = (props: Props) => {
  const { entity } = useEntity();
  const awsApi = useApi(awsApiRef);
  const [roleDetails, setRoleDetails] = useState<any | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [annotationError, setAnnotationError] = useState<string | undefined>();

  useAsync(async () => {
    if (!roleDetails) {
      if (
        entity.metadata.annotations &&
        entity.metadata.annotations[IAM_ROLE_ARN_ANNOTATION]
      ) {
        setLoading(true);

        const roleArn = entity.metadata.annotations[IAM_ROLE_ARN_ANNOTATION];

        const { accountId, resource } = parseArn(roleArn);
        const resourceNameParts = resource.split('/');

        const iamRoleDetails = await awsApi.getResource({
          AccountId: accountId,
          TypeName: 'AWS::IAM::Role',
          Identifier: resourceNameParts[resourceNameParts.length - 1],
        });
        setRoleDetails(iamRoleDetails);
        setLoading(false);
      } else {
        setAnnotationError(IAM_ROLE_ARN_ANNOTATION);
        setLoading(false);
      }
    }
    return undefined;
  }, [entity, setRoleDetails, roleDetails]);

  const classes = useStyles();

  if (loading) {
    return <CircularProgress />;
  }

  if (annotationError) {
    return (
      <>
        <MissingAnnotationEmptyState annotation={annotationError} />
      </>
    );
  }

  return (
    <InfoCard
      title="AWS IAM Role Details"
      className={classes.infoCard}
      variant={props.variant}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <Box position="relative">
          <StructuredMetadataTable metadata={roleDetails} />
        </Box>
      )}
    </InfoCard>
  );
};
