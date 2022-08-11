export const determineError = (
  src: string,
  allowList: string[] | undefined,
) => {
  if (src === '') {
    return 'No src field provided. Please pass it in as a prop to populate the iframe.';
  } else if (!src.startsWith('https://')) {
    return `Src '${src}' for Iframe must be a https protocol but is not.`;
  } else if (src && allowList && !allowList.includes(new URL(src).hostname)) {
    return `Src ${src} for Iframe is not included in the allowlist ${allowList.join(
      ',',
    )}.`;
  }
  return '';
};
