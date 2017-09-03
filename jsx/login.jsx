var $ = require('jquery');
var React = require('react');

var LoginView = require('./login/LoginView.jsx');

React.render(<LoginView/>, $('.content').get(0));
