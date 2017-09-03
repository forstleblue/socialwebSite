var $ = require('jquery');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');
var Navigation = require('react-router').Navigation;

var Breadcrumb = require('./Breadcrumb.jsx');
var PropertyInput = require('./PropertyInput.jsx');
var MarkedTextarea = require('./MarkedTextarea.jsx');
var DropZone = require('./DropZone.jsx');
var ConfirmLeave = require('./ConfirmLeave.jsx');
var ConfirmDelete = require('./ConfirmDelete.jsx');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Input = ReactBootstrap.Input;
var ButtonInput = ReactBootstrap.ButtonInput;
var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;
var Alert = ReactBootstrap.Alert;
var Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button;

var Passport = require('./lib/Passport.js');

var FundView = React.createClass({
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
      'activeTab': 1,
      'isConfirmLeaveOpen': false,
      'isConfirmDeleteOpen': false,
      'formHasChanged': false,
      'logo': null,
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
      this.getFund();
    }
  },
  getFund: function () {
    var url = 'fund/' + this.props.params.id;
    $.get(url).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.fund) {
        this.setData(data.fund);
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
  getFundLogo: function () {
    var url = 'fund/' + this.props.params.id;
    $.get(url).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.fund) {
        this.setState({
          'logo': data.fund.logo
        });
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
      'category': this.state.category,
      'title': this.state.title,
      'description': this.state.description,
      'online': this.state.online
    }
  },
  setData: function (data) {
    this.setState({
      'loading': false,
      'category': data.category,
      'title': data.title,
      'description': data.description,
      'logo': data.logo,
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
      'url': 'fund/' + this.props.params.id,
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
        }, this.transitionTo.bind(this, '/funds'));
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
  handleSelectTab: function (key, e) {
    if (key == 2 && this.isNew()) return e.preventDefault();
    this.setState({
      'activeTab': key
    });
  },
  handleMediaReload: function () {
    this.getFundLogo();
  },
  handleSubmit: function (e, data) {
    e.preventDefault();
    var url = 'fund';
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
      } else if (data.fund) {
        this.setState({
          'formHasChanged': false,
          'alert': {
            'bsStyle': 'success',
            'message': 'Fund successfully updated'
          }
        });
        this.transitionTo('/fund/' + data.fund._id);
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
  handleMediaDelete: function (id) {
    $.ajax({
      'url': 'media/' + id,
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
          'logo': null
        });
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
  render: function () {
    var links = [
      {
        'label': (
          <Glyphicon glyph='home'></Glyphicon>
        ),
        'url': '#/'
      }, {
        'label': 'FFDIF',
        'url': '#/funds'
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
    var logo;
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
      if (this.state.logo) {
        logo = (
          <Grid fluid>
            <Row>
              <Col xs={12}>
                <DropZone handleMediaReload={this.handleMediaReload} model='fund' id={this.props.params.id} ref='dropzone'>
                  <Glyphicon glyph='cloud-upload'></Glyphicon> Drop your logo here or click to <a>browse</a> for files.
                </DropZone>
              </Col>
            </Row>
            <Row>
              <Col lg={3} md={4} sm={5} xs={5} style={{'maxWidth': '288px'}}>
                <img className='logo' src={'/' + this.state.logo.path}></img>
                <Button block bsStyle='danger' onClick={this.handleMediaDelete.bind(null, this.state.logo._id)}>Delete</Button>
              </Col>
              <Col lg={9} md={8} sm={7} xs={7}>
                <p><strong>Publication rules :</strong></p>
                <ul className='bullets'>
                  <li>The image resolution should be <strong>258&nbsp;x&nbsp;194</strong>&nbsp;pixels minimum.</li>
                  <li>The image format should be PNG.</li>
                </ul>
              </Col>
            </Row>
          </Grid>
        );
      } else {
        logo = (
          <Grid fluid>
            <Row>
              <Col xs={12}>
                <DropZone handleMediaReload={this.handleMediaReload} model='fund' id={this.props.params.id} ref='dropzone'>
                  <Glyphicon glyph='cloud-upload'></Glyphicon> Drop your logo here or click to <a>browse</a> for files.
                </DropZone>
              </Col>
            </Row>
          </Grid>
        );
      }
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
    return (
      <form onChange={this.handleChange} onSubmit={this.handleSubmit} ref='form'>
        <Grid>
          <Breadcrumb links={links}></Breadcrumb>
          {loading}
          {alert}
          <Row>
            <Col md={9} sm={8} className='formcol'>
              <Row>
                <Col md={5} sm={12} xs={12}>
                  <PropertyInput disabled={this.isLoading()} label='Category' required type='fund_category' valueLink={this.linkState('category')}></PropertyInput>
                </Col>
                <Col md={7} sm={12} xs={12}>
                  <Input disabled={this.isLoading()} label='Title' placeholder='Title' required type='text' valueLink={this.linkState('title')}></Input>
                </Col>
              </Row>
              <Tabs activeKey={this.state.activeTab} animation={false} defaultActiveKey={1} onSelect={this.handleSelectTab}>
                <Tab eventKey={1} title={<span onDragEnter={this.handleSelectTab.bind(this, 1)}>Description</span>}>
                  <MarkedTextarea disabled={this.isLoading()} placeholder='Description' rows='10' type='textarea' valueLink={this.linkState('description')}></MarkedTextarea>
                </Tab>
                <Tab disabled={this.isNew()} eventKey={2} title={<span onDragEnter={this.handleSelectTab.bind(this, 2)}>Logo</span>}>
                  {logo}
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

module.exports = FundView;
