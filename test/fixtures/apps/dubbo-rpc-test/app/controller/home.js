'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = await this.ctx.proxy.demoService.sayHello('gxcsoccer');
  }
}

module.exports = HomeController;
