/*
 * Copyright 2024 Larder Software Limited
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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  List,
  ListItem,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import uniq from 'lodash/uniq';
import { ResponseEmbedding } from '../../types';
import { useEffect, useState } from 'react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DescriptionIcon from '@material-ui/icons/Description';
import { Link } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { parseEntityRef } from '@backstage/catalog-model';

const useStyles = makeStyles((theme: Theme) => ({
  embeddingsContent: {
    flexGrow: 1,
    overflowX: 'auto',
  },
  embeddingsPre: {
    'word-wrap': 'anywhere',
    'white-space': 'normal',
  },
  listItem: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  listItemIcon: {
    marginRight: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    lineHeight: 0,
  },
}));

export const EmbeddingsView = ({
  embeddings,
}: {
  embeddings: ResponseEmbedding[];
}) => {
  const classes = useStyles();

  const [techDocsBaseUrl, setTechDocsBaseUrl] = useState<string>();

  const config = useApi(configApiRef);

  useEffect(() => {
    async function loadTechDocsBaseUrl() {
      const baseUrl = await config.getString('app.baseUrl');
      const techDocsPath =
        (await config.getOptionalString('ai.techDocsPath')) ?? '/docs';
      setTechDocsBaseUrl(baseUrl + techDocsPath);
    }

    loadTechDocsBaseUrl();
  }, [config]);

  if (!embeddings || embeddings.length < 1) {
    return null;
  }

  const entities = uniq(
    embeddings
      .filter(it => it.metadata && it.metadata.entityRef)
      .map(embedding => embedding.metadata.entityRef)
      .filter(Boolean),
  );

  const techDocs = uniq(
    embeddings
      .filter(
        it =>
          it.metadata &&
          it.metadata.title &&
          it.metadata.location &&
          it.metadata.entityRef,
      )
      .map(embedding => ({
        title: embedding.metadata.title,
        location: embedding.metadata.location,
        entity: parseEntityRef(embedding.metadata.entityRef),
      })),
  );

  return (
    <Box>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Related Entities</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="row">
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                We found the following Entities based on your question. The LLM
                used these entities as an additional context to attempt to
                answer your question.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <List>
                {entities.map(entityRef => (
                  <ListItem key={entityRef}>
                    <EntityRefLink
                      entityRef={entityRef}
                      defaultKind="Component"
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Related TechDocs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="row">
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                We found the following TechDocs based on your question. The LLM
                used these TechDocs as an additional context to attempt to
                answer your question.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <List>
                {techDocs.map(doc => {
                  const url = `${techDocsBaseUrl}/${doc.entity.namespace}/${doc.entity.kind}/${doc.entity.name}/${doc.location}`;

                  return (
                    <ListItem key={doc.location}>
                      <Link to={url}>
                        <Box component="span" className={classes.listItem}>
                          <Box
                            component="span"
                            className={classes.listItemIcon}
                          >
                            <DescriptionIcon fontSize="inherit" />
                          </Box>
                          {doc.title}
                        </Box>
                      </Link>
                    </ListItem>
                  );
                })}
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Embedded Snippets</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="row">
            <Grid item xs={12}>
              <Typography variant="subtitle2">
                These are the snippets sent to the LLM.
              </Typography>
            </Grid>
            {embeddings.map(embedding => (
              <Grid item xs={12}>
                <div
                  className={classes.embeddingsContent}
                  style={{ fontSize: '75%' }}
                  data-testid="embedding-snippet"
                >
                  <pre className={classes.embeddingsPre}>
                    {embedding.content}
                  </pre>
                </div>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
