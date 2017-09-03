var $ = require('jquery');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Navigation = require('react-router').Navigation;
var ReactRouterBootstrap = require('react-router-bootstrap');

var Breadcrumb = require('./Breadcrumb.jsx');
var SearchHistory = require('./lib/SearchHistory.js');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var Input = ReactBootstrap.Input;
var Panel = ReactBootstrap.Panel;
var Badge = ReactBootstrap.Badge;
var ListGroup = ReactBootstrap.ListGroup;
var ListGroupItem = ReactBootstrap.ListGroupItem;
var Alert = ReactBootstrap.Alert;

var ButtonLink = ReactRouterBootstrap.ButtonLink;

var Passport = require('./lib/Passport.js');

var FundsView = React.createClass({
  mixins: [Navigation],
  statics: {
    willTransitionTo : function (transition, params, query, callback) {
      Passport.isAdmin(transition, callback);
    }
  },
  getInitialState: function () {
    return {
      'loading': true,
      'category': null,
      'categories': [],
      'funds': []
    };
  },
  componentDidMount: function () {
    var value = SearchHistory.getHistory('funds');
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    $(input).val(value);
    this.getSearchFunds(value);
  },
  getFunds: function () {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      if ($(input).val().length == 0) {
        $.get('funds').done(function (data) {
          if ($(input).val().length == 0) {
            this.setState({
              'loading': false,
              'funds': data.funds,
              'categories': data.categories
            });
          }
        }.bind(this));
      }
    }.bind(this));
  },
  getSearchFunds: function(value) {
    if (value.length > 0) {
      SearchHistory.save('funds', value);
      $.post('funds/search', {
        'search': value
      }).done(function (data) {
        if (value.length > 0) {
          this.setState({
            'loading': false,
            'funds': data.hits
          });
        }
      }.bind(this));
    } else {
      this.getFunds();
    }
  },
  handleSearch: function (e) {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      this.getSearchFunds($(input).val());
    }.bind(this));
  },
  countCategories: function (category) {
    return _.remove(this.state.funds.map(function (fund) {
      if (category._id != fund.category._id)
        return;
      return 1;
    }.bind(this)), undefined).length;
  },
  handleCategory: function (category, e) {
    this.setState({
      'category': !category
        ? null
        : category._id
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
        'label': 'FFDIF'
      }
    ];
    var loading;
    if (this.state.loading) {
      loading = (
        <Alert bsStyle='info'>Loading ...</Alert>
      );
    }
    var funds = _.remove(this.state.funds.map(function (fund) {
      if (this.state.category != null && this.state.category != fund.category._id)
        return;
      var url = '/fund/' + fund._id;
      var classNames = 'clickable fund';
      if (!fund.online)
        classNames += ' offline';
      return (
        <Col key={fund._id} lg={4} md={6} sm={12} xs={12}>
          <Panel className={classNames} footer={fund.category ? fund.category.value : ''} onClick={this.transitionTo.bind(this, url)}>
            {fund.title}
          </Panel>
        </Col>
      );
    }.bind(this)), undefined);
    if (!this.state.loading && funds.length == 0) {
      funds = (
        <Alert bsStyle='warning'>No fund found</Alert>
      );
    } else {
      funds = (
        <Row>
          {funds}
        </Row>
      )
    }
    var categories = _.remove(this.state.categories.map(function (category) {
      return (
        <ListGroupItem active={this.state.category == category._id} key={category._id} onClick={this.handleCategory.bind(this, category)}>
          {category.value}
          <Badge>{this.countCategories(category)}</Badge>
        </ListGroupItem>
      )
    }.bind(this)), undefined);
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
            }} to='fund'>
              Add a fund
            </ButtonLink>
          </Col>
        </Row>
        <Row>
          <Col md={3} sm={4}>
            <ListGroup fill>
              <ListGroupItem active={!this.state.category} onClick={this.handleCategory.bind(this, null)}>
                All
                <Badge>{this.state.funds.length}</Badge>
              </ListGroupItem>
              {categories}
            </ListGroup>
          </Col>
          <Col md={9} sm={8}>
            {loading}
            {funds}
          </Col>
        </Row>
      </Grid>
    );
  }
});

module.exports = FundsView;
