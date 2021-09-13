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
      startedAt: t.string,
      finishedAt: t.union([t.string, t.undefined]),
    }),
    history: t.union([t.array(t.type({
      id: t.union([t.number,t.undefined]),
      revision: t.union([t.string, t.undefined]),
      deployStartedAt: t.union([t.string, t.undefined]),
      deployedAt: t.union([t.string, t.undefined]),
    })), t.undefined]),
  }),
});

export type ArgoCDAppDetails = t.TypeOf<typeof argoCDAppDetails>;

export const argoCDAppList = t.type({
  items: t.union([t.array(argoCDAppDetails), t.null]),
});

export type ArgoCDAppList = t.TypeOf<typeof argoCDAppList>;
