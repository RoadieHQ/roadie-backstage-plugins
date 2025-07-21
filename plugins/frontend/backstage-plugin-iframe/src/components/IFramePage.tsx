import {
  Content,
  ContentHeader,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { determineError } from './utils/helpers';
import { ErrorComponent } from './ErrorComponent';
import { IFrameContentProps } from './types';

const IFramePage = (props: IFrameContentProps) => {
  const { title, iframe } = props;
  const configApi = useApi(configApiRef);
  const allowList = configApi.getOptionalStringArray('iframe.allowList');
  const errorMessage = determineError(iframe?.src || '', allowList);

  if (errorMessage !== '') {
    return <ErrorComponent {...{ errorMessage }} />;
  }

  return (
    <Page themeId="tool">
      <Content>
        <ContentHeader
          title={
            title ||
            'Custom content for adding IFrame component(s). You can modify this field with the props.'
          }
        >
          <SupportButton>
            {title || 'Custom content for adding IFrame component(s)'}
          </SupportButton>
        </ContentHeader>
        <iframe
          src={iframe.src}
          height={iframe.height || '100%'}
          width={iframe.width || '100%'}
          title={iframe.title}
        />
      </Content>
    </Page>
  );
};

export { IFramePage };
