import * as t from 'io-ts';

export const argoCDAppDeployRevisionDetails = t.type({
  author: t.union([t.string, t.undefined]),
  date: t.union([t.string, t.undefined]),
  message: t.union([t.string, t.undefined]),
});
export const argoCDAppDetails = t.type({
  metadata: t.type({
    name: t.string,
    instance: t.union([
      t.type({
        name: t.union([t.string, t.undefined]),
        url: t.union([t.string, t.undefined]),
      }),
      t.undefined,
    ]),
  }),
  status: t.type({
    sync: t.type({
      status: t.string,
    }),
    health: t.type({
      status: t.string,
    }),
    operationState: t.union([
      t.type({
        startedAt: t.string,
        finishedAt: t.union([t.string, t.undefined]),
      }),
      t.undefined,
    ]),
    history: t.union([
      t.array(
        t.type({
          id: t.union([t.number, t.undefined]),
          revision: t.union([
            t.type({
              revisionID: t.union([t.number, t.undefined]),
              author: t.union([t.number, t.undefined]),
              date: t.union([t.string, t.undefined]),
              message: t.union([t.string, t.undefined]),
            }),
            t.undefined,
            t.string,
          ]),
          deployStartedAt: t.union([t.string, t.undefined]),
          deployedAt: t.union([t.string, t.undefined]),
        }),
      ),
      t.undefined,
    ]),
  }),
});

export type ArgoCDAppDetails = t.TypeOf<typeof argoCDAppDetails>;
export type ArgoCDAppDeployRevisionDetails = t.TypeOf<
  typeof argoCDAppDeployRevisionDetails
>;

export const argoCDAppList = t.type({
  items: t.union([t.array(argoCDAppDetails), t.null]),
});

export type ArgoCDAppList = t.TypeOf<typeof argoCDAppList>;

export const argoCDService = t.type({
  name: t.string,
  url: t.string,
  appName: t.union([t.array(t.string), t.undefined]),
});

export const argoCDServiceList = t.array(argoCDService);

export type ArgoCDServiceList = t.TypeOf<typeof argoCDServiceList>;
