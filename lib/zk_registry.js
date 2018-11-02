'use strict';

const assert = require('assert');
const { ZookeeperRegistry } = require('sofa-rpc-node').registry;

class DubboZookeeperRegistry extends ZookeeperRegistry {
  constructor(options = {}) {
    assert(options.address, '[DubboZookeeperRegistry] options.address is required');
    // dubbo zk registry 的根目录是 /dubbo/
    if (options.address.indexOf('/') === -1) {
      options.address += '/dubbo/';
    }
    super(options);
  }
}

module.exports = DubboZookeeperRegistry;
