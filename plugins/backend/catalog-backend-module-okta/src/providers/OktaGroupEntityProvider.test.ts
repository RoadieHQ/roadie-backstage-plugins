/*
 * Copyright 2022 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { OktaGroupEntityProvider } from './OktaGroupEntityProvider';
import { ConfigReader } from '@backstage/config';
import {
  CatalogService,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  AuthService,
  BackstageCredentials,
} from '@backstage/backend-plugin-api';
import { MockOktaCollection, createSilentLogger } from '../__testUtils__';
import { ProfileFieldGroupNamingStrategy } from './groupNamingStrategies';

let listGroups: () => MockOktaCollection = () => {
  return new MockOktaCollection([]);
};

const defaultListGroupUsers = ({ groupId }: { groupId: string }) => {
  const group = listGroups().items.find((g: any) => g.id === groupId);
  return group?.listUsers?.() ?? new MockOktaCollection([]);
};

let listGroupUsers = defaultListGroupUsers;

jest.mock('@okta/okta-sdk-nodejs', () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        groupApi: {
          listGroups,
          listGroupUsers,
        },
      };
    }),
    GroupProfile: {},
  };
});

const logger = createSilentLogger();

describe('OktaGroupProvider', () => {
  const config = new ConfigReader({
    orgUrl: 'https://okta',
    token: 'secret',
  });

  describe('where there is no groups', () => {
    beforeEach(() => {
      listGroups = () => new MockOktaCollection([]);
    });

    it('creates no okta groups', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });
  });

  describe('where it has allowed profile fields to pass to annotations', () => {
    beforeEach(() => {
      listGroups = () => {
        return new MockOktaCollection([
          {
            id: '123Test',
            profile: {
              name: 'Everyone@the-company',
              description: 'Everyone in the company',
              org_id: '1234',
              parent_org_id: '1234',
              customAttribute1: 'whatever',
              customAttribute2: 'whenever',
            },
            listUsers: () => {
              return new MockOktaCollection([
                {
                  id: '123Test',
                  profile: {
                    email: 'fname@domain.com',
                  },
                },
              ]);
            },
          },
        ]);
      };
    });

    it('passes the whitelisted fields to annotations', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        customAttributesToAnnotationAllowlist: [
          'customAttribute1',
          'customAttribute2',
        ],
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: '123Test',
                description: 'Everyone in the company',
                annotations: expect.objectContaining({
                  customAttribute1: 'whatever',
                  customAttribute2: 'whenever',
                }),
              }),
              spec: expect.objectContaining({
                members: ['123Test'],
              }),
            }),
          }),
        ]),
      });
    });
  });

  describe('where there is a group', () => {
    beforeEach(() => {
      listGroups = () => {
        return new MockOktaCollection([
          {
            id: 'asdfwefwefwef',
            profile: {
              name: 'Everyone@the-company',
              description: 'Everyone in the company',
              org_id: '1234',
              parent_org_id: '1234',
              displayName: 'Display name 1',
            },
            listUsers: () => {
              return new MockOktaCollection([
                {
                  id: 'asdfwefwefwef',
                  profile: {
                    email: 'fname@domain.com',
                  },
                },
              ]);
            },
          },
          {
            id: 'group-with-null-description',
            profile: {
              name: 'Everyone@the-company',
              description: null,
              org_id: '1235',
              parent_org_id: '1234',
              displayName: 'Display name 2',
            },
            listUsers: () => {
              return new MockOktaCollection([
                {
                  id: 'asdfwefwefwef',
                  profile: {
                    email: 'fname@domain.com',
                  },
                },
              ]);
            },
          },
        ]);
      };
    });

    it('creates okta groups', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, { logger });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'asdfwefwefwef',
                description: 'Everyone in the company',
              }),
              spec: expect.objectContaining({
                members: ['asdfwefwefwef'],
              }),
            }),
          }),
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'asdfwefwefwef',
                description: expect.stringContaining(''),
              }),
              spec: expect.objectContaining({
                members: ['asdfwefwefwef'],
              }),
            }),
          }),
        ]),
      });
    });

    it('allows kebab casing of the group name and user name for the name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: 'kebab-case-name',
        userNamingStrategy: 'strip-domain-email',
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'everyone-the-company',
              }),
              spec: expect.objectContaining({
                members: ['fname'],
              }),
            }),
          }),
        ]),
      });
    });

    it('allows using the profile name of the group name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: 'profile-name',
        userNamingStrategy: 'strip-domain-email',
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'Everyone@the-company',
              }),
              spec: expect.objectContaining({
                members: ['fname'],
              }),
            }),
          }),
        ]),
      });
    });

    it('allows selecting a custom field for the name', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: new ProfileFieldGroupNamingStrategy('org_id')
          .nameForGroup,
        userNamingStrategy: 'strip-domain-email',
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: '1234',
              }),
              spec: expect.objectContaining({
                members: ['fname'],
              }),
            }),
          }),
        ]),
      });
    });

    it('allows creating a hierarchy for groups', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: new ProfileFieldGroupNamingStrategy('org_id')
          .nameForGroup,
        hierarchyConfig: {
          parentKey: 'profile.parent_org_id',
          key: 'profile.org_id',
        },
        userNamingStrategy: 'strip-domain-email',
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: '1234',
              }),
              spec: expect.objectContaining({
                members: ['fname'],
                parent: '1234',
              }),
            }),
          }),
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: '1235',
              }),
              spec: expect.objectContaining({
                members: ['fname'],
                parent: '1234',
              }),
            }),
          }),
        ]),
      });
    });

    it('allows creating a hierarchy for groups without a naming strategy', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        hierarchyConfig: {
          parentKey: 'profile.parent_org_id',
          key: 'profile.org_id',
        },
        userNamingStrategy: 'strip-domain-email',
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'asdfwefwefwef',
              }),
              spec: expect.objectContaining({
                members: ['fname'],
                parent: 'asdfwefwefwef',
              }),
            }),
          }),
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'group-with-null-description',
              }),
              spec: expect.objectContaining({
                members: ['fname'],
                parent: 'asdfwefwefwef',
              }),
            }),
          }),
        ]),
      });
    });

    it('where a failing naming strategy is provided it passes over the group', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: () => {
          throw new Error('bork');
        },
        userNamingStrategy: 'strip-domain-email',
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: [],
      });
    });

    it('where a failing user naming strategy is provided it passes over the user', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        namingStrategy: new ProfileFieldGroupNamingStrategy('org_id')
          .nameForGroup,
        userNamingStrategy: () => {
          throw new Error('bork');
        },
      });
      await provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: '1234',
              }),
              spec: expect.objectContaining({
                members: [],
              }),
            }),
          }),
        ]),
      });
    });

    it('uses custom group transformer', async () => {
      const entityProviderConnection: EntityProviderConnection = {
        applyMutation: jest.fn(),
        refresh: jest.fn(),
      };
      const provider = OktaGroupEntityProvider.fromConfig(config, {
        logger,
        groupTransformer: (group, namingStrategy, options, parentGroup) => ({
          kind: 'Group',
          apiVersion: 'backstage.io/v1alpha1',
          metadata: {
            annotations: { ...options.annotations },
            name: namingStrategy(group),
            title: group?.profile?.name || 'fallBack',
            description: group?.profile?.description || '',
          },
          spec: {
            profile: {
              displayName:
                ((group?.profile as { displayName?: string } | undefined)
                  ?.displayName as string) || 'fallBack',
            },
            members: options.members,
            type: 'group',
            children: [],
            parent: parentGroup ? namingStrategy(parentGroup) : '',
          },
        }),
      });
      provider.connect(entityProviderConnection);
      await provider.run();
      expect(entityProviderConnection.applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'asdfwefwefwef',
                description: 'Everyone in the company',
              }),
              spec: expect.objectContaining({
                members: ['asdfwefwefwef'],
                profile: expect.objectContaining({
                  displayName: 'Display name 1',
                }),
              }),
            }),
          }),
        ]),
      });
    });
  });

  describe('skipping unchanged groups', () => {
    const LAST_MEMBERSHIP_UPDATED = 'okta.roadie.io/last-membership-updated';
    const TS = '2026-10-01T00:00:00.000Z';
    const TS2 = '2026-10-02T00:00:00.000Z';
    // previous state is read from this provider's own Group entities
    const PROVIDER_FILTER = {
      kind: 'Group',
      'metadata.annotations.backstage.io/managed-by-location':
        'okta-group-https://okta',
    };

    type MockGroup = {
      id: string;
      profile: { name: string; description: string };
      lastMembershipUpdated: unknown; // tests also feed missing and malformed SDK values
      listUsers: () => MockOktaCollection;
    };

    type EmittedEntity = {
      entity: {
        kind: string;
        metadata: { name: string; annotations?: Record<string, string> };
        spec: { members?: string[] };
      };
    };

    const credentials = {
      $$type: '@backstage/BackstageCredentials',
      principal: { type: 'service', subject: 'plugin:catalog' },
    } as unknown as BackstageCredentials;
    // only the members the provider uses are mocked
    const auth = {
      getOwnServiceCredentials: jest.fn(async () => credentials),
    } as unknown as AuthService;

    let groups: MockGroup[];
    let listGroupUsersCount: Record<string, number>;
    let streamEntities: jest.Mock;
    let catalogClient: CatalogService;

    const createProvider = (
      skipUnchangedGroups?: boolean,
      membershipTimestampAnnotation?: string,
    ) =>
      OktaGroupEntityProvider.fromConfig(config, {
        logger,
        skipUnchangedGroups,
        catalogClient,
        auth,
        membershipTimestampAnnotation,
      });

    const connect = async (provider: OktaGroupEntityProvider) => {
      const applyMutation = jest.fn();
      const connection: EntityProviderConnection = {
        applyMutation,
        refresh: jest.fn(),
      };
      await provider.connect(connection);
      return applyMutation;
    };

    const emitted = (applyMutation: jest.Mock): EmittedEntity[] => {
      const calls = applyMutation.mock.calls as Array<
        [{ entities: EmittedEntity[] }]
      >;
      return calls[calls.length - 1]?.[0]?.entities ?? [];
    };

    const groupAnnotations = (applyMutation: jest.Mock) =>
      emitted(applyMutation)
        .filter(e => e.entity.kind === 'Group')
        .map(e => e.entity.metadata.annotations ?? {});

    // the catalog streams these entities back as a single page
    const catalogReturns = (items: Array<EmittedEntity['entity']>) => {
      streamEntities.mockImplementation(async function* page() {
        yield items;
      });
    };

    // feed the last emitted entities back as the catalog's current state
    const catalogReturnsLastRun = (applyMutation: jest.Mock) =>
      catalogReturns(emitted(applyMutation).map(e => e.entity));

    beforeEach(() => {
      groups = [
        {
          id: 'group-1',
          profile: {
            name: 'Everyone@the-company',
            description: 'Everyone in the company',
          },
          lastMembershipUpdated: new Date(TS),
          listUsers: () => {
            return new MockOktaCollection([
              {
                id: 'user-1',
                profile: {
                  email: 'fname@domain.com',
                },
              },
              {
                id: 'user-2',
                profile: {
                  email: 'fname2@domain.com',
                },
              },
            ]);
          },
        },
        {
          id: 'group-2',
          profile: {
            name: 'Some@the-company',
            description: 'Some in the company',
          },
          lastMembershipUpdated: new Date(TS),
          listUsers: () => {
            return new MockOktaCollection([
              {
                id: 'user-1',
                profile: {
                  email: 'fname@domain.com',
                },
              },
            ]);
          },
        },
      ];
      listGroups = () => new MockOktaCollection(groups);
      listGroupUsersCount = {};
      listGroupUsers = ({ groupId }: { groupId: string }) => {
        listGroupUsersCount[groupId] = (listGroupUsersCount[groupId] ?? 0) + 1;
        const group = groups.find(g => g.id === groupId);
        return group?.listUsers?.() ?? new MockOktaCollection([]);
      };
      streamEntities = jest.fn();
      catalogReturns([]);
      // only the members the provider uses are mocked
      catalogClient = { streamEntities } as unknown as CatalogService;
    });

    afterEach(() => {
      listGroupUsers = defaultListGroupUsers;
    });

    it('annotates group entities with the membership timestamp on the first enabled run', async () => {
      const provider = createProvider(true);
      const applyMutation = await connect(provider);
      await provider.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 1, 'group-2': 1 });
      expect(applyMutation).toHaveBeenCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'group-1',
                annotations: expect.objectContaining({
                  [LAST_MEMBERSHIP_UPDATED]: TS,
                }),
              }),
              spec: expect.objectContaining({
                members: ['user-1', 'user-2'],
              }),
            }),
          }),
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'group-2',
                annotations: expect.objectContaining({
                  [LAST_MEMBERSHIP_UPDATED]: TS,
                }),
              }),
              spec: expect.objectContaining({
                members: ['user-1'],
              }),
            }),
          }),
        ]),
      });
    });

    it('does not call listGroupUsers again when the membership timestamp is unchanged', async () => {
      const provider = createProvider(true);
      const applyMutation = await connect(provider);
      await provider.run();
      catalogReturnsLastRun(applyMutation);
      await provider.run();

      expect(streamEntities).toHaveBeenLastCalledWith(
        {
          filter: PROVIDER_FILTER,
          // spec.members is what reused groups emit; the mock ignores fields
          fields: ['metadata.name', 'metadata.annotations', 'spec.members'],
        },
        { credentials },
      );
      expect(listGroupUsersCount).toEqual({ 'group-1': 1, 'group-2': 1 });
      // reused groups keep their timestamp so the run after can skip again
      expect(groupAnnotations(applyMutation)).toEqual([
        expect.objectContaining({ [LAST_MEMBERSHIP_UPDATED]: TS }),
        expect.objectContaining({ [LAST_MEMBERSHIP_UPDATED]: TS }),
      ]);
      expect(applyMutation).toHaveBeenLastCalledWith({
        type: 'full',
        entities: expect.arrayContaining([
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'group-1',
              }),
              spec: expect.objectContaining({
                members: ['user-1', 'user-2'],
              }),
            }),
          }),
          expect.objectContaining({
            entity: expect.objectContaining({
              kind: 'Group',
              metadata: expect.objectContaining({
                name: 'group-2',
              }),
              spec: expect.objectContaining({
                members: ['user-1'],
              }),
            }),
          }),
        ]),
      });
    });

    it('calls listGroupUsers only for the group whose membership timestamp changed', async () => {
      const provider = createProvider(true);
      const applyMutation = await connect(provider);
      await provider.run();
      catalogReturnsLastRun(applyMutation);

      groups[0].lastMembershipUpdated = new Date(TS2);
      groups[0].listUsers = () => {
        return new MockOktaCollection([
          {
            id: 'user-2',
            profile: {
              email: 'fname2@domain.com',
            },
          },
        ]);
      };
      await provider.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 2, 'group-2': 1 });
      const groupOne = emitted(applyMutation).find(
        e => e.entity.metadata.name === 'group-1',
      );
      expect(groupOne?.entity.spec.members).toEqual(['user-2']);
      // the new timestamp is recorded so the next run can skip again
      expect(groupOne?.entity.metadata.annotations).toEqual(
        expect.objectContaining({ [LAST_MEMBERSHIP_UPDATED]: TS2 }),
      );
    });

    it('always calls listGroupUsers when skipUnchangedGroups is disabled', async () => {
      const provider = createProvider();
      const applyMutation = await connect(provider);
      await provider.run();
      catalogReturnsLastRun(applyMutation);
      await provider.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 2, 'group-2': 2 });
      expect(streamEntities).not.toHaveBeenCalled();
      for (const annotations of groupAnnotations(applyMutation)) {
        expect(annotations).not.toHaveProperty([LAST_MEMBERSHIP_UPDATED]);
      }
    });

    it('does not annotate the entity when no last-membership-updated timestamp is provided', async () => {
      for (const group of groups) {
        group.lastMembershipUpdated = undefined;
      }
      const provider = createProvider(true);
      const applyMutation = await connect(provider);
      await provider.run();
      catalogReturnsLastRun(applyMutation);
      await provider.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 2, 'group-2': 2 });
      for (const annotations of groupAnnotations(applyMutation)) {
        expect(annotations).not.toHaveProperty([LAST_MEMBERSHIP_UPDATED]);
      }
    });

    it.each([
      ['a string', TS],
      ['an invalid Date', new Date('not a date')],
    ])(
      'fetches and still emits groups whose Okta timestamp is %s',
      async (_, value) => {
        for (const group of groups) {
          group.lastMembershipUpdated = value;
        }
        const provider = createProvider(true);
        const applyMutation = await connect(provider);
        await provider.run();
        catalogReturnsLastRun(applyMutation);
        await provider.run();

        expect(listGroupUsersCount).toEqual({ 'group-1': 2, 'group-2': 2 });
        const annotations = groupAnnotations(applyMutation);
        expect(annotations).toHaveLength(2);
        for (const groupAnnotation of annotations) {
          expect(groupAnnotation).not.toHaveProperty([LAST_MEMBERSHIP_UPDATED]);
        }
      },
    );

    it('emits groups with a malformed Okta timestamp when skipUnchangedGroups is disabled', async () => {
      for (const group of groups) {
        group.lastMembershipUpdated = new Date('not a date');
      }
      const provider = createProvider();
      const applyMutation = await connect(provider);
      await provider.run();

      expect(groupAnnotations(applyMutation)).toHaveLength(2);
    });

    it('fetches groups whose catalog entity lacks the timestamp annotation', async () => {
      // e.g. entities written before skipUnchangedGroups was enabled
      const provider = createProvider();
      const applyMutation = await connect(provider);
      await provider.run();
      catalogReturnsLastRun(applyMutation);

      const enabled = createProvider(true);
      const enabledMutation = await connect(enabled);
      await enabled.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 2, 'group-2': 2 });
      expect(groupAnnotations(enabledMutation)).toEqual([
        expect.objectContaining({ [LAST_MEMBERSHIP_UPDATED]: TS }),
        expect.objectContaining({ [LAST_MEMBERSHIP_UPDATED]: TS }),
      ]);
    });

    it('uses a custom membership timestamp annotation', async () => {
      const key = 'example.com/okta-membership';
      const provider = createProvider(true, key);
      const applyMutation = await connect(provider);
      await provider.run();
      catalogReturnsLastRun(applyMutation);
      await provider.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 1, 'group-2': 1 });
      for (const annotations of groupAnnotations(applyMutation)) {
        expect(annotations).toEqual(expect.objectContaining({ [key]: TS }));
        expect(annotations).not.toHaveProperty([LAST_MEMBERSHIP_UPDATED]);
      }
    });

    it.each([
      ['neither', {}],
      ['only catalogClient', { catalogClient: {} as CatalogService }],
      ['only auth', { auth: {} as AuthService }],
    ])(
      'rejects skipUnchangedGroups with %s of catalogClient and auth',
      (_, dependencies) => {
        expect(() =>
          OktaGroupEntityProvider.fromConfig(config, {
            logger,
            skipUnchangedGroups: true,
            ...dependencies,
          }),
        ).toThrow('skipUnchangedGroups requires catalogClient and auth');
      },
    );

    it('calls listGroupUsers for groups that have no previous group entity', async () => {
      const provider = createProvider(true);
      const applyMutation = await connect(provider);
      await provider.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 1, 'group-2': 1 });

      // second run: the catalog query returns entities but NONE of them is a
      // previously emitted group of this provider (e.g. only users) — the
      // fallback must keep fetching both groups instead of skipping
      catalogReturns(
        emitted(applyMutation)
          .map(e => e.entity)
          .filter(e => e.kind !== 'Group'),
      );
      await provider.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 2, 'group-2': 2 });
    });

    it('fetches all groups and still applies a full mutation when the catalog query fails', async () => {
      // e.g. the first scheduled run fires before the catalog router serves
      // the page request rejects, as a failing HTTP stream would
      streamEntities.mockImplementation(() => ({
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.reject(new Error('catalog not ready')),
        }),
      }));
      const warn = jest.spyOn(logger, 'warn');
      const provider = createProvider(true);
      const applyMutation = await connect(provider);
      await provider.run();

      expect(listGroupUsersCount).toEqual({ 'group-1': 1, 'group-2': 1 });
      expect(applyMutation).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'full' }),
      );
      expect(groupAnnotations(applyMutation)).toEqual([
        expect.objectContaining({ [LAST_MEMBERSHIP_UPDATED]: TS }),
        expect.objectContaining({ [LAST_MEMBERSHIP_UPDATED]: TS }),
      ]);
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('catalog not ready'),
      );
      warn.mockRestore();
    });
  });
});
