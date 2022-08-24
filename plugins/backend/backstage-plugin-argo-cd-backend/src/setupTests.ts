import fetchMock from 'jest-fetch-mock';

jest.setMock('cross-fetch', fetchMock);

export {};
