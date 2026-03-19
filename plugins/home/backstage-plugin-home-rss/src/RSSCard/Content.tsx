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

import { ErrorPanel, Link, Table } from '@backstage/core-components';
import { DataItem, RSSContentProps } from './types';
import { useAsync } from 'react-use';
import { Typography, makeStyles } from '@material-ui/core';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
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
const skeletonData = Array(6).fill(skeletonDataItem);

/**
 * A component to render an RSS feed
 *
 * @public
 */
export const Content = (props: RSSContentProps) => {
  const { fetch } = useApi(fetchApiRef);
  const parser = new DOMParser();
  const classes = useStyles();
  const { feedURL, paging = true, rowRenderer } = props;

  const defaultRow = (items: NodeListOf<Element>): DataItem[] => {
    const result: DataItem[] = [];
    items.forEach(item => {
      const link = item.querySelector('link')?.textContent;
      const itemTitle = item.querySelector('title')?.textContent;
      const pubDate = item.querySelector('pubDate')?.textContent;
      const pubDateString = pubDate
        ? DateTime.fromRFC2822(pubDate).toLocaleString(DateTime.DATE_MED)
        : undefined;

      if (link && itemTitle) {
        const itemComponent = (
          <>
            <Typography className={classes.newsItemDate}>
              {pubDateString}
            </Typography>
            <Link className={classes.newsItemLink} to={link} target="_blank">
              {itemTitle}
            </Link>
          </>
        );

        result.push({
          title: itemComponent,
        });
      }
    });
    return result;
  };

  const { value = skeletonData, error } = useAsync(async () => {
    const headers = new Headers({
      Accept: 'application/rss+xml',
    });

    const response = await fetch(feedURL, { headers: headers });

    const body = await response.text();
    const feedData = parser.parseFromString(body, 'application/xml');
    const items = feedData.querySelectorAll('item');

    return rowRenderer ? await rowRenderer(items) : defaultRow(items);
  }, []);

  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <Table
      options={{
        search: false,
        paging: paging,
        toolbar: false,
        padding: 'dense',
        header: false,
      }}
      data={value}
      columns={columns}
    />
  );
};
