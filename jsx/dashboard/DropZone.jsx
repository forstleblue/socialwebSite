var _ = require('lodash');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');

var FileUploader = require('./FileUploader.jsx');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Alert = ReactBootstrap.Alert;
var Panel = ReactBootstrap.Panel;

var UploadQueue = {
  hash: {},
  addItem: function (key, value) {
    if (this.hash[key])
      return;
    if (!value.type.match(/(image|video|audio|pdf)/))
      return;
    this.hash[key] = value;
  },
  removeItem: function (key) {
    delete this.hash[key];
  },
  getItems: function () {
    return _.values(this.hash);
  }
};

var DropZone = React.createClass({
  getInitialState: function () {
    return {
      'count': 0,
      'isDragged': false,
      'alerts': []
    };
  },
  isUploading: function () {
    return UploadQueue.getItems().length > 0;
  },
  handleEnter: function (e) {
    this.setState({
      'isDragged': true
    });
  },
  handleLeave: function (e) {
    this.setState({
      'isDragged': false
    });
  },
  handleDrop: function (e) {
    e.preventDefault();
    var files = [];
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    for (var i = 0; i < files.length; i++) {
      var file = files.item(i);
      UploadQueue.addItem(file.name, file);
    }
    this.setState({
      'count': UploadQueue.getItems().length,
      'isDragged': false
    });
  },
  handleAlertDismiss: function (offset) {
    delete this.state.alerts[offset];
    this.setState({
      'alerts': this.state.alerts
    });
  },
  handleUploadedFailure: function (file, message) {
    this.state.alerts.push({
      'bsStyle': 'danger',
      'message': (
        <span>
          <strong>{message}</strong><br/><span>{file.name}</span>
        </span>
      )
    });
    this.setState({
      'alerts': this.state.alerts
    });
  },
  handleUploadedFile: function (file) {
    UploadQueue.removeItem(file.name);
    this.setState({
      'count': UploadQueue.getItems().length,
      'isDragged': false
    }, this.props.handleMediaReload);
  },
  handleClick: function () {
    React.findDOMNode(this.refs.fileInput).click();
  },
  render: function () {
    var alerts;
    if (this.state.alerts.length > 0) {
      alerts = this.state.alerts.map(function (alert, offset) {
        return (
          <Alert key={offset} bsStyle={alert.bsStyle} dismissAfter={10000} onDismiss={this.handleAlertDismiss.bind(this, offset)}>
            <span>{alert.message}</span>
          </Alert>
        )
      }.bind(this));
    }
    var queue = [];
    UploadQueue.getItems().forEach(function (file, offset) {
      queue.push(
        <Col key={file.name} lg={3} md={4} sm={6}>
          <Panel>
            <FileUploader model={this.props.model} id={this.props.id} done={this.handleUploadedFile.bind(this, file)} failure={this.handleUploadedFailure.bind(this, file)} file={file}></FileUploader>
            <h5>{file.name}</h5>
            <h6>{file.type}</h6>
          </Panel>
        </Col>
      );
    }.bind(this));
    var style;
    if (this.state.isDragged) {
      style = 'warning';
    } else {
      style = 'info';
    }
    return (
      <div>
        {alerts}
        <input style={{display: 'none' }} type='file' multiple ref='fileInput' onChange={this.handleDrop} />
        <Alert bsStyle={style} className='dropzone' onClick={this.handleClick} onDragEnter={this.handleEnter} onDragLeave={this.handleLeave} onDrop={this.handleDrop}>
          {this.props.children}
        </Alert>
        <Grid fluid>
          <Row>{queue}</Row>
        </Grid>
      </div>
    );
  }
});

module.exports = DropZone;
