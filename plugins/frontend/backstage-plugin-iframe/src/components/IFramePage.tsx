import React from 'react';
import {
  Page,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import { IFramePageProps } from './types';
import { IFrameCard } from './IFrameComponent';

export const IFramePage = (props: IFramePageProps) => {
  const { frames } = props;
  return (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="Custom page for adding IFrame component(s)">
          <SupportButton>Custom page for adding IFrame component(s)</SupportButton>
        </ContentHeader>
          {frames.length > 0 ? (
             <Grid>  
              {frames.map((f, i) => {
                return (
                  <Grid item key={i}>
                    <IFrameCard {...f} />
                  </Grid>
                )
              })
              }
              </Grid>
          ):(
            <Typography>
              You must pass in props to render the page correctly
            </Typography>
          )}
      </Content>
    </Page>
  )
};
