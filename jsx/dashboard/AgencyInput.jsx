var $ = require('jquery');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');

var Input = ReactBootstrap.Input;

var AgencyInput = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function () {
    return {
      'loading': true,
      'agencies': []
    };
  },
  componentWillMount: function () {
    this.getAgencies();
  },
  getAgencies: function () {
    $.get('agencies').done(function (data) {
      var agencies = _.remove(data.agencies.map(function (agency) {
        return agency;
      }.bind(this)), undefined);
      this.setState({
        'loading': false,
        'agencies': agencies
      });
    }.bind(this));
  },
  shouldComponentUpdate: function (props, state) {
    return !state.loading;
  },
  handleChange: function (value) {
    this.props.handleCountryChange(this.getCountry(value));
    this.props.valueLink.requestChange(value);
  },
  getCountry: function (value, callback) {
    return _.result(_.find(this.state.agencies, function (agency) {
      return agency._id == value;
    }), 'country');
  },
  render: function () {
    var disabled = this.state.loading || this.props.disabled;
    var options = [
      <option key={'empty'} value={null}></option>
    ];
    this.state.agencies.map(function (agency) {
      options.push(
        <option key={agency._id} value={agency._id}>
          {agency.title}
        </option>
      );
    }.bind(this));
    var valueLink = {
      'value': this.props.valueLink.value,
      'requestChange': this.handleChange
    }
    return (
      <div className='agency-input'>
        <Input disabled={disabled} label={this.props.label} required={this.props.required} type='select' valueLink={valueLink}>
          {options}
        </Input>
      </div>
    );
  }
});

module.exports = AgencyInput;
