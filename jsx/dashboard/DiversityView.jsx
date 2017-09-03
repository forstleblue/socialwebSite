var Static = require('./lib/StaticProperties.js');
var $ = require('jquery');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');
var Navigation = require('react-router').Navigation;
var io = require('socket.io-client');
var moment = require('moment');
var Breadcrumb = require('./Breadcrumb.jsx');
var MarkedTextarea = require('./MarkedTextarea.jsx');
var PropertyInput = require('./PropertyInput.jsx');
var ConfirmLeave = require('./ConfirmLeave.jsx');
var Traces = require('./Traces.jsx');
var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var Input = ReactBootstrap.Input;
var ButtonInput = ReactBootstrap.ButtonInput;
var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;
var Badge = ReactBootstrap.Badge;
var Alert = ReactBootstrap.Alert;

var DiversityView = React.createClass({
  socket: null,
  mixins: [
    Navigation, React.addons.LinkedStateMixin
  ],
  statics: {
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
      'isConfirmLeaveOpen': false,
      'isConfirmDeleteOpen': false,
      'formHasChanged': false,
      'traces': [],
      'published_at': moment().format('YYYY-MM-DD'),
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
    this.socket = io.connect(window.location.origin);
    this.getDiversity();
  },
  getDiversity: function () {
    var url = 'diversity';
    $.get(url).done(function (data) {
      if (data.error) {
        this.setState({
          'loading': false,
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.diversity) {
        this.setData(data.diversity);
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
      'id': this.state.id,
      'name': this.state.name,
      'description': this.state.description,
      'online': this.state.online,
      'published_at': this.state.published_at
    }
  },
  setData: function (data) {
    this.setState({
      'loading': false,
      'id': data._id,
      'name': data.name,
      'description': data.description,
      'online': data.online,
      'published_at': moment(data.published_at).format('YYYY-MM-DD')
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
  handleChange: function () {
    this.setState({
      'formHasChanged': true
    });
  },
  handleSubmit: function (e, data) {
    e.preventDefault();
    var url = 'diversity/' + this.state.id;
    this.setState({
      'loading': true
    });
    $.post(url, this.getData()).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.diversity) {
        this.setState({
          'formHasChanged': false,
          'alert': {
            'bsStyle': 'success',
            'message': 'Diversity successfully updated'
          }
        }, function () {
          this.transitionTo('/diversity');
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
  handlePublish: function (online) {
    this.setState({
      'online': online
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
  handleSelectTab: function (key, e) {
    if (key === 2) return e.preventDefault();
    this.setState({
      'activeTab': key
    });
  },
  render: function () {
    var links = [
      {
        'label': (
          <Glyphicon glyph='home'/>
        ),
        'url': '#/'
      }, {
        'label': 'Diversity',
        'url': '#/diversity'
      }, {
        'label': this.state.name
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

    var controls = (
      <Row>
        <Col style={{'textAlign': 'right'}} xs={6}>
          <ButtonInput block bsStyle='primary' disabled={!this.state.formHasChanged} type='submit' value='Update'/>
        </Col>
      </Row>
    );

    return (
      <form onChange={this.handleChange} onSubmit={this.handleSubmit} ref='form'>
        <Grid>
          <Breadcrumb links={links}></Breadcrumb>
          {loading}
          {alert}
          <Row>
            <Col md={9} sm={8} className='formcol'>
              <Row>
                <Col md={12} sm={12} xs={12}>
                  <Input disabled={this.isLoading()} label='Title' placeholder='Title' required type='text' valueLink={this.linkState('name')}/>
                </Col>
              </Row>
              <Tabs activeKey={this.state.activeTab} animation={false} defaultActiveKey={1} onSelect={this.handleSelectTab}>
                <Tab eventKey={1} title={<span onDragEnter={this.handleSelectTab.bind(this, 1)}>Description</span>}>
                  <MarkedTextarea disabled={this.isLoading()} placeholder='Description' rows='10' type='textarea' valueLink={this.linkState('description')}/>
                </Tab>
              </Tabs>
            </Col>
            <Col md={3} sm={4}>
              <Input addonAfter={<Glyphicon glyph='calendar'/>} disabled={this.isLoading()} label='Published at' required type='date' valueLink={this.linkState('published_at')}/>
              <label>Visibility</label>
              <Row>
                <Col xs={6}>
                  <Input checked={this.state.online} disabled={this.isLoading()} label='ON' name='online' onChange={this.handlePublish.bind(this, true)} ref='online' type='radio'/>
                </Col>
                <Col xs={6}>
                  <Input checked={!this.state.online} disabled={this.isLoading()} label='OFF' name='online' onChange={this.handlePublish.bind(this, false)} type='radio'/>
                </Col>
              </Row>
              <hr/>
              {controls}
            </Col>
          </Row>
        </Grid>
        <ConfirmLeave onConfirm={this.handleLeaveConfirm} onHide={this.handleCancelLeaveConfirm} show={this.state.isConfirmLeaveOpen}/>
      </form>
    );
  }
});

module.exports = DiversityView;
