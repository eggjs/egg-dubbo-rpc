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
