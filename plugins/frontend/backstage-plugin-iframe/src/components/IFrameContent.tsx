import {
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';
import { IFrameContentProps } from './types';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ErrorComponent } from './ErrorComponent';
import { determineError } from './utils/helpers';

export const IFrameContent = (props: IFrameContentProps) => {
  const { title, iframe } = props;
  const configApi = useApi(configApiRef);
  const allowList = configApi.getOptionalStringArray('iframe.allowList');
  const errorMessage = determineError(iframe?.src || '', allowList);

  if (errorMessage !== '') {
    return <ErrorComponent {...{ errorMessage }} />;
  }

  return (
    <Content>
      <ContentHeader
        title={title || 'Custom content for adding IFrame component(s)'}
      >
        <SupportButton>
          {title || 'Custom content for adding IFrame component(s)'}
        </SupportButton>
      </ContentHeader>
      <h1>{iframe.title || 'You can modify this field with the props.'}</h1>
      <iframe
        src={iframe.src}
        height={iframe.height || '100%'}
        width={iframe.width || '100%'}
        title={iframe.title}
      />
    </Content>
  );
};
