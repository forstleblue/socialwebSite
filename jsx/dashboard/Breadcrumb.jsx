var React = require('react');

var CampaignView = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function () {
    var links = this.props.links.map(function (link) {
      if (link.url) {
        return (
          <li key={link.url}>
            <a href={link.url}>{link.label}</a>
          </li>
        );
      } else {
        return (
          <li className="active" key='current'>{link.label}</li>
        );
      }
    });
    return (
      <ol className="breadcrumb">{links}</ol>
    );
  }
});

module.exports = CampaignView;
