var Static = require('./lib/StaticProperties.js');

var $ = require('jquery');
var React = require('react/addons');
var ReactBootstrap = require('react-bootstrap');
var Navigation = require('react-router').Navigation;

var io = require('socket.io-client');

var moment = require('moment');

var Breadcrumb = require('./Breadcrumb.jsx');
var MarkedTextarea = require('./MarkedTextarea.jsx');
var PropertyInput = require('./PropertyInput.jsx');
var PropertySelectorInput = require('./PropertySelectorInput.jsx');
var DropZone = require('./DropZone.jsx');
var MediaTabs = require('./MediaTabs.jsx');
var ConfirmLeave = require('./ConfirmLeave.jsx');
var ConfirmDelete = require('./ConfirmDelete.jsx');
var Traces = require('./Traces.jsx');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Glyphicon = ReactBootstrap.Glyphicon;
var Input = ReactBootstrap.Input;
var ButtonInput = ReactBootstrap.ButtonInput;
var Tabs = ReactBootstrap.Tabs;
var Tab = ReactBootstrap.Tab;
var Badge = ReactBootstrap.Badge;
var Alert = ReactBootstrap.Alert;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

var Passport = require('./lib/Passport.js');

var CampaignView = React.createClass({
  socket: null,
  mixins: [
    Navigation, React.addons.LinkedStateMixin
  ],
  statics: {
    willTransitionTo : function (transition, params, query, callback) {
      Passport.isAuth(transition, callback);
    },
    willTransitionFrom: function (transition, component) {
      if (component.state.formHasChanged || (component.refs.dropzone && component.refs.dropzone.isUploading())) {
        transition.abort();
        component.setState({
          'isConfirmLeaveOpen': true,
          'confirmCallback': transition.retry
        });
      }
    }
  },
  getInitialState: function () {
    return {
      'loading': !this.isNew(),
      'activeTab': 1,
      'isConfirmLeaveOpen': false,
      'isConfirmDeleteOpen': false,
      'formHasChanged': false,
      'categories': [],
      'tags': [],
      'medias': [],
      'traces': [],
      'link_url': '',
      'published_at': moment().format('YYYY-MM-DD'),
      'alert': {
        'bsStyle': null,
        'message': null
      }
    };
  },
  isNew: function () {
    return this.props.params.id === 'new';
  },
  isLoading: function () {
    return this.state.loading;
  },
  componentDidMount: function () {
    this.socket = io.connect(window.location.origin);
    this.socket.on('record', this.handleNotification);
    if (!this.isNew()) {
      this.getCampaign();
    }
  },
  componentWillUnmount: function () {
    this.socket.removeListener('record', this.handleNotification);
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.params.id) {
      this.getCampaign(nextProps.params.id);
    }
  },
  getCampaign: function (id) {
    var url;
    if (id) url = 'campaign/' + id;
    else url = 'campaign/' + this.props.params.id;
    $.get(url).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.campaign) {
        this.setState({
          'loading': false,
          'name': data.campaign.name,
          'user': data.campaign.user,
          'brand': data.campaign.brand,
          'categories': data.campaign.categories,
          'kind': data.campaign.kind,
          'tags': data.campaign.tags,
          'agency': data.campaign.agency,
          'link_name': data.campaign.link_name,
          'link_url': data.campaign.link_url,
          'link_date': data.campaign.link_date ? moment(data.campaign.link_date).format('YYYY-MM-DD') : null,
          'director': data.campaign.director,
          'photographer': data.campaign.photographer,
          'territory': data.campaign.territory,
          'description': data.campaign.description,
          'content': data.campaign.content,
          'online': data.campaign.online,
          'refused': data.campaign.refused,
          'media': data.campaign.media,
          'medias': data.campaign.medias,
          'published_at': moment(data.campaign.published_at).format('YYYY-MM-DD'),
          'url': data.campaign.url
        }, function () {
          this.getCampaignTraces()
        });
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
  getCampaignMedias: function () {
    var url = 'campaign/' + this.props.params.id;
    $.get(url).done(function (data) {
      if (data.campaign) {
        this.setState({
          'media': data.campaign.media,
          'medias': data.campaign.medias
        }, function () {
          this.getCampaignTraces()
        });
      }
    }.bind(this));
  },
  getCampaignTraces: function () {
    var url = 'campaign/traces/' + this.props.params.id;
    $.get(url).done(function (data) {
      if (data.traces) {
        this.setState({
          'traces': data.traces
        });
      }
    }.bind(this));
  },
  getData: function () {
    var data = {
      'name': this.state.name,
      'brand': this.state.brand,
      'categories': this.state.categories,
      'kind': this.state.kind,
      'tags': this.state.tags,
      'agency': this.state.agency,
      'link_name': this.state.link_name,
      'link_url': this.state.link_url,
      'link_date': this.state.link_date,
      'director': this.state.director,
      'territory': this.state.territory,
      'photographer': this.state.photographer,
      'description': this.state.description,
      'content': this.state.content,
      'online': this.state.online,
      'published_at': this.state.published_at
    }
    if (Static.user.isAdmin(this.props.user)) {
      data.refused = this.state.refused;
    }
    return data;
  },
  handleNotification: function (data) {
    if (data.id == this.props.params.id) {
      if (this.isMounted) {
        this.getCampaignMedias();
      }
    }
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
      'url': 'campaign/' + this.props.params.id,
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
        this.setState({
          'formHasChanged': false
        }, this.transitionTo.bind(this, '/campaigns'));
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
  handleSubmit: function (e) {
    e.preventDefault();
    var url = 'campaign';
    if (!this.isNew()) {
      url += '/' + this.props.params.id;
    }
    this.setState({
      'loading': true
    }, function () {
      $.post(url, this.getData()).done(function (data) {
        if (data.error) {
          this.setState({
            'alert': {
              'bsStyle': 'danger',
              'message': data.error
            }
          });
        } else if (data.campaign) {
          this.setState({
            'formHasChanged': false,
            'alert': {
              'bsStyle': 'success',
              'message': 'Campaign successfully updated'
            }
          }, function () {
            if (!this.isNew()) this.getCampaignTraces();
            this.transitionTo('/campaign/' + data.campaign._id);
          });
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
    });
  },
  handleStatus: function (status) {
    this.setState({
      'status': status
    });
  },
  handlePublish: function (online) {
    this.setState({
      'online': online
    });
  },
  handleRefused: function () {
    this.setState({
      'online': false
    });
  },
  handleAlertDismiss: function () {
    this.setState({
      'alert': {
        'bsStyle': null,
        'message': null
      }
    });
  },
  handleSelectTab: function (key, e) {
    if (key == 3 && this.isNew()) return e.preventDefault();
    this.setState({
      'activeTab': key
    });
  },
  handleMediaUpdate: function () {
    $.ajax({
      'url': 'campaign/medias/' + this.props.params.id,
      'type': 'GET'
    }).done(function (data) {
      if (data.error) {
        this.setState({
          'alert': {
            'bsStyle': 'danger',
            'message': data.error
          }
        });
      } else if (data.campaign) {
        this.setState({
          'medias': data.campaign.medias
        }, function () {
          this.getCampaignTraces()
        });
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
  handleMediaReload: function () {
    this.getCampaignMedias();
  },
  handleSelectCategories: function (selection) {
    this.setState({
      'formHasChanged': true,
      'categories': selection
    });
  },
  handleSelectTags: function (selection) {
    this.setState({
      'formHasChanged': true,
      'tags': selection
    });
  },
  handleCountryChange: function (country) {
  },
  canShowPreview: function() {
    if (this.state.brand != null &&
        this.state.name != null &&
        this.state.url != null &&
        this.state.online)
      return true;
    return false;
  },
  render: function () {
    var links = [
      {
        'label': (
          <Glyphicon glyph='home'/>
        ),
        'url': '#/'
      }, {
        'label': 'Campaigns',
        'url': '#/campaigns'
      }, {
        'label': this.state.name
      }
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
    var controls;
    if (!this.isNew()) {
      var btn_delete;
      if (Static.user.isAdmin(this.props.user) || this.props.user._id == this.state.user) {
        btn_delete = (
          <ButtonInput block bsStyle='danger' onClick={this.handleDelete} type='button' value='Delete'/>
        );
      }
      var btn_media;
      if (Static.user.isSuperAdmin(this.props.user)) {
        btn_media = (
          <Col xs={12}>
            <ButtonInput block bsStyle='warning' disabled={this.isNew()} onClick={this.handleMediaUpdate} type='button' value='Update medias'/>
          </Col>
        )
      }
      var btn_view;
      /*
      if (this.canShowPreview()) {
        var url = '/work/' + this.state.url;
        btn_view = (
          <Col xs={12}>
            <ButtonInput block disabled={this.isLoading() || this.state.formHasChanged || this.isNew()} bsStyle='default' onClick={() => window.open(url, '_blank')} type='button' value='Preview'/>
          </Col>
        )
      }
      */
      controls = (
        <Row>
          <Col xs={6}>
            {btn_delete}
          </Col>
          <Col style={{'textAlign': 'right'}} xs={6}>
            <ButtonInput block bsStyle='primary' disabled={!this.state.formHasChanged} type='submit' value='Update'/>
          </Col>
          {btn_media}
          {btn_view}
        </Row>
      );
    } else {
      controls = (
        <Row>
          <Col style={{'textAlign': 'right'}} xs={6} xsPush={6}>
            <ButtonInput block bsStyle='primary' type='submit' value='Create'/>
          </Col>
        </Row>
      );
    }
    var btn_review;
    if (Static.user.isAdmin(this.props.user) && !this.isNew()) {
      btn_review = (
        <div>
          <label>Admin review</label>
          <Row>
            <Col xs={6}>
              <Input disabled={this.isLoading()} label='Refused' name='refused' checkedLink={this.linkState('refused')} onClick={this.handleRefused} type='checkbox'/>
            </Col>
          </Row>
        </div>
      );
    } else if (this.state.refused) {
      review = (
        <Alert bsStyle='danger'>
          <span>Campaign refused</span>
        </Alert>
      );
    }
    var fullform;
    if (!this.isNew()) {
      fullform = (
        <div>
          <Tabs activeKey={this.state.activeTab} animation={false} defaultActiveKey={1} onSelect={this.handleSelectTab}>
            <Tab disabled={this.isNew()} eventKey={1} title={<span onDragEnter={this.handleSelectTab.bind(this, 1)}>Upload media <Badge>{this.state.medias.length}</Badge></span>}>
              <DropZone handleMediaReload={this.handleMediaReload} model='campaign' id={this.props.params.id} ref='dropzone'>
                <Glyphicon glyph='cloud-upload'/> Drop your files here or click to <a>browse</a> for files.
              </DropZone>
              <MediaTabs handleMediaUpdate={this.handleMediaUpdate} handleMediaReload={this.handleMediaReload} model='campaign' image={true} video={true} audio={true} media={this.state.media} medias={this.state.medias} user={this.props.user}/>
            </Tab>
            <Tab eventKey={2} title={<span onDragEnter={this.handleSelectTab.bind(this, 2)}>Description</span>}>
              <MarkedTextarea disabled={this.isLoading()} placeholder='Description' rows='10' type='textarea' valueLink={this.linkState('description')}/>
            </Tab>
            <Tab eventKey={3} title={<span onDragEnter={this.handleSelectTab.bind(this, 3)}>Content</span>}>
              <MarkedTextarea disabled={this.isLoading()} placeholder='Content' rows='15' type='textarea' valueLink={this.linkState('content')}/>
            </Tab>
            <Tab disabled={this.isNew()} eventKey={4} title={<span onDragEnter={this.handleSelectTab.bind(this, 4)}>History <Badge>{this.state.traces.length}</Badge></span>}>
              <Traces traces={this.state.traces}/>
            </Tab>
          </Tabs>
          <Row>
            <Col md={12} sm={12} xs={12}>
              <PropertySelectorInput disabled={this.isLoading()} optional={true} label='Tags' type='campaign_tag' handleSelect={this.handleSelectTags} selection={this.state.tags}/>
            </Col>
            <Col md={3} sm={12} xs={12}>
              <Input disabled={this.isLoading()} label={(
                <span>
                  <span>Link name </span>
                  <OverlayTrigger placement='right' overlay={<Tooltip id='warn-optional'>Optional</Tooltip>}>
                    <Glyphicon glyph='info-sign'/>
                  </OverlayTrigger>
                </span>
              )} placeholder='Link name' type='text' valueLink={this.linkState('link_name')}/>
            </Col>
            <Col md={5} sm={12} xs={12}>
              <Input addonAfter={<Glyphicon glyph='link'/>} disabled={this.isLoading()} label={(
                <span>
                  <span>Link url </span>
                  <OverlayTrigger placement='right' overlay={<Tooltip id='warn-optional'>Optional</Tooltip>}>
                    <Glyphicon glyph='info-sign'/>
                  </OverlayTrigger>
                </span>
              )} placeholder='Link url' required={this.state.link_name} type='text' valueLink={this.linkState('link_url')}/>
            </Col>
            <Col md={4} sm={12} xs={12}>
              <Input addonAfter={<Glyphicon glyph='calendar'/>} disabled={this.isLoading()} label={(
                <span>
                  <span>Link expiry date </span>
                  <OverlayTrigger placement='right' overlay={<Tooltip id='warn-optional'>Optional</Tooltip>}>
                    <Glyphicon glyph='info-sign'/>
                  </OverlayTrigger>
                </span>
              )} required={this.state.link_url} type='date' valueLink={this.linkState('link_date')}/>
            </Col>
            <Col md={6} sm={12} xs={12}>
              <Input disabled={this.isLoading()} label={(
                <span>
                  <span>Director </span>
                  <OverlayTrigger placement='right' overlay={<Tooltip id='warn-optional'>Optional</Tooltip>}>
                    <Glyphicon glyph='info-sign'/>
                  </OverlayTrigger>
                </span>
              )} placeholder='Director' type='text' valueLink={this.linkState('director')}/>
            </Col>
            <Col md={6} sm={12} xs={12}>
              <Input disabled={this.isLoading()} label={(
                <span>
                  <span>Photography </span>
                  <OverlayTrigger placement='right' overlay={<Tooltip id='warn-optional'>Optional</Tooltip>}>
                    <Glyphicon glyph='info-sign'/>
                  </OverlayTrigger>
                </span>
              )} placeholder='Photography' type='text' valueLink={this.linkState('photographer')}/>
            </Col>
          </Row>
        </div>
      );
    }
    return (
      <form onChange={this.handleChange} onSubmit={this.handleSubmit} ref='form'>
        <Grid>
          <Breadcrumb links={links}></Breadcrumb>
          {loading}
          {alert}
          <Row>
            <Col md={9} sm={8} className='formcol'>
              <Row>
                <Col md={12} sm={12} xs={12}>
                  <PropertyInput disabled={this.isLoading()} label='Brand' required type='campaign_brand' valueLink={this.linkState('brand')}/>
                </Col>
                <Col md={12} sm={12} xs={12}>
                  <Input disabled={this.isLoading()} label={(
                    <span>
                      <span>Name </span>
                      <OverlayTrigger placement='right' overlay={<Tooltip id='warn-brand'>Don't rewrite brand name<br/>in this field</Tooltip>}>
                        <Glyphicon glyph='info-sign'/>
                      </OverlayTrigger>
                    </span>
                  )} placeholder='Name' required type='text' valueLink={this.linkState('name')}/>
                </Col>
                <Col md={12} sm={12} xs={12}>
                  <PropertySelectorInput disabled={this.isLoading()} label='Industries' required type='campaign_category' handleSelect={this.handleSelectCategories} selection={this.state.categories}/>
                </Col>
                <Col md={6} sm={12} xs={12}>
                  <PropertyInput disabled={this.isLoading()} label='Category' required type='campaign_kind' valueLink={this.linkState('kind')}/>
                </Col>
                <Col md={6} sm={12} xs={12}>
                  <PropertyInput disabled={this.isLoading()} label='Territory' required type='campaign_territory' valueLink={this.linkState('territory')}/>
                </Col>
                <Col lg={8} md={8} sm={12} xs={12}>
                  <PropertyInput disabled={this.isLoading()} label='Agency' required type='campaign_agency' valueLink={this.linkState('agency')}/>
                </Col>
                <Col lg={4} md={4} sm={6} xs={6}>
                  <Input addonAfter={<Glyphicon glyph='calendar'/>} disabled={this.isLoading()} label='Release date' required type='date' valueLink={this.linkState('published_at')}/>
                </Col>
              </Row>
              {fullform}
            </Col>
            <Col md={3} sm={4}>
              <label>Visibility</label>
              <Row>
                <Col xs={6}>
                  <Input checked={this.state.online} disabled={this.isLoading() || this.isNew() || this.state.refused} label='ON' name='online' onChange={this.handlePublish.bind(this, true)} ref='online' type='radio'/>
                </Col>
                <Col xs={6}>
                  <Input checked={!this.state.online} disabled={this.isLoading() || this.isNew() || this.state.refused} label='OFF' name='online' onChange={this.handlePublish.bind(this, false)} type='radio'/>
                </Col>
              </Row>
              {btn_review}
              {controls}
            </Col>
          </Row>
        </Grid>
        <ConfirmLeave onConfirm={this.handleLeaveConfirm} onHide={this.handleCancelLeaveConfirm} show={this.state.isConfirmLeaveOpen}/>
        <ConfirmDelete onConfirm={this.handleDeleteConfirm} onHide={this.handleCancelDeleteConfirm} show={this.state.isConfirmDeleteOpen}/>
      </form>
    );
  }
});

module.exports = CampaignView;
