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

import React, { useState } from 'react';
import {Progress, ErrorPanel, Table} from '@backstage/core-components';
import { RSSContentProps} from './types';
import {useAsync} from "react-use";
import {Box, Typography, Link, makeStyles} from "@material-ui/core";
import {DateTime} from "luxon"

const useStyles = makeStyles((theme) => ({
  newsItemDate: {
    marginBottom: theme.spacing(0.5),
    fontSize: "0.9rem",
    color: theme.palette.text.secondary
  },
  newsItemLink: {
    marginBottom: theme.spacing(3),
    fontSize: "1rem",
  },
}));

type DataItem = {
  title: any
}

const columns = [{
  title: "", field: "title",
}]

/**
 * A component to render a RSS feed
 *
 * @public
 */
export const Content = (props: RSSContentProps) => {
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState<DataItem[]>([]);
  const parser = new DOMParser();
  const [title, setTitle] = useState<string | undefined>();
  const classes = useStyles()

  useAsync(async () => {
    if (error) { return }
    if (data.length > 0) { return }
    const headers = new Headers({
      "Accept": "application/rss+xml"
    });

    try {
      const response = await fetch(props.feedURL, { headers: headers });
      if (response.status !== 200) {
        setError(new Error(`Failed to retrieve RSS Feed: ${response.status}`));
        return;
      }
      const body = await response.text();
      const feedData = parser.parseFromString(body, "application/xml");
      setTitle(feedData.querySelector('title')?.textContent || undefined);

      const items = feedData.querySelectorAll("item");
      items.forEach((item) => {
        const link = item.querySelector("link")?.textContent;
        const itemTitle = item.querySelector("title")?.textContent;
        const pubDate = item.querySelector("pubDate")?.textContent;
        let pubDateString: string | undefined = undefined;
        if (pubDate) {
          const publishedAt = DateTime.fromRFC2822(pubDate);
          pubDateString = publishedAt.toLocaleString(DateTime.DATE_MED);
        }


        if (link && itemTitle) {
          const itemComponent = (<>
            <Typography className={classes.newsItemDate}>{pubDateString}</Typography>
            <Link className={classes.newsItemLink} href={link} target="_blank">{itemTitle}</Link>
          </>);

          setData((current) => {
            return [...current, {
              title: itemComponent
            }]
          })
        }
      })
    } catch (e: any) {
      setError(new Error(`Failed to retrieve RSS Feed: ${e.message}`));
    };
  }, [data, setData])

  if (error) {
    return <ErrorPanel error={error}/>
  } else if (data) {
    return (<Box position="relative">
      <Table
          title={title}
          options={{ search: false, paging: true, showTitle: true, padding: 'dense', header: false }}
        data={data}
      columns={columns} />
    </Box>)
  }

  return <Progress/>
};
