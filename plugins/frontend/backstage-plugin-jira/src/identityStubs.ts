import { IdentityApi } from '@backstage/core-plugin-api';

export const getIdentityApiStub: IdentityApi = {
  getProfileInfo: jest.fn(),
  getBackstageIdentity: jest.fn(),
  async getCredentials() {
    return { token: 'fake-id-token' };
  },
  signOut: jest.fn(),
};
