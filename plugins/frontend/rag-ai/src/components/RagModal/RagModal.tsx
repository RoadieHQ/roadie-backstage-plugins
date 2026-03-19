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
import { useCallback, useState } from 'react';
import {
  Box,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { useHotkeys } from 'react-hotkeys-hook';
import CloseIcon from '@material-ui/icons/Close';
import { QuestionBox } from './QuestionBox';
import { ResultRenderer } from './ResultRenderer';
import { EmbeddingsView } from './EmbeddingsView';
import Dialog from '@material-ui/core/Dialog';
import { ragAiApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import { ResponseEmbedding } from '../../types';
import { Thinking } from './Thinking';
import { WarningPanel } from '@backstage/core-components';

export type RagModalProps = {
  title?: string;
  hotkey?: string;
};

type ControlledRagModalProps = RagModalProps & {
  open: boolean;
  setOpen: (value: boolean) => void;
};

type UncontrolledRagModalProps = RagModalProps;

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    gap: theme.spacing(1),
    display: 'grid',
    alignItems: 'center',
    gridTemplateColumns: '1fr auto',
    '&> button': {
      marginTop: theme.spacing(1),
    },
  },
  filter: {
    '& + &': {
      marginTop: theme.spacing(2.5),
    },
  },
  filters: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  input: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  dialogActionsContainer: { padding: theme.spacing(1, 3) },
  viewResultsLink: { verticalAlign: '0.5em' },
}));

export const ControlledRagModal = ({
  title = 'AI Assistant',
  hotkey = 'ctrl+comma',
  open,
  setOpen,
}: ControlledRagModalProps) => {
  const classes = useStyles();
  const [thinking, setThinking] = useState(false);
  const [questionResult, setQuestionResult] = useState('');
  const [embeddings, setEmbeddings] = useState<ResponseEmbedding[]>([]);
  const [warning, setWarning] = useState<string | undefined>();
  const ragApi = useApi(ragAiApiRef);
  const askLlm = useCallback(
    async (question: string, source: string) => {
      setThinking(true);
      setQuestionResult('');
      setWarning(undefined);
      setEmbeddings([]);

      for await (const chunk of ragApi.ask(question, source)) {
        switch (chunk.event) {
          case 'response': {
            setQuestionResult(value => value + chunk.data);
            break;
          }
          case 'embeddings': {
            setEmbeddings(JSON.parse(chunk.data));
            break;
          }
          case 'error': {
            setWarning(chunk.data);
            break;
          }
          case 'usage': {
            // Do nothing
            break;
          }
          default:
            throw new Error(`Unknown event type: ${chunk.event}`);
        }
      }

      setThinking(false);
    },
    [ragApi],
  );
  useHotkeys(hotkey, () => setOpen(true), []);
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        setThinking(false);
        setQuestionResult('');
        setEmbeddings([]);
      }}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box className={classes.dialogTitle}>
          <QuestionBox
            onSubmit={askLlm}
            fullWidth
            onClear={() => {
              setQuestionResult('');
              setEmbeddings([]);
            }}
          />
        </Box>
        {warning && <WarningPanel severity="warning" message={warning} />}
        {thinking && !questionResult && !warning ? (
          <Box p={6} display="flex" justifyContent="center" alignItems="center">
            <Thinking />
          </Box>
        ) : (
          <>
            <Box py={3}>
              <Grid container>
                {questionResult && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Response</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <ResultRenderer result={questionResult} />
                </Grid>
              </Grid>
            </Box>
            <Box py={3}>
              <Grid container>
                {embeddings && embeddings.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6">Additional Information</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <EmbeddingsView embeddings={embeddings} />
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const UncontrolledRagModal = (props: UncontrolledRagModalProps) => {
  const [open, setOpen] = useState(false);

  return <ControlledRagModal open={open} setOpen={setOpen} {...props} />;
};
