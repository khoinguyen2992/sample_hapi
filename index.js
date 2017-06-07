'use strict';

const Hapi = require('hapi');
const Joi = require('joi');

const server = new Hapi.Server();

const plugin = {
  register: function(server, options, next) {
    server.settings.enablePlugin1 = true
    next();
  }
}

plugin.register.attributes = {
  name: 'plugin1',
  version: '1.0.0'
}

server.connection({
  port: 3000,
  host: 'localhost'
});

server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    const { enablePlugin1, enablePlugin2 } = request.server.settings;
    console.log(enablePlugin1, enablePlugin2)
    reply('hello');
  }
});

server.route({
  method: 'GET',
  path: '/{name}',
  handler: function(request, reply) {
    const pName = encodeURIComponent(request.params.name);
    const { error , value } = Joi.validate(pName, Joi.string().min(3));
    if (error) {
      return reply('invalid name');
    }

    request.yar.set('name', value);
    reply(`hello ${value}`);
  }
});

server.route({
  method: 'GET',
  path: '/goodbye',
  handler: function(request, reply) {
    const name = request.yar.get('name');
    reply(`bye ${name}`);
  }
});

server.register([{
  register: require('good'),
  options: {
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          response: '*',
          log: '*'
        }]
      }, {
        module: 'good-console',
      }, 'stdout']
    }
  }
}, {
  register: require('yar'),
  options: {
    storeBlank: false,
    cookieOptions: {
        password: 'the-password-must-be-at-least-32-characters-long',
        isSecure: false
    }
  }
},{
  register: require('./plugin')
}, {
  register: plugin
}], err => {
  if (err) {
    throw err;
  }
  
  server.start(err => {
    if (err) {
      throw err;
    }

    console.log(`Server running at: ${server.info.uri}`)
  });
});
