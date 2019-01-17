/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const { URL } = require('url');
const mock = require('egg-mock');
const assert = require('assert');
const sleep = require('mz-modules/sleep');
const DubboNacosRegistry = require('../lib/registry/nacos').DataClient;

const logger = console;
const address = '127.0.0.1:8848';

describe('test/nacos.test.js', () => {
  let app;
  before(async function() {
    app = mock.app({
      baseDir: 'apps/dubbo-nacos',
    });
    await app.ready();
    await sleep(3000);
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should invoke dubbo rpc ok', () => {
    return app.httpRequest()
      .get('/')
      .expect('hello gxcsoccer')
      .expect(200);
  });

  it('should nacos subscribe & unSubscribe ok', async () => {
    const client = new DubboNacosRegistry({
      logger,
      address,
    });
    await client.ready();

    const config = {
      interfaceName: 'eggjs.demo.DemoService',
      version: '1.0.0',
      group: 'HSF',
    };

    client.subscribe(config, addressList => {
      client.emit('addressList', addressList);
    });

    let addressList = await client.await('addressList');
    console.log(addressList);

    assert(addressList.length);
    addressList.forEach(addr => {
      const url = new URL(addr);
      assert(url.port === '12200');
      assert(url.searchParams.get('appName') === 'dubbo-nacos');
      assert(url.searchParams.get('interface') === 'eggjs.demo.DemoService');
      assert(url.searchParams.get('version') === '1.0.0');
      assert(url.searchParams.get('group') === 'HSF');
      assert(url.searchParams.get('serialization') === 'hessian2');
    });

    const listener = addressList => {
      client.emit('addressList_2', addressList);
    };
    client.subscribe(config, listener);

    addressList = await client.await('addressList_2');
    assert(addressList.length);

    client.unSubscribe(config, listener);
    client.unSubscribe(config);

    assert(client._subscribeMap.size === 0);

    await client.close();
  });
});
