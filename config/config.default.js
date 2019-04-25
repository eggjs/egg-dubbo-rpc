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

const assert = require('assert');
const protocol = require('js-remoting-for-apache-dubbo');
const DubboNacosRegistry = require('../lib/registry/nacos');
const DubboZookeeperRegistry = require('../lib/registry/zk');

const buildinRegistryMap = {
  zk: DubboZookeeperRegistry,
  nacos: DubboNacosRegistry,
};

module.exports = (appInfo, appConfig) => {
  let registryClass = DubboZookeeperRegistry;
  if (appConfig.rpc && appConfig.rpc.registry && appConfig.rpc.registry.type) {
    registryClass = buildinRegistryMap[appConfig.rpc.registry.type];
    assert(registryClass, `config.rpc.registry.type should be in [ ${Object.keys(buildinRegistryMap).map(k => '"' + k + '"')} ]`);
  }
  return {
    rpc: {
      registryClass,
      client: {
        protocol,
      },
      server: {
        version: '1.0.0',
        group: '',
        protocol,
        codecType: 'hessian2',
      },
    },
  };
};
