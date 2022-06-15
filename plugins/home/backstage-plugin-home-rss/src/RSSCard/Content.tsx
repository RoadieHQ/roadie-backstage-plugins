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

import React from 'react';
import { ErrorPanel, Table } from '@backstage/core-components';
import { RSSContentProps } from './types';
import { useAsync } from 'react-use';
import { Box, Typography, Link, makeStyles } from '@material-ui/core';
import { DateTime } from 'luxon';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles(theme => ({
  newsItemDate: {
    marginBottom: theme.spacing(0.5),
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
  },
  newsItemLink: {
    marginBottom: theme.spacing(3),
    fontSize: '1rem',
  },
}));

type DataItem = {
  title: any;
};

const columns = [
  {
    title: '',
    field: 'title',
  },
];
const skeletonDataItem = {
  title: (
    <>
      <Skeleton variant="text" width={100} />
      <Typography variant="body1">
        <Skeleton variant="text" />
      </Typography>
    </>
  ),
};
const skeletonData = [
  skeletonDataItem,
  skeletonDataItem,
  skeletonDataItem,
  skeletonDataItem,
  skeletonDataItem,
];

/**
 * A component to render a RSS feed
 *
 * @public
 */
export const Content = (props: RSSContentProps) => {
  const parser = new DOMParser();
  const classes = useStyles();

  const { value, loading, error } = useAsync(async () => {
    const headers = new Headers({
      Accept: 'application/rss+xml',
    });

    const response = await fetch(props.feedURL, { headers: headers });

    const body = await response.text();
    const feedData = parser.parseFromString(body, 'application/xml');
    const title = feedData.querySelector('title')?.textContent || undefined;

    const items = feedData.querySelectorAll('item');
    const result: DataItem[] = [];
    items.forEach(item => {
      const link = item.querySelector('link')?.textContent;
      const itemTitle = item.querySelector('title')?.textContent;
      const pubDate = item.querySelector('pubDate')?.textContent;
      let pubDateString: string | undefined = undefined;
      if (pubDate) {
        const publishedAt = DateTime.fromRFC2822(pubDate);
        pubDateString = publishedAt.toLocaleString(DateTime.DATE_MED);
      }

      if (link && itemTitle) {
        const itemComponent = (
          <>
            <Typography className={classes.newsItemDate}>
              {pubDateString}
            </Typography>
            <Link className={classes.newsItemLink} href={link} target="_blank">
              {itemTitle}
            </Link>
          </>
        );

        result.push({
          title: itemComponent,
        });
      }
    });
    return { data: result, title };
  }, []);
  if (error) {
    return <ErrorPanel error={error} />;
  }
  let tableData: DataItem[] = [];
  let title;
  if (loading) {
    tableData = skeletonData;
    title = <Skeleton variant="text" width={200} />;
  } else if (value) {
    tableData = value.data;
    title = value.title;
  }
  return (
    <Box position="relative">
      <Table
        title={title}
        options={{
          search: false,
          paging: true,
          showTitle: true,
          padding: 'dense',
          header: false,
        }}
        data={tableData}
        columns={columns}
      />
    </Box>
  );
};
