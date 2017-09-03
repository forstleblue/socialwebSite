var React = require('react');
var ReactBootstrap = require('react-bootstrap');

var ProgressBar = ReactBootstrap.ProgressBar;

var FileUploader = React.createClass({
  getInitialState: function () {
    return {
      'now': 0,
      'isActive': true
    };
  },
  componentDidMount: function () {
    var formData = new FormData();
    formData.append(this.props.model, this.props.id);
    formData.append('file', this.props.file);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 500) {
        this.props.failure(JSON.parse(xhr.responseText).error);
      }
    }.bind(this);
    xhr.upload.addEventListener('progress', function (e) {
      if (e.lengthComputable) {
        var percentage = Math.round((e.loaded * 100) / e.total);
        this.setState({
          'now': percentage
        });
      }
    }.bind(this), false);
    xhr.upload.addEventListener('load', function (e) {
      this.setState({
        'now': 100,
        'isActive': false
      });
    }.bind(this), false);
    xhr.addEventListener('load', function (e) {
      this.setState({
        'now': 100,
        'isActive': false
      }, this.props.done);
    }.bind(this), false);
    xhr.open('POST', this.props.model+'/upload');
    xhr.send(formData);
  },
  render: function () {
    return (
      <ProgressBar active={this.state.isActive} now={this.state.now}></ProgressBar>
    );
  }
});

module.exports = FileUploader;
