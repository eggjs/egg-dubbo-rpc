'use strict';

module.exports = {
  group: 'HSF',
  version: '1.0.0',
  services: [{
    appName: 'jar2proxy',
    api: {
      DemoService: {
        interfaceName: 'eggjs.demo.DemoService',
      },
    },
    dependency: [{
      groupId: 'org.apache.dubbo',
      artifactId: 'dubbo-demo-api',
      version: '1.0-SNAPSHOT',
    }],
  }],
};
