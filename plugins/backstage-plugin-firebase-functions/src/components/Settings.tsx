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
import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
  Snackbar,
  Button,
  makeStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Alert } from '@material-ui/lab';
import { useSettings } from '../hooks/useSettings';

const useStyles = makeStyles(theme => ({
  tabPanelRoot: {
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const Settings: React.FC = () => {
  const classes = useStyles();
  const [settings, saveSettings] = useSettings();
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Snackbar
        autoHideDuration={1000}
        open={saved}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSaved(false)}
      >
        <Alert severity="success">Settings saved in local storage.</Alert>
      </Snackbar>
      <Accordion style={{ maxWidth: '400px' }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className={classes.tabPanelRoot}>
            <Box mt={6}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setSaved(true);
                  saveSettings({
                    ...settings,
                  });
                }}
              >
                Save settings
              </Button>
            </Box>
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default Settings;
