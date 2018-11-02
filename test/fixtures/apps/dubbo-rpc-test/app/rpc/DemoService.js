'use strict';

exports.sayHello = async function(name) {
  return 'hello ' + name;
};

exports.echoPerson = async function(p) {
  return {
    $class: 'eggjs.demo.Person',
    $: p,
  };
};
