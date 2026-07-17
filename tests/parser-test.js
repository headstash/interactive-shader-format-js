import { readFileSync } from 'fs';
import { test, expect } from 'vitest';
import { Parser } from '../src/main';

function assetLoad(name) {
  return readFileSync('./tests/assets/' + name).toString();
}

test('Infer Generator Type', () => {
  const src = assetLoad('generator.fs');
  const parser = new Parser();
  parser.parse(src);
  expect(parser.type).toBe('generator');
});

test('Infer Filter Type', () => {
  const src = assetLoad('image-filter.fs');
  const parser = new Parser();
  parser.parse(src);
  expect(parser.type).toBe('filter');
});

test('Infer Transition Type', () => {
  const src = assetLoad('transition.fs');
  const parser = new Parser();
  parser.parse(src);
  expect(parser.type).toBe('transition');
});

test('Buffers correctly marked as persistent', () => {
  const src = assetLoad('persistent-buffers.fs');
  const parser = new Parser();
  parser.parse(src);
  const passes = parser.passes;

  for (let i = 0; i < passes.length - 1; i++) {
    expect(passes[i].persistent).toBe(true);
  }
  expect(passes[passes.length - 1].persistent).toBe(false);
});

test('Bad metadata gives error line', () => {
  const src = assetLoad('bad-metadata.fs');
  const parser = new Parser();
  parser.parse(src);
  expect(0).toBe(0);
});

test('IMG_NORM_PIXEL to VVSAMPLER_2DBYNORM', () => {
  const src = assetLoad('img_norm_pixel_isf.fs');
  const parser = new Parser();
  parser.parse(src);
  const { fragmentShader } = parser;

  const IMG_NORM_PIXEL = (variable) => `IMG_NORM_PIXEL(inputImage, ${variable});`;
  const VVSAMPLER_2DBYNORM = (variable) =>
    `VVSAMPLER_2DBYNORM(inputImage, _inputImage_imgRect, _inputImage_imgSize, _inputImage_flip, ${variable});`;

  const variableTypes = [
    'isf_FragNormCoord',
    'vec2(isf_FragNormCoord)',
    'vec2(isf_FragNormCoord.x, isf_FragNormCoord.y)',
    'vec2(x, y)',
    'vec3(x, y, x).xy',
    'vec4(x, y, x, y).xy',
  ];

  variableTypes.forEach((variable) => {
    expect(fragmentShader.indexOf(VVSAMPLER_2DBYNORM(variable))).not.toBe(-1);
  });
});

test('IMG_PIXEL to texture2D', () => {
  const src = assetLoad('img_pixel_isf.fs');
  const parser = new Parser();
  parser.parse(src);
  const { fragmentShader } = parser;

  const IMG_PIXEL = (variable) => `IMG_PIXEL(inputImage, ${variable});`;
  const TEXTURE2D = (variable) => `texture2D(inputImage, (${variable}) / RENDERSIZE);`;

  const variableTypes = [
    'gl_FragCoord.xy',
    'vec2(gl_FragCoord.xy)',
    'vec2(gl_FragCoord.x, gl_FragCoord.y)',
    'vec2(x, y)',
    'vec3(x, y, x).xy',
    'vec4(x, y, x, y).xy',
  ];

  variableTypes.forEach((variable) => {
    expect(fragmentShader.indexOf(TEXTURE2D(variable))).not.toBe(-1);
  });
});
