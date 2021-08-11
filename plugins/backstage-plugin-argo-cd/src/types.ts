import * as t from 'io-ts';

export const argoCDAppDetails = t.type({
  metadata: t.type({ name: t.string }),
  status: t.type({
    sync: t.type({
      status: t.string,
    }),
    health: t.type({
      status: t.string,
    }),
    operationState: t.type({
      finishedAt: t.string,
    }),
    history: t.array(t.type({
      id: t.number,
      revision: t.string,
      deployStartedAt: t.union([t.string, t.undefined]),
      deployedAt: t.union([t.string, t.undefined]),
    })),
  }),
});

export type ArgoCDAppDetails = t.TypeOf<typeof argoCDAppDetails>;

export const argoCDAppList = t.type({
  items: t.union([t.array(argoCDAppDetails), t.null]),
});

export type ArgoCDAppList = t.TypeOf<typeof argoCDAppList>;
