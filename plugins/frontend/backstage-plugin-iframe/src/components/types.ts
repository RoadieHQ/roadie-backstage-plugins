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
  classes?: string;
};

export type IFrameComponentContentProps = {
  classes?: string;
  src: string;
  title: string;
  height?: string;
  width?: string;
};

export type IFrameComponentProps = {
  src?: string;
  srcFromAnnotation?: string;
  srcWithAnnotationReplacements?: string;
  title?: string;
  height?: string;
  width?: string;
  classes?: string;
};

export type IFrameFromAnnotationProps = {
  srcFromAnnotation: string;
  title?: string;
  height?: string;
  width?: string;
  classes?: string;
};

export type IFrameFromAnnotationReplacementsProps = {
  srcFromAnnotationReplacements: string;
  title?: string;
  height?: string;
  width?: string;
  classes?: string;
};

export type IFrameContentProps = {
  iframe: IFrameProps;
  title?: string;
};
