
/**
 * Props for IFrame content component {@link Content}.
 *
 * @public
 */
export type IFrameProps = {
  src: string;
  title?: string;
  height?: string;
  width?: string;
  class?: string;
}

export type IFrameContentProps = {
  iframe: IFrameProps;
  title?: string;
}