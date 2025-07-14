import { FC, useState, useCallback } from 'react';
import { Snackbar } from '@material-ui/core';
import { Builds as BuildsComp } from './lib/Builds';
import { Alert } from '@material-ui/lab';
import { ContentHeader, SupportButton } from '@backstage/core-components';

export const Builds: FC = () => {
  const [restarted, setRestarted] = useState(false);
  const handleRestart = useCallback(() => {
    setRestarted(true);
  }, [setRestarted]);

  return (
    <>
      <Snackbar
        autoHideDuration={1000}
        open={restarted}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setRestarted(false)}
      >
        <Alert severity="success">Build Restarted.</Alert>
      </Snackbar>
      <ContentHeader title="All builds">
        <SupportButton>
          This plugin allows you to view and interact with your builds within
          the Travis CI environment.
        </SupportButton>
      </ContentHeader>
      <BuildsComp onRestart={handleRestart} />
    </>
  );
};
