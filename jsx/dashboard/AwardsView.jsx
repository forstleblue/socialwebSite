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

var AwardsView = React.createClass({
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
      'awards': []
    };
  },
  componentDidMount: function () {
    var value = SearchHistory.getHistory('awards');
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    $(input).val(value);
    this.getSearchAwards(value);
  },
  getAwards: function () {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      if ($(input).val().length == 0) {
        $.get('awards').done(function (data) {
          if ($(input).val().length == 0) {
            this.setState({
              'loading': false,
              'awards': data.awards,
              'categories': data.categories
            });
          }
        }.bind(this));
      }
    }.bind(this));
  },
  getSearchAwards: function(value) {
    if (value.length > 0) {
      SearchHistory.save('awards', value);
      $.post('awards/search', {
        'search': value
      }).done(function (data) {
        if (value.length > 0) {
          this.setState({
            'loading': false,
            'awards': data.hits
          });
        }
      }.bind(this));
    } else {
      this.getAwards();
    }
  },
  handleSearch: function (e) {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      this.getSearchAwards($(input).val());
    }.bind(this));
  },
  countCategories: function (category) {
    return _.remove(this.state.awards.map(function (award) {
      if (category._id != award.category._id) return;
      return 1;
    }.bind(this)), undefined).length;
  },
  handleCategory: function (category, e) {
    this.setState({
      'category': !category ? null : category._id
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
        'label': 'Awards'
      }
    ];
    var loading;
    if (this.state.loading) {
      loading = (
        <Alert bsStyle='info'>Loading ...</Alert>
      );
    }
    var awards = _.remove(this.state.awards.map(function (award) {
      if (this.state.category != null && this.state.category != award.category._id)
        return;
      var url = '/award/' + award._id;
      var classNames = 'clickable award';
      if (!award.online) {
        classNames += ' offline';
      }
      var footer = (
        <Badge pullRight># {award.position}</Badge>
      );
      if (award.category) {
        footer = (
          <span className={'badge-label'}>
            <span>{award.category ? award.category.value : ''}</span>
            <Badge pullRight># {award.position}</Badge>
          </span>
        );
      }
      return (
        <Col key={award._id} lg={4} md={6} sm={12} xs={12}>
          <Panel className={classNames} footer={footer} onClick={this.transitionTo.bind(this, url)}>
            {award.title}
          </Panel>
        </Col>
      );
    }.bind(this)), undefined);
    if (!this.state.loading && awards.length == 0) {
      awards = (
        <Alert bsStyle='warning'>No award found</Alert>
      );
    } else {
      awards = (
        <Row>
          {awards}
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
            }} to='award'>
              Add a award
            </ButtonLink>
          </Col>
        </Row>
        <Row>
          <Col md={3} sm={4}>
            <ListGroup fill>
              <ListGroupItem active={!this.state.category} onClick={this.handleCategory.bind(this, null)}>
                All
                <Badge>{this.state.awards.length}</Badge>
              </ListGroupItem>
              {categories}
            </ListGroup>
          </Col>
          <Col md={9} sm={8}>
            {loading}
            {awards}
          </Col>
        </Row>
      </Grid>
    );
  }
});

module.exports = AwardsView;
