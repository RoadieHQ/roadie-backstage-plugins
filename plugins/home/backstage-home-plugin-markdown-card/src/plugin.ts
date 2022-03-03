import { homePlugin, createCardExtension } from '@backstage/plugin-home';

/**
 * A component to render a predefined markdown file from github.
 *
 * @public
 */
export const HomePageMarkdown = homePlugin.provide(
  createCardExtension({
    name: 'HomePageMarkdown',
    title: 'Markdown',
    components: () => import('./MarkdownCard'),
  }),
);
