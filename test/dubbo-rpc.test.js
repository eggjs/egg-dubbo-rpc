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

const mock = require('egg-mock');
const assert = require('assert');
const sleep = require('mz-modules/sleep');
const zookeeper = require('zookeeper-cluster-client');

describe('test/dubbo-rpc.test.js', () => {
  let app;
  before(async function() {
    app = mock.app({
      baseDir: 'apps/dubbo-rpc-test',
    });
    await app.ready();
    await sleep(1000);
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should invoke dubbo rpc ok', () => {
    return app.httpRequest()
      .get('/')
      .expect('hello gxcsoccer')
      .expect(200);
  });

  it('should registry under /dubbo/', async function() {
    const zkClient = zookeeper.createClient(app.config.rpc.registry.address);
    const children = await zkClient.getChildren('/dubbo/eggjs.demo.DemoService/providers');

    console.log(children);
    assert(children && children.length === 1);
    assert(children[0].startsWith('dubbo%3A%2F%2F'));

    await zkClient.close();
  });
});
