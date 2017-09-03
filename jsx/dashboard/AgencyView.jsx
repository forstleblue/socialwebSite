var $ = require('jquery');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');
var Navigation = require('react-router').Navigation;

var Breadcrumb = require('./Breadcrumb.jsx');
var PropertyInput = require('./PropertyInput.jsx');
var MarkedTextarea = require('./MarkedTextarea.jsx');
var EntitiesView = require('./EntitiesView.jsx');
var ConfirmLeave = require('./ConfirmLeave.jsx');
var ConfirmDelete = require('./ConfirmDelete.jsx');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;
var Input = ReactBootstrap.Input;
var ButtonInput = ReactBootstrap.ButtonInput;
var Alert = ReactBootstrap.Alert;
var Badge = ReactBootstrap.Badge;
var Glyphicon = ReactBootstrap.Glyphicon;

var Passport = require('./lib/Passport.js');

var AgencyView = React.createClass({
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
      'loading': !this.isNew(),
      'entityCount': 0,
      'isConfirmLeaveOpen': false,
      'isConfirmDeleteOpen': false,
      'formHasChanged': false,
      'alert': {
        'bsStyle': null,
        'message': null
      }
    };
  },
  isNew: function () {
    return this.props.params.id === 'new';
  },
  isLoading: function () {
    return this.state.loading;
  },
  componentDidMount: function () {
    if (!this.isNew()) {
      this.getAgency();
    }
  },
  getAgency: function () {
    var url = 'agency/' + this.props.params.id;
    $.get(url).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.agency) {
        this.setData(data.agency);
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
      'title': this.state.title,
      'category': this.state.category,
      'country': this.state.country,
      'email': this.state.email,
      'website': this.state.website,
      'description': this.state.description,
      'online': this.state.online
    }
  },
  setData: function (data) {
    this.setState({
      'loading': false,
      'title': data.title,
      'category': data.category,
      'country': data.country,
      'email': data.email,
      'website': data.website,
      'description': data.description,
      'online': data.online
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
  handleDeleteConfirm: function () {
    this.setState({
      'isConfirmDeleteOpen': false
    });
    $.ajax({
      'url': 'agency/' + this.props.params.id,
      'type': 'DELETE'
    }).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.message) {
        this.setState({
          'formHasChanged': false
        }, this.transitionTo.bind(this, '/agencies'));
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
  handleDelete: function () {
    this.setState({
      'isConfirmDeleteOpen': true
    });
  },
  handleChange: function () {
    this.setState({
      'formHasChanged': true
    });
  },
  handleSubmit: function (e, data) {
    e.preventDefault();
    var url = 'agency';
    if (!this.isNew())
      url += '/' + this.props.params.id;
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
      } else if (data.agency) {
        this.setState({
          'formHasChanged': false,
          'alert': {
            'bsStyle': 'success',
            'message': 'Agency successfully updated'
          }
        });
        this.transitionTo('/agency/' + data.agency._id);
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
  handlePublish: function (online) {
    this.setState({
      'online': online
    });
  },
  handleEntityCount: function (count) {
    if (count >= 0)
      this.setState({
        'entityCount': count
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
        'label': 'Agencies',
        'url': '#/agencies'
      }, {
        'label': this.state.title
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
    var controls;
    if (!this.isNew()) {
      controls = (
        <Row>
          <Col xs={6}>
            <ButtonInput block bsStyle='danger' onClick={this.handleDelete} type='button' value='Delete'></ButtonInput>
          </Col>
          <Col style={{
            'textAlign': 'right'
          }} xs={6}>
            <ButtonInput block bsStyle='primary' disabled={!this.state.formHasChanged} type='submit' value='Update'></ButtonInput>
          </Col>
        </Row>
      );
    } else {
      controls = (
        <Row>
          <Col style={{
            'textAlign': 'right'
          }} xs={6} xsPush={6}>
            <ButtonInput block bsStyle='primary' type='submit' value='Create'></ButtonInput>
          </Col>
        </Row>
      );
    }
    var entities;
    if (!this.isNew()) {
      entities = (
        <EntitiesView agency={this.props.params.id} handleEntityCount={this.handleEntityCount} key='entities'></EntitiesView>
      )
    }
    return (
      <form onChange={this.handleChange} onSubmit={this.handleSubmit} ref='form'>
        <Grid>
          <Breadcrumb links={links}></Breadcrumb>
          {loading}
          {alert}
          <Row>
            <Col md={9} sm={8} className='formcol'>
              <Row>
                <Col md={6} sm={12} xs={12}>
                  <Input disabled={this.isLoading()} label='Title' placeholder='Title' required type='text' valueLink={this.linkState('title')}></Input>
                </Col>
                <Col md={6} sm={12} xs={12}>
                  <PropertyInput disabled={this.isLoading()} label='Category' required type='agency_category' valueLink={this.linkState('category')}></PropertyInput>
                </Col>
                <Col md={4} sm={12} xs={12}>
                  <Input disabled={this.isLoading()} label='Location' placeholder='Location' required type='text' valueLink={this.linkState('country')}></Input>
                </Col>
                <Col md={4} sm={12} xs={12}>
                  <Input disabled={this.isLoading()} label='Email' placeholder='Email' type='text' valueLink={this.linkState('email')}></Input>
                </Col>
                <Col md={4} sm={12} xs={12}>
                  <Input disabled={this.isLoading()} label='Website' placeholder='Website' type='text' valueLink={this.linkState('website')}></Input>
                </Col>
              </Row>
              <Tabs activeKey={this.state.activeTab} animation={false} defaultActiveKey={1} onSelect={this.handleSelectTab}>
                <Tab eventKey={1} title='Description'>
                  <MarkedTextarea disabled={this.isLoading()} placeholder='Description' required rows='10' type='textarea' valueLink={this.linkState('description')}></MarkedTextarea>
                </Tab>
                <Tab disabled={this.isNew()} eventKey={2} title={<span>Entities <Badge>{this.state.entityCount}</Badge></span>}>
                  {entities}
                </Tab>
              </Tabs>
            </Col>
            <Col md={3} sm={4}>
              <label>Visibility</label>
              <Row>
                <Col xs={6}>
                  <Input checked={this.state.online} disabled={this.isLoading() || this.isNew()} label='ON' name='online' onChange={this.handlePublish.bind(this, true)} ref='online' type='radio'></Input>
                </Col>
                <Col xs={6}>
                  <Input checked={!this.state.online} disabled={this.isLoading() || this.isNew()} label='OFF' name='online' onChange={this.handlePublish.bind(this, false)} type='radio'></Input>
                </Col>
              </Row>
              <hr/>
              {controls}
            </Col>
          </Row>
        </Grid>
        <ConfirmLeave onConfirm={this.handleLeaveConfirm} onHide={this.handleCancelLeaveConfirm} show={this.state.isConfirmLeaveOpen}></ConfirmLeave>
        <ConfirmDelete onConfirm={this.handleDeleteConfirm} onHide={this.handleCancelDeleteConfirm} show={this.state.isConfirmDeleteOpen}></ConfirmDelete>
      </form>
    );
  }
});

module.exports = AgencyView;
