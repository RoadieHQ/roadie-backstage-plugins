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
  Typography,
} from '@material-ui/core';
import uniq from 'lodash/uniq';
import { ResponseEmbedding } from '../../types';
import React from 'react';
import { EntityRefLink } from '@backstage/plugin-catalog-react';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(() => ({
  embeddingsContent: {
    flexGrow: 1,
    overflowX: 'auto',
  },
  embeddingsPre: {
    'word-wrap': 'anywhere',
    'white-space': 'normal',
  },
}));

export const EmbeddingsView = ({
  embeddings,
}: {
  embeddings: ResponseEmbedding[];
}) => {
  const classes = useStyles();
  if (!embeddings || embeddings.length < 1) {
    return null;
  }

  const entities = uniq(
    embeddings
      .filter(it => it.metadata && it.metadata.entityRef)
      .map(embedding => embedding.metadata.entityRef)
      .filter(Boolean),
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
