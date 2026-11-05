/*
 * Copyright 2026 Larder Software Limited
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
import {
  UTF8_MAX_INLINE_BYTES,
  determineFileEncoding,
  isBinaryBuffer,
} from './publishGithubPullRequestDebug';

describe('publishGithubPullRequestDebug encoding helpers', () => {
  describe('isBinaryBuffer', () => {
    it('returns false for ASCII text', () => {
      expect(isBinaryBuffer(Buffer.from('hello world'))).toBe(false);
    });

    it('returns false for UTF-8 text with multi-byte characters', () => {
      expect(isBinaryBuffer(Buffer.from('héllo 🚀 wörld', 'utf-8'))).toBe(
        false,
      );
    });

    it('returns true when a NUL byte appears in the scanned prefix', () => {
      expect(isBinaryBuffer(Buffer.from([0x48, 0x00, 0x49]))).toBe(true);
    });

    it('returns true for a minimal PNG header', () => {
      // PNG signature contains 0x00 bytes in its IHDR chunk length
      const png = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      expect(isBinaryBuffer(png)).toBe(true);
    });

    it('only scans the first 8000 bytes', () => {
      const buf = Buffer.alloc(10000, 0x41);
      buf[9000] = 0x00;
      expect(isBinaryBuffer(buf)).toBe(false);
    });
  });

  describe('determineFileEncoding', () => {
    it('returns utf-8 for a plain text file', () => {
      expect(
        determineFileEncoding({ content: Buffer.from('hello world') }),
      ).toBe('utf-8');
    });

    it('returns utf-8 for UTF-8 text with emoji', () => {
      expect(
        determineFileEncoding({ content: Buffer.from('deploy 🚢', 'utf-8') }),
      ).toBe('utf-8');
    });

    it('returns utf-8 for symlinks regardless of content', () => {
      expect(
        determineFileEncoding({
          content: Buffer.from([0x00, 0x01, 0x02]),
          symlink: true,
        }),
      ).toBe('utf-8');
    });

    it('returns base64 for binary content (NUL byte present)', () => {
      const png = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      expect(determineFileEncoding({ content: png })).toBe('base64');
    });

    it('falls back to base64 when a single file exceeds the inline cap', () => {
      const big = Buffer.alloc(UTF8_MAX_INLINE_BYTES + 1, 0x41);
      expect(determineFileEncoding({ content: big })).toBe('base64');
    });

    it('keeps utf-8 when the file is exactly at the inline cap', () => {
      const atCap = Buffer.alloc(UTF8_MAX_INLINE_BYTES, 0x41);
      expect(determineFileEncoding({ content: atCap })).toBe('utf-8');
    });
  });
});
