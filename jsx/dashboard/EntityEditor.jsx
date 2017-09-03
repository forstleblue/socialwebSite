var $ = require('jquery');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');

var ConfirmLeave = require('./ConfirmLeave.jsx');
var ConfirmDelete = require('./ConfirmDelete.jsx');

var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Input = ReactBootstrap.Input;
var ButtonInput = ReactBootstrap.ButtonInput;
var Modal = ReactBootstrap.Modal;
var Alert = ReactBootstrap.Alert;
var Glyphicon = ReactBootstrap.Glyphicon;

var EntityEditor = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function () {
    return {
      'loading': false,
      'id': this.props.entity,
      'isConfirmDeleteOpen': false,
      'isConfirmLeaveOpen': false,
      'formHasChanged': false,
      'alert': {
        'bsStyle': null,
        'message': null
      }
    };
  },
  isNew: function () {
    return this.state.id === 'new';
  },
  isLoading: function () {
    return this.state.loading;
  },
  componentDidMount: function (props) {
    if (!this.isNew())
      this.getEntity();
  },
  getEntity: function () {
    $.get('entity/' + this.state.id).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else {
        this.setData(data.entity);
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
      'agency': this.props.agency,
      'location': this.state.location,
      'country': this.state.country,
      'address': this.state.address,
      'tel': this.state.tel,
      'email': this.state.email,
      'online': this.state.online
    }
  },
  setData: function (data) {
    this.setState({
      'loading': false,
      'id': data._id,
      'location': data.location,
      'country': data.country,
      'address': data.address,
      'tel': data.tel,
      'email': data.email,
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
      'url': 'entity/' + this.state.id,
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
        this.props.handleClose();
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
  handleClose: function (e) {
    e.preventDefault();
    if (this.state.formHasChanged) {
      this.setState({
        'isConfirmLeaveOpen': true,
        'confirmCallback': this.props.handleClose
      });
    } else {
      this.props.handleClose();
    }
  },
  handleSubmit: function (e, data) {
    e.preventDefault();
    var url = 'entity';
    if (!this.isNew())
      url += '/' + this.state.id;
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
      } else {
        var msg;
        if (this.isNew()) {
          msg = 'Entity successfully created';
        } else {
          msg = 'Entity successfully updated';
        }
        this.setState({
          'formHasChanged': false,
          'alert': {
            'bsStyle': 'success',
            'message': msg
          }
        }, this.setData.bind(this, data.entity));
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
  render: function () {
    var alert;
    if (this.state.alert.message) {
      alert = (
        <Alert bsStyle={this.state.alert.bsStyle} dismissAfter={10000} onDismiss={this.handleAlertDismiss}>
          <span>{this.state.alert.message}</span>
        </Alert>
      );
    }
    var cancel;
    if (this.state.formHasChanged) {
      cancel = 'Cancel';
    } else {
      cancel = 'Close';
    }
    var controls;
    if (this.isNew()) {
      controls = (
        <div>
          <ButtonInput bsStyle={'primary'} className='pull-right' type='submit'>Create</ButtonInput>
          <ButtonInput bsStyle={'link'} className='pull-right' onClick={this.handleClose} type='button'>{cancel}</ButtonInput>
        </div>
      );
    } else {
      controls = (
        <div>
          <ButtonInput bsStyle={'danger'} className='pull-left' onClick={this.handleDelete} type='button'>Delete</ButtonInput>
          <ButtonInput bsStyle={'primary'} className='pull-right' disabled={!this.state.formHasChanged} type='submit'>Update</ButtonInput>
          <ButtonInput bsStyle={'link'} className='pull-right' onClick={this.handleClose} type='button'>{cancel}</ButtonInput>
        </div>
      );
    }
    return (
      <form onChange={this.handleChange} onSubmit={this.handleSubmit} ref='form'>
        <Modal.Header>
          <span>
            <Glyphicon glyph='map-marker'></Glyphicon>
            <strong>Entity</strong>
          </span>
        </Modal.Header>
        <Modal.Body>
          {alert}
          <Row>
            <Col md={6} sm={12} xs={12}>
              <Input disabled={this.isLoading()} label='Location' placeholder='Location' required type='text' valueLink={this.linkState('location')}></Input>
              <Input disabled={this.isLoading()} label='Country' placeholder='Country' required type='text' valueLink={this.linkState('country')}></Input>
              <Input disabled={this.isLoading()} label='Tel' placeholder='Tel' type='text' valueLink={this.linkState('tel')}></Input>
              <Input disabled={this.isLoading()} label='Email' placeholder='Email' type='text' valueLink={this.linkState('email')}></Input>
            </Col>
            <Col md={6} sm={12} xs={12}>
              <Input disabled={this.isLoading()} label='Address' placeholder='Address' required rows='8' type='textarea' valueLink={this.linkState('address')}></Input>
              <label>Visibility</label>
              <Row>
                <Col xs={6}>
                  <Input checked={this.state.online} disabled={this.isLoading() || this.isNew()} label='ON' name='online' onChange={this.handlePublish.bind(this, true)} ref='online' type='radio'></Input>
                </Col>
                <Col xs={6}>
                  <Input checked={!this.state.online} disabled={this.isLoading() || this.isNew()} label='OFF' name='online' onChange={this.handlePublish.bind(this, false)} type='radio'></Input>
                </Col>
              </Row>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {controls}
        </Modal.Footer>
        <ConfirmLeave onConfirm={this.handleLeaveConfirm} onHide={this.handleCancelLeaveConfirm} show={this.state.isConfirmLeaveOpen}></ConfirmLeave>
        <ConfirmDelete onConfirm={this.handleDeleteConfirm} onHide={this.handleCancelDeleteConfirm} show={this.state.isConfirmDeleteOpen}></ConfirmDelete>
      </form>
    );
  }
});

module.exports = EntityEditor;
