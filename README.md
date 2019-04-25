# egg-rpc-for-apache-dubbo

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-rpc-for-apache-dubbo.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-rpc-for-apache-dubbo
[travis-image]: https://img.shields.io/travis/eggjs/egg-rpc-for-apache-dubbo.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-rpc-for-apache-dubbo
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-rpc-for-apache-dubbo.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-rpc-for-apache-dubbo?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-rpc-for-apache-dubbo.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-rpc-for-apache-dubbo
[snyk-image]: https://snyk.io/test/npm/egg-rpc-for-apache-dubbo/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-rpc-for-apache-dubbo
[download-image]: https://img.shields.io/npm/dm/egg-rpc-for-apache-dubbo.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-rpc-for-apache-dubbo

Dubbo RPC plugin for Egg.js

## Install

```bash
$ npm i egg-rpc-for-apache-dubbo --save
```

## Usage

### 1. Enable the Plugin

enable egg-rpc-for-apache-dubbo plugin in ${app_root}/config/plugin.js:

```js
// {app_root}/config/plugin.js
exports.dubboRpc = {
  enable: true,
  package: 'egg-rpc-for-apache-dubbo',
};
```

### 2. Configuration

```js
// @example
exports.rpc = {
  registry: {
    address: '127.0.0.1:2181', // configure your real zk address
  },
  client: {
    responseTimeout: 3000,
  },
  server: {
    namespace: 'org.eggjs.rpc.test',
    port: 12200,
    maxIdleTime: 90 * 1000,
    codecType: 'hessian2',
    selfPublish: true,
    version: '1.0.0',
    group: 'DUBBO',
    autoServe: true,
  },
};
```

all configuations is under `rpc` property

- **registry** (we use zookeeper as service registry in dubbo)
  - `address:(required)` the zookeeper address
- **client**
  - `responseTimeout:(optional)` number of milliseconds to wait for a response, if timeout will get an exception, the default value is 3000(ms)
- **server**
  - `namespace:(required)` the default namespace to publish all services
  - `port:(optional)` the port which RPC server listening on, the default value is 12200
  - `maxIdleTime:(optional)` maximum idle time (in milliseconds) for a connection
  - `codecType:(optional)` the serialization type, default value is hessian2
  - `selfPublish:(optional)` if set to true (default), every worker process will listen on different ports
  - `version:(optional)` the service version, default value is 1.0.0
  - `group:(optional)` the service group, default value is DUBBO
  - `autoServe:(optional)` if set to true (default), will launce Dubbo RPC server automatically

### 3. Call Dubbo Services as Consumer

#### Configure the Interface in proxy.js

First, you need to put the JAR file (which contains the API interfaces) into `{app_root}/assembly` folder.

And then you need to config `$app_root/config/proxy.js`, which is a very important config file for RPC client, you should configure the services you needed, then executing the egg-rpc-generator tool to generate the proxy files.

Let's see a simple example of proxy.js. It declare a interface named: `org.eggjs.dubbo.UserService` provided by `dubbo` application

```js
'use strict';

module.exports = {
  group: 'HSF',
  version: '1.0.0',
  services: [{
    appName: 'dubbo',
    api: {
      UserService: {
        interfaceName: 'org.eggjs.dubbo.UserService',
      },
    },
    dependency: [{
      groupId: 'eggjs',
      artifactId: 'dubbo-demo-api',
      version: '1.0-SNAPSHOT',
    }],
  }],
};
```

details as follows:

- `version:(optional)` service version, the global config
- `group:(optional)` service group
- `errorAsNull:(optional)` if set true, we are returning null instead of throwing an exception while error appears
- `services:(required)` RPC services configuation
  - `appName:(required)` the name of RPC provider
  - `api:(required)` API details
    - `interfaceName:(required)` interface name
    - `version:(optional)` service version, it will overwrite the global one
    - `group:(optional)` service group, it will overwrite the global one
  - `dependency:(required)` like Maven pom config
    - `groupId:(required)` uniquely identifies your project across all projects
    - `artifactId:(required)` the name of the jar without version
    - `version:(required)` the jar version

#### Generate the Proxy

Run egg-rpc-generator to generate the proxy files. After running success, it will generate all proxy files under ${app_root}/app/proxy

install egg-rpc-generator
```bash
$ npm i egg-rpc-generator --save-dev
```

