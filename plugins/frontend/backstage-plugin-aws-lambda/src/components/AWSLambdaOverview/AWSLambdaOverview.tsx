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

import { ReactNode, Children } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardHeader,
  Divider,
  CardContent,
  makeStyles,
  Link,
  LinearProgress,
  Tooltip,
} from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';
import { DateTime } from 'luxon';
import { useLambda } from '../../hooks/useLambda';
import { LambdaData } from '../../types';
import {
  AWS_LAMBDA_ANNOTATION,
  AWS_LAMBDA_REGION_ANNOTATION,
  useServiceEntityAnnotations,
} from '../../hooks/useServiceEntityAnnotations';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import ErrorBoundary from '../ErrorBoundary';
import { useEntity } from '@backstage/plugin-catalog-react';

type States = 'Pending' | 'Active' | 'Inactive' | 'Failed';

const useStyles = makeStyles(theme => ({
  links: {
    margin: theme.spacing(2, 0),
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: 'min-content',
    gridGap: theme.spacing(3),
  },
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  value: {
    fontWeight: 'bold',
    overflow: 'hidden',
    lineHeight: '24px',
    wordBreak: 'break-word',
  },
  description: {
    wordBreak: 'break-word',
  },
}));

const getElapsedTime = (start: string) => {
  return DateTime.fromISO(start).toRelative();
};

const AboutField = ({
  label,
  value,
  gridSizes,
  children,
}: {
  label: string;
  value?: string | JSX.Element;
  gridSizes?: Record<string, number>;
  children?: ReactNode;
}) => {
  const classes = useStyles();

  // Content is either children or a string prop `value`
  const content = Children.count(children) ? (
    children
  ) : (
    <Typography variant="body2" className={classes.value}>
      {value || `unknown`}
    </Typography>
  );
  return (
    <Grid item {...gridSizes}>
      <Typography variant="subtitle2" className={classes.label}>
        {label}
      </Typography>
      {content}
    </Grid>
  );
};

const State = ({ value }: { value: States }) => {
  const colorMap = {
    Pending: '#dcbc21',
    Active: 'green',
    Inactive: 'black',
    Failed: 'red',
  };
  return (
    <Box display="flex" alignItems="center">
      <span
        style={{
          display: 'block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: colorMap[value],
          marginRight: '5px',
        }}
      />
      {value}
    </Box>
  );
};
const OverviewComponent = ({ lambda }: { lambda: LambdaData }) => {
  const href = `https://console.aws.amazon.com/lambda/home?region=${lambda.region}#/functions/${lambda.functionName}`;
  const logsHref = `https://${lambda.region}.console.aws.amazon.com/cloudwatch/home?region=${lambda.region}#logStream:group=%252Faws%252Flambda%252F${lambda.functionName}`;

  const classes = useStyles();
  return (
    <Card>
      <CardHeader
        title={<Typography variant="h5">AWS Lambda</Typography>}
        subheader={
          <Typography variant="h6">
            <Link target="_blank" href={href}>
              {lambda.functionName}
            </Link>
          </Typography>
        }
      />
      <Divider />
      <CardContent>
        <Grid container>
          <AboutField label="Description" gridSizes={{ xs: 12 }}>
            <Typography
              variant="body2"
              paragraph
              className={classes.description}
            >
              {lambda.description || 'No description'}
            </Typography>
          </AboutField>
          <AboutField
            label="State" // Pending | Active | Inactive | Failed
            gridSizes={{ xs: 12, sm: 6, lg: 4 }}
          >
            <State value={lambda.state as States} />
          </AboutField>
          <AboutField
            label="Last modified"
            value={getElapsedTime(lambda.lastModifiedDate!) ?? undefined}
            gridSizes={{ xs: 12, sm: 6, lg: 4 }}
          />

          <AboutField
            label="Last update status"
            // Successful | Failed | InProgress
            gridSizes={{ xs: 12, sm: 6, lg: 4 }}
          >
            <Tooltip
              disableHoverListener={!lambda.lastUpdateStatusReason}
              title={lambda.lastUpdateStatusReason || ''}
            >
              <span>{lambda.lastUpdateStatus as string}</span>
            </Tooltip>
          </AboutField>
          <AboutField
            label="Logs"
            children={
              <Link href={logsHref} target="_blank">
                view logs
              </Link>
            }
            gridSizes={{ xs: 12, sm: 6, lg: 4 }}
          />
        </Grid>
      </CardContent>
    </Card>
  );
};

export const isRegionInAnnotations = (entity: Entity) =>
  entity?.metadata.annotations?.[AWS_LAMBDA_REGION_ANNOTATION];
export const isAWSLambdaAvailable = (entity: Entity) =>
  entity?.metadata.annotations?.[AWS_LAMBDA_ANNOTATION];

const AWSLambdaOverview = ({
  entity,
  roleArn,
}: {
  entity: Entity;
  roleArn: string | undefined;
}) => {
  const { lambdaName, lambdaRegion } = useServiceEntityAnnotations(entity);

  const [lambdaData] = useLambda({
    lambdaName,
    region: lambdaRegion,
    roleArn: roleArn,
  });
  if (lambdaData.loading) {
    return (
      <Card>
        <CardHeader title={<Typography variant="h5">AWS Lambda</Typography>} />
        <LinearProgress />
      </Card>
    );
  }
  return (
    <>{lambdaData.lambda && <OverviewComponent lambda={lambdaData.lambda} />}</>
  );
};

type LambdaContentProps = {
  roleArn?: string;
};

export const AWSLambdaOverviewWidget = ({ roleArn }: LambdaContentProps) => {
  const { entity } = useEntity();
  return !isRegionInAnnotations(entity) ? (
    <MissingAnnotationEmptyState annotation={AWS_LAMBDA_REGION_ANNOTATION} />
  ) : (
    <ErrorBoundary>
      <AWSLambdaOverview entity={entity} roleArn={roleArn} />
    </ErrorBoundary>
  );
};
