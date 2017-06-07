'use strict';

exports.register = function (server, options, next) {
  server.settings.enablePlugin2 = true;
  next();
};

exports.register.attributes = {
  name: 'plugin2',
  version: '1.0.0',
};