add rpc command into scripts of package.json

```json
{
  "scripts": {
    "rpc": "egg-rpc-generator"
  },
}
```

execute the rpc command
```bash
$ npm run rpc
```

#### Call Dubbo Service

You can call the Dubbo RPC service by using `ctx.proxy.proxyName`. The proxyName is key value of api object you configure in proxy.js. In our example, it's `UserService`, and proxyName using lower camelcase, so it's `ctx.proxy.userService`

```js
'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const result = await ctx.proxy.userService.echoUser({
      id: 123456,
      name: 'gxcsoccer',
      address: 'Space C',
      salary: 100000000,
    });
    ctx.body = result;
  }
}

module.exports = HomeController;
```

#### Unittest of RPC Client in Egg.js

you can use `app.mockProxy` to mock the RPC interface
```js
'use strict';

const mm = require('egg-mock');
const assert = require('assert');

describe('test/mock.test.js', () => {
  let app;
  before(async function() {
    app = mm.app({
      baseDir: 'apps/mock',
    });
    await app.ready();
  });
  afterEach(mm.restore);
  after(async function() {
    await app.close();
  });

  it('should app.mockProxy ok', async function() {
    app.mockProxy('DemoService', 'sayHello', async function(name) {
      return 'hello ' + name + ' from mock';
    });

    const ctx = app.createAnonymousContext();
    const res = await ctx.proxy.demoService.sayHello('gxcsoccer');
    assert(res === 'hello gxcsoccer from mock');
  });
});
```

As above, you can call remote service as a local method.

### 4. Expose Dubbo Services as Provider

#### Define the RPC Interface

create a JAR file that contains the API interface

#### Implemenation the RPC Interface

Put your implementation code under `${app_root}/app/rpc` folder

```js
// ${app_root}/app/rpc/UserService.js
exports.echoUser = async function(user) {
  return user;
};

exports.interfaceName = 'org.eggjs.dubbo.UserService';
exports.version = '1.0.0';
exports.group = 'DUBBO';
```

#### Unittest of your RPC Server in Egg.js

```js
'use strict';

const mm = require('egg-mock');

describe('test/index.test.js', () => {
  let app;
  before(async function() {
    app = mm.app({
      baseDir: 'apps/rpcserver',
    });
    await app.ready();
  });
  after(async function() {
    await app.close();
  });

  it('should invoke HelloService', done => {
    app.rpcRequest('org.eggjs.dubbo.UserService')
      .invoke('echoUser')
      .send([{
        id: 123456,
        name: 'gxcsoccer',
        address: 'Space C',
        salary: 100000000,
      }])
      .expect({
        id: 123456,
        name: 'gxcsoccer',
        address: 'Space C',
        salary: 100000000,
      }, done);
  });
});
```

For more details of app.rpcRequest, you can refer to this [acticle](https://github.com/eggjs/egg-sofa-rpc/wiki/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95-RPC-%E6%9C%8D%E5%8A%A1%E7%9A%84%E6%96%B9%E6%B3%95)

## Reference List

- [RPC in Node.js Part One](https://www.yuque.com/egg/nodejs/dklip5)
- [RPC in Node.js Part Two](https://www.yuque.com/egg/nodejs/mhgl9f)
- [Cross-Language Interoperability between Egg.js & Dubbo](https://www.yuque.com/egg/nodejs/kril24)
- [Custom Service Discovery in Egg.js](https://github.com/eggjs/egg-sofa-rpc/wiki/%E8%87%AA%E5%AE%9A%E4%B9%89%E6%9C%8D%E5%8A%A1%E5%8F%91%E7%8E%B0%E5%AE%9E%E7%8E%B0)
- [RPC Proxy Configuration in Egg.js](https://github.com/eggjs/egg-sofa-rpc/wiki/RPC-%E4%BB%A3%E7%90%86%EF%BC%88Proxy%EF%BC%89%E9%85%8D%E7%BD%AE)
- [RPC Unittest in Egg.js](https://github.com/eggjs/egg-sofa-rpc/wiki/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95-RPC-%E6%9C%8D%E5%8A%A1%E7%9A%84%E6%96%B9%E6%B3%95)

## Questions & Suggestions

Please open an issue [here](https://github.com/dubbo/egg-rpc-for-apache-dubbo/issues).

## License

[Apache License V2](LICENSE)
