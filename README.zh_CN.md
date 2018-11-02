# egg-dubbo-rpc

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-dubbo-rpc.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-dubbo-rpc
[travis-image]: https://img.shields.io/travis/eggjs/egg-dubbo-rpc.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-dubbo-rpc
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-dubbo-rpc.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-dubbo-rpc?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-dubbo-rpc.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-dubbo-rpc
[snyk-image]: https://snyk.io/test/npm/egg-dubbo-rpc/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-dubbo-rpc
[download-image]: https://img.shields.io/npm/dm/egg-dubbo-rpc.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-dubbo-rpc

Dubbo RPC 插件

## 依赖说明

### 依赖的 egg 版本

egg-dubbo-rpc 版本 | egg 1.x
--- | ---
1.x | 😁
0.x | ❌

### 依赖的插件

- egg-rpc

## 开启插件

```js
// config/plugin.js
exports.dubbo = {
  enable: true,
  package: 'egg-dubbo-rpc',
};
```

## 提问交流

请到 [egg issues](https://github.com/eggjs/egg/issues) 异步交流。

## License

[MIT](LICENSE)
