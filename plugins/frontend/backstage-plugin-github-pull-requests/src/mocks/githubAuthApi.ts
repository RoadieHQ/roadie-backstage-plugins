const mockAccessToken = jest
  .fn()
  .mockImplementation(async (_: string[]) => 'test-token');

const getMockGithubAuth = (state: 'SignedIn' | 'SignedOut') => ({
  getAccessToken: mockAccessToken,
  sessionState$: jest.fn(() => ({
    subscribe: (fn: (a: string) => void) => {
      fn(state);
      return { unsubscribe: jest.fn() };
    },
  })),
});

export const SignedInMockGithubAuthState = getMockGithubAuth('SignedIn');
export const SignedOutMockGithubAuthState = getMockGithubAuth('SignedOut');
