var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;

var Col = ReactBootstrap.Col;
var Pagination = ReactBootstrap.Pagination;

var GridAsyncPagination = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState: function () {
    return {
      'pages': Math.ceil(this.props.total / this.props.limit),
      'maxButtons': 5
    };
  },
  handleSelect: function (e, selectedEvent) {
    e.preventDefault();
    this.props.handlePage(selectedEvent.eventKey);
  },
  render: function () {
    var pagination;
    if (this.state.pages > 1) {
      pagination = (
        <Col xs={12} className={'pages'}>
          <Pagination activePage={this.props.page} bsSize='small' ellipsis first items={this.state.pages} last maxButtons={this.state.maxButtons} next onSelect={this.handleSelect} prev />
        </Col>
      );
    }
    return (
      <div ref='list'>
        {this.props.children}
        {pagination}
      </div>
    );
  }
});

module.exports = GridAsyncPagination;
