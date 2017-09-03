var $ = require('jquery');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');
var SortableMixin = require('sortablejs/react-sortable-mixin');

var Breadcrumb = require('./Breadcrumb.jsx');
var EntityEditor = require('./EntityEditor.jsx');
var SearchHistory = require('./lib/SearchHistory.js');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Alert = ReactBootstrap.Alert;
var Input = ReactBootstrap.Input;
var Modal = ReactBootstrap.Modal;
var Panel = ReactBootstrap.Panel;
var Glyphicon = ReactBootstrap.Glyphicon;
var Button = ReactBootstrap.Button;

var EntitiesView = React.createClass({
  mixins: [
    SortableMixin
  ],
  sortableOptions: {
    'ref': 'entities',
    'model': 'entities'
  },
  getInitialState: function () {
    return {
      'loading': true,
      'entities': [],
      'EntityToEdit': 'new',
      'isEntityEditorOpen': false,
      'alert': {
        'bsStyle': null,
        'message': null
      }
    };
  },
  isLoading: function () {
    return this.state.loading;
  },
  componentDidMount: function (props) {
    this.getEntities();
  },
  getEntities: function () {
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      if ($(input).val().length == 0) {
        $.get('entities/' + this.props.agency).done(function (data) {
          if ($(input).val().length == 0) {
            this.setState({
              'loading': false,
              'entities': data.entities
            }, function () {
              this.props.handleEntityCount(this.state.entities.length);
            });
          }
        }.bind(this));
      }
    }.bind(this));
  },
  getSearchEntities: function(value) {
    if (value.length > 0) {
      SearchHistory.save('entities', value);
      $.post('entities/search', {
        'search': value,
        'agency': this.props.agency
      }).done(function (data) {
        if (value.length > 0) {
          this.setState({
            'loading': false,
            'entities': data.hits
          }, function () {
            this.props.handleEntityCount(this.state.entities.length);
          });
        }
      }.bind(this));
    } else {
      this.getEntities();
    }
  },
  handleSearch: function (e) {
    e.stopPropagation();
    this.setState({
      'loading': true
    }, function () {
      var search = this.refs.search;
      var input = React.findDOMNode(search.refs.input);
      this.getSearchEntities($(input).val());
    }.bind(this));
  },
  handleSort: function (e) {
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    if ($(input).val().length > 0) return this.setState({
      'alert': {
        'bsStyle': 'warning',
        'message': 'Numbers could not be sorted while searching'
      }
    });
    $.ajax({
      'type': 'POST',
      'url': 'entities/order',
      'processData': false,
      'contentType': 'application/json',
      'data': JSON.stringify({
        'entities': this.state.entities.map(function (entity) {
          return entity._id;
        })
      })
    });
  },
  handleNewEntity: function () {
    this.setState({
      'isEntityEditorOpen': true,
      'EntityToEdit': 'new'
    });
  },
  handleOpenEntity: function (id) {
    this.setState({
      'isEntityEditorOpen': true,
      'EntityToEdit': id
    });
  },
  handleCloseEntityEditor: function () {
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    var value = SearchHistory.getHistory('entities');
    $(input).val(value);
    this.getSearchEntities(value);
    this.setState({
      'isEntityEditorOpen': false
    }, this.getEntities);
  },
  render: function () {
    var links = [
      {'label': ''}
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
    var entities = _.remove(this.state.entities.map(function (entity) {
      var classNames = 'clickable entity';
      if (!entity.online)
        classNames += ' offline';
      return (
        <Col key={entity._id} lg={6} md={6} sm={12} xs={12}>
          <Panel className={classNames} footer={entity.address} onClick={this.handleOpenEntity.bind(this, entity._id)}>
            {entity.location + ', ' + entity.country}
          </Panel>
        </Col>
      );
    }.bind(this)), undefined);
    if (!this.state.loading && entities.length == 0) {
      entities = (
        <Col xs={12}>
          <Alert bsStyle='warning'>No entity found</Alert>
        </Col>
      );
    }
    var editor;
    if (this.props.agency && this.state.EntityToEdit) {
      editor = (
        <EntityEditor agency={this.props.agency} entity={this.state.EntityToEdit} handleClose={this.handleCloseEntityEditor}></EntityEditor>
      );
    }
    return (
      <Grid fluid>
        <Row>
          <Col className='hidden-xs' lg={6} md={4} sm={2}>
            <Breadcrumb links={links}></Breadcrumb>
          </Col>
          <Col lg={4} md={5} sm={6} xs={6}>
            <Input addonAfter={<Glyphicon glyph='search'></Glyphicon>} onChange={this.handleSearch} placeholder='Search' ref='search' type='search'></Input>
          </Col>
          <Col lg={2} md={3} sm={4} xs={6}>
            <Button block bsStyle='success' onClick={this.handleNewEntity.bind(this, 'new')}>
              Add an entity
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            {loading}
            {alert}
            <Grid fluid>
              <Row ref='entities'>
                {entities}
              </Row>
            </Grid>
          </Col>
        </Row>
        <Modal animation={false} bsSize={'large'} closeButton={false} onHide={function () {
          return false
        }} show={this.state.isEntityEditorOpen}>
          {editor}
        </Modal>
      </Grid>
    );
  }
});

module.exports = EntitiesView;
