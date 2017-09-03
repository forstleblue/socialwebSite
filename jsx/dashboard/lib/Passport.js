var Static = require('./StaticProperties.js');

var $ = require('jquery');

var Passport = {
  isAuth: function (transition, callback) {
    $.get('me').error(function (data, msg, res) {
      window.location.href = '/admin/login';
    }).always(function (data, msg, res) {
      callback();
    });
  },
  isAdmin: function (transition, callback) {
    $.get('me').error(function (data, msg, res) {
      window.location.href = '/admin/login';
    }).success(function (data, msg, res) {
      if (!Static.user.isAdmin(data.user)) {
        transition.redirect('/401', {});
      }
    }).always(function (data, msg, res) {
      callback();
    });
  },
  isNotEditor: function (transition, callback) {
    $.get('me').error(function (data, msg, res) {
      window.location.href = '/admin/login';
    }).success(function (data, msg, res) {
      if (Static.user.isEditor(data.user)) {
        transition.redirect('/401', {});
      }
    }).always(function (data, msg, res) {
      callback();
    });
  }
};

module.exports = Passport;
