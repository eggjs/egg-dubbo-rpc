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
const SdkBase = require('sdk-base');
const { URL, URLSearchParams } = require('url');
const NacosNamingClient = require('nacos').NacosNamingClient;
const RegistryBase = require('sofa-rpc-node/lib/registry/base');

const localIp = require('address').ip();

class NacosRegistryClient extends SdkBase {
  constructor(options = {}) {
    assert(options.logger, '[NacosRegistryClient] options.logger is required');
    assert(options.address, '[NacosRegistryClient] options.address is required');
    super({ initMethod: '_init' });
    this.options = options;
    this._client = null;
    this._subscribeMap = new Map(); // <serviceKey, addressList>
  }

  get logger() {
    return this.options.logger;
  }

  async _init() {
    let serverList = this.options.address;
    const namespace = this.options.namespace || 'default';
    if (typeof serverList === 'string') {
      serverList = serverList.split(',');
    }
    this._client = new NacosNamingClient({
      logger: this.logger,
      serverList,
      namespace,
    });
    await this._client.ready();
  }

  async register(config) {
    assert(config && config.interfaceName, '[NacosRegistry] register(config) config.interfaceName is required');
    assert(config.url, '[NacosRegistry] register(config) config.url is required');
    const serviceName = this._buildProviderPath(config);
    const url = new URL(config.url);
    const searchParams = url.searchParams;
    const metadata = {};
    for (const key of searchParams.keys()) {
      metadata[key] = searchParams.get(key);
    }
    await this._client.registerInstance(serviceName, {
      ip: url.hostname,
      port: Number(url.port),
      metadata,
    });
  }

  async unRegister(config) {
    assert(config && config.interfaceName, '[NacosRegistry] register(config) config.interfaceName is required');
    assert(config.url, '[NacosRegistry] register(config) config.url is required');
    const serviceName = this._buildProviderPath(config);
    const url = new URL(config.url);
    await this._client.deregisterInstance(serviceName, {
      ip: url.hostname,
      port: Number(url.port),
    });
  }

  async _doSubscribe(consumerKey, config) {
    this._subscribeMap.set(consumerKey, null);
    const groupName = config.groupName;
    await this._client.registerInstance(consumerKey, {
      ip: localIp,
      port: 0,
    }, groupName);
    const providerKey = this._buildProviderPath(config);
    this._client.subscribe({
      serviceName: providerKey,
      groupName: groupName
    }, hosts => {
      const addressList = hosts.filter(host => host.enabled).map(host => {
        const params = new URLSearchParams();
        const metadata = host.metadata || {};
        for (const key in metadata) {
          params.append(key, metadata[key]);
        }
        return `dubbo://${host.ip}:${host.port}?${params.toString()}`;
      });
      this._subscribeMap.set(consumerKey, addressList);
      this.emit(consumerKey, addressList);
    });
  }

  subscribe(config, listener) {
    assert(config && config.interfaceName, '[NacosRegistry] subscribe(config, listener) config.interfaceName is required');
    const consumerKey = this._buildConsumerPath(config);

    if (!this._subscribeMap.has(consumerKey)) {
      this._doSubscribe(consumerKey, config)
        .catch(err => { this.emit('error', err); });
    } else {
      const addressList = this._subscribeMap.get(consumerKey);
      if (addressList) {
        setImmediate(() => { listener(addressList); });
      }
    }
    this.on(consumerKey, listener);
  }

  unSubscribe(config, listener) {
    assert(config && config.interfaceName, '[NacosRegistry] unSubscribe(config, listener) config.interfaceName is required');
    const consumerKey = this._buildConsumerPath(config);

    if (listener) {
      this.removeListener(consumerKey, listener);
    } else {
      this.removeAllListeners(consumerKey);
    }
    if (this.listenerCount(consumerKey) === 0) {
      const providerKey = this._buildProviderPath(config);
      this._client.unSubscribe(providerKey);
      this._subscribeMap.delete(consumerKey);
    }
  }

  _buildProviderPath(config) {
    return this._getServiceName(config, 'providers');
  }

  _buildConsumerPath(config) {
    return this._getServiceName(config, 'consumers');
  }

  _getServiceName(config, category = 'providers') {
    let serviceName = category + ':' + config.interfaceName;
    if (config.version) {
      serviceName += ':' + config.version;
    }
    if (config.group) {
      serviceName += ':' + config.group;
    }
    return serviceName;
  }

  async _close() {
    await this._client.close();
    this._subscribeMap.clear();
  }
}

class DubboNacosRegistry extends RegistryBase {
  get DataClient() {
    return NacosRegistryClient;
  }

  static get DataClient() {
    return NacosRegistryClient;
  }
}

module.exports = DubboNacosRegistry;
