/**
 * Props for Markdown content component {@link Content}.
 *
 * @public
 */
 export type MarkdownContentProps = {
  owner: string;
  repo: string;
  path: string;
  branch?: string;
};

export const BASE_URL = 'https://api.github.com';