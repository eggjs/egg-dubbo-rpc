'use strict';

const protocol = require('dubbo-remoting');
const DubboZookeeperRegistry = require('../lib/zk_registry');

exports.rpc = {
  registryClass: DubboZookeeperRegistry,
  client: {
    protocol,
  },
  server: {
    version: '1.0.0',
    group: '',
    protocol,
    codecType: 'hessian2',
  },
};
