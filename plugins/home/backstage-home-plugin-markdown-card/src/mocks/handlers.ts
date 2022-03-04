import { rest } from 'msw';
import { mockFileResponse, mockResponseFromBranch } from './mock';
export const handlers = [
  rest.get(
    'https://api.github.com/repos/test/roadie-backstage-plugins/contents/.backstage/home-page.md',
    (req, res, ctx) => {
      if (req.headers.get('if-none-match') === 'random-generated-etag') {
        return res(ctx.status(304), ctx.json({}));
      }

      return res(
        ctx.set('etag', 'random-generated-etag'),
        ctx.json(mockFileResponse),
      );
    },
  ),
  rest.get(
    'https://api.github.com/repos/test/foo-bar/contents/.backstage/home-page.md',
    (req, res, ctx) => {
      if (req.headers.get('if-none-match') === 'different-content-etag') {
        return res(ctx.status(304), ctx.json({}));
      }
      if (req.url.searchParams.get('ref') === 'not-default') {
        return res(
          ctx.set('etag', 'different-content-etag'),
          ctx.json(mockResponseFromBranch),
        );
      }
      return res(ctx.set('etag', 'empty-content-etag'), ctx.json({}));
    },
  ),
];
