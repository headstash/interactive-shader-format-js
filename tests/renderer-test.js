import { readFileSync } from 'fs';
import { test, expect } from 'vitest';
import { decode } from 'fast-png';
import gl from 'gl';
import pixelmatch from 'pixelmatch';
import { Renderer } from '../src/main';

const glAvailable = gl(1, 1) !== null;

function assetLoad(name) {
  return readFileSync('./tests/assets/' + name).toString();
}

const width = 128;
const height = 128;
const destination = { width, height, offsetWidth: width, offsetHeight: height };

function renderToPixels(src, steps) {
  const ctx = gl(width, height);
  const renderer = new Renderer(ctx);
  renderer.loadSource(src);
  if (steps) {
    steps(renderer);
  } else {
    renderer.draw(destination);
  }
  const pixels = new Uint8Array(width * height * 4);
  ctx.readPixels(0, 0, width, height, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);
  return pixels;
}

function matchesExpected(renderedPixels, expectedPath) {
  const expected = decode(readFileSync(expectedPath));
  const numDiff = pixelmatch(renderedPixels, expected.data, null, width, height, { threshold: 0.1 });
  return numDiff === 0;
}

test.skipIf(!glAvailable)('Basic Generator Rendering', () => {
  const pixels = renderToPixels(assetLoad('generator.fs'));
  expect(matchesExpected(pixels, './tests/expected/generator.png')).toBe(true);
});

test.skipIf(!glAvailable)('Persistent Buffers', () => {
  const pixels = renderToPixels(assetLoad('persistent-buffers.fs'), (renderer) => {
    renderer.setValue('xPos', 0);
    renderer.draw(destination);
    renderer.setValue('xPos', 0.5);
    renderer.draw(destination);
    renderer.setValue('xPos', 1.0);
    renderer.draw(destination);
    renderer.draw(destination);
  });
  expect(matchesExpected(pixels, './tests/expected/persistent-buffers.png')).toBe(true);
});
