// eslint-disable-next-line notice/notice
import '@testing-library/jest-dom';
import { TransformStream } from 'node:stream/web';

Object.defineProperties(globalThis, {
  TransformStream: { value: TransformStream },
});
