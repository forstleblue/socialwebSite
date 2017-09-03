var conf = require('./../../conf.js');

var $ = require('jquery');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Navigation = require('react-router').Navigation;
var ReactRouterBootstrap = require('react-router-bootstrap');

var Breadcrumb = require('./Breadcrumb.jsx');
var GridPagination = require('./GridPagination.jsx');
var SearchHistory = require('./lib/SearchHistory.js');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Thumbnail = ReactBootstrap.Thumbnail;
var Glyphicon = ReactBootstrap.Glyphicon;
var Input = ReactBootstrap.Input;
var Alert = ReactBootstrap.Alert;
var Label = ReactBootstrap.Label;

var ButtonLink = ReactRouterBootstrap.ButtonLink;

var CelebritiesView = React.createClass({
  mixins: [Navigation],
  getInitialState: function () {
    return {
      'loading': true,
      'celebrities': []
    };
  },
  componentDidMount: function () {
    var value = SearchHistory.getHistory('celebrities');
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    $(input).val(value);
    this.getSearchCelebrities(value);
  },
  getCelebrities: function () {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      if ($(input).val().length == 0) {
        $.get('celebrities').done(function (data) {
          if ($(input).val().length == 0) {
            this.setState({
              'loading': false,
              'celebrities': data.celebrities
            });
          }
        }.bind(this));
      }
    }.bind(this));
  },
  getSearchCelebrities: function(value) {
    if (value.length > 0) {
      SearchHistory.save('celebrities', value);
      $.post('celebrities/search', {
        'search': value
      }).done(function (data) {
        if (value.length > 0) {
          this.setState({
            'loading': false,
            'celebrities': data.hits
          });
        }
      }.bind(this));
    } else {
      this.getCelebrities();
    }
  },
  handleSearch: function (e) {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      this.getSearchCelebrities($(input).val());

    }.bind(this));
  },
  render: function () {
    var links = [
      {
        'label': (
          <Glyphicon glyph='home'></Glyphicon>
        ),
        'url': '#/'
      }, {
        'label': 'Celebrities'
      },
    ];

    var loading;
    if (this.state.loading) {
      loading = (
        <Grid fluid>
          <Alert bsStyle='info'>Loading ...</Alert>
        </Grid>
      );
    }

    var celebrities;
    if (!this.state.loading) {
      celebrities = this.state.celebrities.map(function (celebrity) {
        var url = '/celebrity/' + celebrity._id;
        var classNames = ['clickable'];
        if (!celebrity.online) {
          classNames.push('offline');
        }

        return (
          <Col key={celebrity._id} lg={3} md={4} sm={6}>
            <Thumbnail className={classNames.join(' ')} onClick={this.transitionTo.bind(this, url)}>
              <h4>{celebrity.title}</h4>
              <h5>
                <Label bsStyle={celebrity.online ? 'success' : 'danger'}>{celebrity.online ? 'ON' : 'OFF'}</Label>
              </h5>
            </Thumbnail>
          </Col>
        );
      }.bind(this));

      if (celebrities.length == 0) {
        celebrities = (
          <Grid fluid>
            <Alert bsStyle='warning'>{'No celebrity found'}</Alert>
          </Grid>
        );
      } else {
        celebrities = (
          <GridPagination>
            {celebrities}
          </GridPagination>
        );
      }
    }

    return (
      <Grid>
        <Row className={'actions'}>
          <Col lg={6} md={4} sm={4} xs={12}>
            <Breadcrumb links={links}></Breadcrumb>
          </Col>
          <Col lg={4} md={5} sm={4} xs={7}>
            <Input addonAfter={<Glyphicon glyph='search'></Glyphicon>} onChange={this.handleSearch} placeholder='Search' ref='search' type='search'></Input>
          </Col>
          <Col lg={2} md={3} sm={4} xs={5}>
            <ButtonLink block bsStyle='success' params={{
              'id': 'new'
            }} to='celebrity'>
              {'Add a celebrity'}
            </ButtonLink>
          </Col>
        </Row>
        <Row className='celebrities'>
          {loading}
          {celebrities}
        </Row>
      </Grid>
    );
  }
});

module.exports = CelebritiesView;
