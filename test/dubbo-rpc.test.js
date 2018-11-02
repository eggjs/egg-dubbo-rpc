'use strict';

const mock = require('egg-mock');

describe('test/dubbo-rpc.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/dubbo-rpc-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, dubbo')
      .expect(200);
  });
});
