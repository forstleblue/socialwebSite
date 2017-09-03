var $ = require('jquery');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');
var Navigation = require('react-router').Navigation;
var Breadcrumb = require('./Breadcrumb.jsx');
var SortableMixin = require('sortablejs/react-sortable-mixin');
var SearchHistory = require('./lib/SearchHistory.js');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var Input = ReactBootstrap.Input;
var Alert = ReactBootstrap.Alert;
var Panel = ReactBootstrap.Panel;

var ButtonLink = ReactRouterBootstrap.ButtonLink;

var Passport = require('./lib/Passport.js');

var AgenciesView = React.createClass({
  mixins: [
    Navigation, SortableMixin
  ],
  statics: {
    willTransitionTo : function (transition, params, query, callback) {
      Passport.isAdmin(transition, callback);
    }
  },
  sortableOptions: {
    'ref': 'agencies',
    'model': 'agencies'
  },
  getInitialState: function () {
    return {
      'loading': true,
      'agencies': [],
      'alert': {
        'bsStyle': null,
        'message': null
      }
    };
  },
  componentDidMount: function (e) {
    var value = SearchHistory.getHistory('agencies');
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    $(input).val(value);
    this.getSearchAgencies(value);
  },
  getAgencies: function () {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      if ($(input).val().length == 0) {
        $.get('agencies').done(function (data) {
          if ($(input).val().length == 0) {
            this.setState({
              'loading': false,
              'agencies': data.agencies
            });
          }
        }.bind(this));
      }
    }.bind(this));
  },
  getSearchAgencies: function(value) {
    if (value.length > 0) {
      SearchHistory.save('agencies', value);
      $.post('agencies/search', {
        'search': value
      }).done(function (data) {
        if (value.length > 0) {
          this.setState({
            'loading': false,
            'agencies': data.hits
          });
        }
      }.bind(this));
    } else {
      this.getAgencies();
    }
  },
  handleSearch: function (e) {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      this.getSearchAgencies($(input).val());
    }.bind(this));
  },
  handleSort: function (e) {
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    if ($(input).val().length > 0) return this.setState({
      'alert': {
        'bsStyle': 'warning',
        'message': 'Agencies could not be sorted while searching'
      }
    });
    $.ajax({
      'type': 'POST',
      'url': 'agencies/order',
      'processData': false,
      'contentType': 'application/json',
      'data': JSON.stringify({
        'agencies': this.state.agencies.map(function (agency) {
          return agency._id;
        })
      })
    });
  },
  handleAlertDismiss: function () {
    this.setState({
      'alert': {
        'bsStyle': null,
        'message': null
      }
    });
  },
  render: function () {
    var links = [
      {
        'label': (
          <Glyphicon glyph='home'></Glyphicon>
        ),
        'url': '#/'
      }, {
        'label': 'Agencies'
      }
    ];
    var loading;
    if (this.state.loading) {
      loading = (
        <Alert bsStyle='info'>Loading ...</Alert>
      );
    }
    var alert;
    if (this.state.alert.message) {
      alert = (
        <Alert bsStyle={this.state.alert.bsStyle} dismissAfter={10000} onDismiss={this.handleAlertDismiss}>
          <span>{this.state.alert.message}</span>
        </Alert>
      );
    }
    var agencies = this.state.agencies.map(function (agency) {
      var url = '/agency/' + agency._id;
      var classNames = 'clickable agency';
      if (!agency.online)
        classNames += ' offline';
      return (
        <Col key={agency._id} md={4} sm={6} xs={12}>
          <Panel className={classNames} footer={agency.description} onClick={this.transitionTo.bind(this, url)}>
            {agency.title}
          </Panel>
        </Col>
      );
    }.bind(this));
    if (!this.state.loading && agencies.length == 0) {
      agencies = (
        <Grid fluid>
          <Alert bsStyle='warning'>No agency found</Alert>
        </Grid>
      );
    }
    return (
      <Grid>
        <Row>
          <Col lg={7} md={5} sm={4} xs={12}>
            <Breadcrumb links={links}></Breadcrumb>
          </Col>
          <Col lg={3} md={4} sm={4} xs={6}>
            <Input addonAfter={<Glyphicon glyph='search'></Glyphicon>} onChange={this.handleSearch} placeholder='Search' ref='search' type='search'></Input>
          </Col>
          <Col lg={2} md={3} sm={4} xs={6}>
            <ButtonLink block bsStyle='success' params={{
              'id': 'new'
            }} to='agency'>
              Add an agency
            </ButtonLink>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            {loading}
            {alert}
          </Col>
        </Row>
        <Row>
          <Col>
            <Grid fluid>
              <Row ref='agencies'>
                {agencies}
              </Row>
            </Grid>
          </Col>
        </Row>
      </Grid>
    );
  }
});

module.exports = AgenciesView;
