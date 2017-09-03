var $ = require('jquery');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;
var Modal = ReactBootstrap.Modal;
var Input = ReactBootstrap.Input;
var ButtonInput = ReactBootstrap.ButtonInput;
var Glyphicon = ReactBootstrap.Glyphicon;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var Button = ReactBootstrap.Button;

var LoginView = React.createClass({
  getInitialState: function () {
    return {
      'activeTab': 1,
      'loading': false,
      'shake': false
    };
  },
  isLoading: function () {
    return this.state.loading;
  },
  submit: function (e) {
    e.preventDefault();
    var data = $(React.findDOMNode(this.refs.form)).serialize();
    this.setState({
      'loading': true,
      'shake': false
    }, function () {
      var url = window.location.pathname;
      if (this.state.activeTab == 2) {
        url = 'forgot';
      }
      $.post(url, data).done(function (data) {
        if (data.status == 401 || data.error) {
          this.setState({
            'loading': false,
            'shake': true
          });
        } else {
          if (this.state.activeTab == 1) {
            window.location.href = data + window.location.hash;
          } else {
            this.setState({
              'loading': false,
              'activeTab': 1
            });
          }
        }
      }.bind(this)).fail(function (err) {
        this.setState({
          'loading': false,
          'shake': true
        });
      }.bind(this));
    })
  },
  handleSelect: function (key) {
    this.setState({
      'activeTab': key
    });
  },
  void: function () {
    // do nothing
  },
  render: function () {
    var controls;
    if (this.state.activeTab == 1) {
      controls = (
        <ButtonInput block bsStyle='primary' ref='submit' type='submit'>{'Login'}</ButtonInput>
      );
    } else {
      controls = (
        <ButtonInput block bsStyle='primary' ref='submit' type='submit'>{'Reset my password'}</ButtonInput>
      );
    }
    var classes = [];
    if (this.state.shake) classes.push('shake');
    return (
      <Modal.Dialog animation={true} backdrop={false} bsSize='small' className={classes} closeButton={false} enforceFocus={true} onHide={this.void} ref='modal' show={true}>
        <form onSubmit={this.submit} ref='form'>
          <Modal.Header>
            <span>
              <Glyphicon glyph='lock'></Glyphicon>
              <strong>User authentication</strong>
            </span>
          </Modal.Header>
          <Modal.Body>
            <ButtonGroup justified>
              <Button style={{width: '40%'}} active={this.state.activeTab == 1} onClick={this.handleSelect.bind(this, 1)}>{'Sign in'}</Button>
              <Button style={{width: '60%'}} active={this.state.activeTab == 2} onClick={this.handleSelect.bind(this, 2)}>{'Forgot Password ?'}</Button>
            </ButtonGroup>
            <Tabs activeKey={this.state.activeTab} animation={false}>
              <Tab eventKey={1}>
                <Input addonBefore={<Glyphicon glyph='user'></Glyphicon>} name='username' placeholder='Username' ref='username' disabled={this.isLoading() || this.state.activeTab == 2} required={this.state.activeTab == 1} type='text'></Input>
                <Input addonBefore={<Glyphicon glyph='lock'></Glyphicon>} name='password' placeholder='Password' ref='password' disabled={this.isLoading() || this.state.activeTab == 2} required={this.state.activeTab == 1} type='password'></Input>
              </Tab>
              <Tab eventKey={2}>
                <Input addonBefore={<Glyphicon glyph='user'></Glyphicon>} name='fusername' placeholder='Username' ref='fusername' disabled={this.isLoading() || this.state.activeTab == 1} required={this.state.activeTab == 2} type='text'></Input>
                <Input addonBefore={<Glyphicon glyph='send'></Glyphicon>} name='femail' placeholder='Email address' ref='femail' disabled={this.isLoading() || this.state.activeTab == 1} required={this.state.activeTab == 2} type='email'></Input>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            {controls}
          </Modal.Footer>
        </form>
      </Modal.Dialog>
    );
  }
});

module.exports = LoginView;
