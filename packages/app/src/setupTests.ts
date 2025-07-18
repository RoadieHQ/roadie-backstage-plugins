// eslint-disable-next-line notice/notice
import '@testing-library/jest-dom';

Object.defineProperty(global, 'TransformStream', {
  value: require('node:stream/web').TransformStream,
  writable: true,
});
