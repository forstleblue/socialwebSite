var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var Modal = ReactBootstrap.Modal;
var Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button;

var ConfirmDelete = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function () {
    return (
      <Modal animation={false} bsSize='small' closeButton={false} onHide={this.props.onHide} show={this.props.show}>
        <Modal.Header>
          <span>
            <Glyphicon glyph='question-sign'></Glyphicon>
            <strong>Please confirm</strong>
          </span>
        </Modal.Header>
        <Modal.Footer>
          <Button bsStyle='link' onClick={this.props.onHide}>Cancel</Button>
          <Button bsStyle='danger' onClick={this.props.onConfirm}>Delete</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});

module.exports = ConfirmDelete;
