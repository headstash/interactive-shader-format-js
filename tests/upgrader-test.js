import { readFileSync } from 'fs';
import { test, expect } from 'vitest';
import { Upgrader, Parser } from '../src/main';

function assetLoad(name) {
  return readFileSync('./tests/assets/' + name).toString();
}

test('Upgrade fragment shader to v2', () => {
  const old = assetLoad('version1.fs');
  const upgraded = Upgrader.convertFragment(old);
  expect(upgraded).toBe(assetLoad('version1.upgraded.fs'));
});

test('Upgrade vertex shader to v2', () => {
  const old = assetLoad('version1.vs');
  const upgraded = Upgrader.convertVertex(old);
  expect(upgraded).toBe(assetLoad('version1.upgraded.vs'));
});

test('Infer ISF Versioning', () => {
  let parser = new Parser();
  parser.parse(assetLoad('version1.fs'));
  expect(parser.isfVersion).toBe(1);

  parser = new Parser();
  parser.parse(assetLoad('version1_basic.fs'));
  expect(parser.isfVersion).toBe(1);

  parser = new Parser();
  parser.parse(assetLoad('version1.upgraded.fs'));
  expect(parser.isfVersion).toBe(2);
});
