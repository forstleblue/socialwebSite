var $ = require('jquery');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');
var Navigation = require('react-router').Navigation;

var Breadcrumb = require('./Breadcrumb.jsx');
var MarkedTextarea = require('./MarkedTextarea.jsx');
var QuotesView = require('./QuotesView.jsx');
var ConfirmLeave = require('./ConfirmLeave.jsx');
var YearsView = require('./YearsView.jsx');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var ButtonInput = ReactBootstrap.ButtonInput;
var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;
var Alert = ReactBootstrap.Alert;
var Badge = ReactBootstrap.Badge;
var Glyphicon = ReactBootstrap.Glyphicon;

var Passport = require('./lib/Passport.js');

var BioView = React.createClass({
  socket: null,
  listener: null,
  mixins: [
    Navigation, React.addons.LinkedStateMixin
  ],
  statics: {
    willTransitionTo : function (transition, params, query, callback) {
      Passport.isAdmin(transition, callback);
    },
    willTransitionFrom: function (transition, component) {
      if (component.state.formHasChanged) {
        transition.abort();
        component.setState({
          'isConfirmLeaveOpen': true,
          'confirmCallback': transition.retry
        });
      }
    }
  },
  getInitialState: function () {
    return {
      'loading': true,
      'activeTab': 1,
      'quoteCount': 0,
      'isConfirmLeaveOpen': false,
      'isConfirmDeleteOpen': false,
      'formHasChanged': false,
      'alert': {
        'bsStyle': null,
        'message': null
      }
    };
  },
  isLoading: function () {
    return this.state.loading;
  },
  componentDidMount: function () {
    this.getPage();
  },
  getPage: function () {
    $.get('page/bio').done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.page) {
        this.setData(data.page);
      }
    }.bind(this)).fail(function (err) {
      this.setState({
        'alert': {
          'bsStyle': 'danger',
          'message': err.responseText
        }
      });
    }.bind(this));
  },
  getData: function () {
    return {
      'description': this.state.description,
      'content': this.state.content
    }
  },
  setData: function (data) {
    this.setState({
      'loading': false,
      'id': data._id,
      'description': data.description,
      'content': data.content
    });
  },
  handleCancelLeaveConfirm: function () {
    this.setState({
      'isConfirmLeaveOpen': false
    });
  },
  handleLeaveConfirm: function () {
    this.setState({
      'isConfirmLeaveOpen': false,
      'formHasChanged': false
    }, this.state.confirmCallback);
  },
  handleCancelDeleteConfirm: function () {
    this.setState({
      'isConfirmDeleteOpen': false
    });
  },
  handleChange: function (e) {
    if (e.target.type == 'search')
      return;
    this.setState({
      'formHasChanged': true
    });
  },
  handleSubmit: function (e, data) {
    e.preventDefault();
    this.setState({
      'loading': true
    });
    $.post('page/' + this.state.id, this.getData()).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.page) {
        this.setState({
          'formHasChanged': false,
          'alert': {
            'bsStyle': 'success',
            'message': 'Bio successfully updated'
          }
        });
      }
    }.bind(this)).fail(function (err) {
      this.setState({
        'alert': {
          'bsStyle': 'danger',
          'message': err.responseText
        }
      });
    }.bind(this)).always(function (err) {
      this.setState({
        'loading': false
      });
    }.bind(this));
  },
  handleAlertDismiss: function () {
    this.setState({
      'alert': {
        'bsStyle': null,
        'message': null
      }
    });
  },
  handleQuoteCount: function (count) {
    if (count >= 0) {
      this.setState({
        'quoteCount': count
      });
    }
  },
  handleSelectTab: function (key) {
    this.setState({
      'activeTab': key
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
        'label': 'Bio'
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
    var quotes;
    if (this.state.id) {
      quotes = (
        <QuotesView page={this.state.id} handleQuoteCount={this.handleQuoteCount} key='quotes'></QuotesView>
      );
    }
    return (
      <form onChange={this.handleChange} onSubmit={this.handleSubmit} ref='form'>
        <Grid>
          <Row>
            <Col lg={10} md={9} sm={8} xs={6}>
              <Breadcrumb links={links}></Breadcrumb>
            </Col>
            <Col lg={2} md={3} sm={4} xs={6}>
              <ButtonInput block bsStyle='primary' disabled={!this.state.formHasChanged} type='submit' value='Update'></ButtonInput>
            </Col>
          </Row>
          {loading}
          {alert}
          <Row>
            <Col xs={12}>
              <Tabs activeKey={this.state.activeTab} animation={false} defaultActiveKey={1} onSelect={this.handleSelectTab}>
                <Tab eventKey={1} title='History'>
                  <YearsView />
                </Tab>
                <Tab eventKey={2} title={<span>Quotes <Badge>{this.state.quoteCount}</Badge></span>}>
                  {quotes}
                </Tab>
                <Tab eventKey={3} title='Content short'>
                  <MarkedTextarea disabled={this.isLoading()} placeholder='Content short' rows='10' type='textarea' valueLink={this.linkState('description')}></MarkedTextarea>
                </Tab>
                <Tab eventKey={4} title='Collaborators'>
                  <MarkedTextarea disabled={this.isLoading()} placeholder='Collaborators' rows='15' type='textarea' valueLink={this.linkState('content')}></MarkedTextarea>
                </Tab>
              </Tabs>
            </Col>
          </Row>
        </Grid>
        <ConfirmLeave onConfirm={this.handleLeaveConfirm} onHide={this.handleCancelLeaveConfirm} show={this.state.isConfirmLeaveOpen}></ConfirmLeave>
      </form>
    );
  }
});

module.exports = BioView;
