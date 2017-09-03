var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button;

var ConfirmLeave = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function () {
    return (
      <Modal animation={false} closeButton={false} onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header>
          <span>
            <Glyphicon glyph='question-sign'></Glyphicon>
            <strong>Please confirm</strong>
          </span>
        </Modal.Header>
        <Modal.Body>
          <p>You have unsaved changes.</p>
          <p>If you leave before saving, your changes will be lost.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='link' onClick={this.props.onHide}>Cancel</Button>
          <Button bsStyle='danger' onClick={this.props.onConfirm}>Leave</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});

module.exports = ConfirmLeave;
