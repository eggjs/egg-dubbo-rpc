'use strict';

module.exports = {
  write: true,
  prefix: '^',
  plugin: 'autod-egg',
  test: [
    'test',
    'benchmark',
  ],
  devdep: [
    'egg',
    'egg-bin',
    'egg-rpc-base',
    'egg-rpc-generator',
    'autod',
    'autod-egg',
    'eslint',
    'eslint-config-egg',
    'webstorm-disable-index',
  ],
  exclude: [
    './test/fixtures',
    './docs',
    './coverage',
  ],
};
