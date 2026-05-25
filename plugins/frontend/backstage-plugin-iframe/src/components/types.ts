import type { Entity } from '@backstage/catalog-model';

/**
 * Transforms the raw value of an entity annotation into the final iframe `src`.
 *
 * The entity is also passed so callers can combine multiple annotations or
 * incorporate other entity context (namespace, name, etc.) into the URL.
 *
 * @public
 */
export type IFrameSrcTransform = (
  annotationValue: string,
  entity: Entity,
) => string;

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
  templatedSrc?: string;
  title?: string;
  height?: string;
  width?: string;
  classes?: string;
  /**
   * Optional transform applied to the annotation value (when `srcFromAnnotation`
   * is set) to build the final iframe `src`. Ignored otherwise. See
   * {@link IFrameSrcTransform} and the `wrapAnnotation`, `intoTemplate`, and
   * `wrapAnnotationFromConfig` helpers exported from the package root.
   */
  transform?: IFrameSrcTransform;
};

export type IFrameFromAnnotationProps = {
  srcFromAnnotation: string;
  title?: string;
  height?: string;
  width?: string;
  classes?: string;
  /**
   * Optional transform applied to the annotation value (when `srcFromAnnotation`
   * is set) to build the final iframe `src`. Ignored otherwise. See
   * {@link IFrameSrcTransform} and the `wrapAnnotation`, `intoTemplate`, and
   * `wrapAnnotationFromConfig` helpers exported from the package root.
   */
  transform?: IFrameSrcTransform;
};

export type IframeFromTemplatedSrcProps = {
  templatedSrc: string;
  title?: string;
  height?: string;
  width?: string;
  classes?: string;
};

export type IFrameContentProps = {
  iframe: IFrameProps;
  title?: string;
};
