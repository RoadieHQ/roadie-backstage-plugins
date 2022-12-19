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
};

export type IFrameComponentContentProps = {
  class?: string;
  src: string;
  title: string;
  height?: string;
  width?: string;
};

export type IFrameComponentProps = {
  src?: string;
  srcFromAnnotation?: string;
  title?: string;
  height?: string;
  width?: string;
  class?: string;
};

export type IFrameFromAnnotationProps = {
  srcFromAnnotation: string;
  title?: string;
  height?: string;
  width?: string;
  class?: string;
};

export type IFrameContentProps = {
  iframe: IFrameProps;
  title?: string;
};
