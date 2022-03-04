import { homePlugin, createCardExtension } from '@backstage/plugin-home';

/**
 * A component to render a predefined markdown file from github.
 *
 * @public
 */
export const HomePageMarkdown = homePlugin.provide(
  createCardExtension<{
    owner: string;
    repo: string;
    path: string;
    branch?: string;
  }>({
    name: 'HomePageMarkdown',
    title: 'Markdown',
    components: () => import('./MarkdownCard'),
  }),
);
