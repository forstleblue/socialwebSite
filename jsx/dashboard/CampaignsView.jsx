var $ = require('jquery');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var Navigation = require('react-router').Navigation;
var ReactRouterBootstrap = require('react-router-bootstrap');

var Breadcrumb = require('./Breadcrumb.jsx');
var GridAsyncPagination = require('./GridAsyncPagination.jsx');
var SearchHistory = require('./lib/SearchHistory.js');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Thumbnail = ReactBootstrap.Thumbnail;
var Glyphicon = ReactBootstrap.Glyphicon;
var Input = ReactBootstrap.Input;
var Alert = ReactBootstrap.Alert;
var Label = ReactBootstrap.Label;

var ButtonLink = ReactRouterBootstrap.ButtonLink;

var xhr;

var CampaignsView = React.createClass({
  mixins: [Navigation],
  getInitialState: function () {
    return {
      'loading': true,
      'campaigns': [],
      'limit': 24,
      'page': 1,
      'total': 0
    };
  },
  componentDidMount: function () {
    var value = SearchHistory.getHistory('campaigns');
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    $(input).val(value);
    this.getSearchCampaings(value);
  },
  handleSearch: function () {
    this.setState({
      'campaigns': [],
      'page': 1,
      'total': 0
    }, this.getCampaigns);
  },
  handlePage: function (page) {
    this.setState({
      'page': page
    }, this.getCampaigns);
  },
  getSearchCampaings: function(value) {
    if (value.length > 0) {
      SearchHistory.save('campaigns', value);
      this._search(value);
    }else {
      this.getCampaigns();
    }
  },
  getCampaigns: function () {
    var search = this.refs.search;
    var input = React.findDOMNode(search.refs.input);
    if ($(input).val().length > 0) {
      this.getSearchCampaings($(input).val());
    } else {
      this._seek();
    }
  },
  _seek: function () {
    if (xhr) xhr.abort();
    this.setState({
      'loading': true
    }, function () {
      xhr = $.post('campaigns/seek', {
        'limit': this.state.limit,
        'skip': (this.state.page - 1) * this.state.limit
      }).done(function (data) {
        this.setState({
          'loading': false,
          'total': data.count,
          'campaigns': data.camapaigns
        });
      }.bind(this));
    }.bind(this));
  },
  _search: function (query) {
    if (xhr) xhr.abort();
    this.setState({
      'loading': true
    }, function () {
      xhr = $.post('campaigns/search', {
        'search': query,
        'limit': this.state.limit,
        'page': (this.state.page - 1)
      }).done(function (data) {
        if (query.length > 0) {
          this.setState({
            'loading': false,
            'total': data.nbHits,
            'campaigns': data.hits
          });
        }
      }.bind(this));
    }.bind(this));
  },
  render: function () {
    var links = [
      {
        'label': (
          <Glyphicon glyph='home'></Glyphicon>
        ),
        'url': '#/'
      }, {
        'label': 'Campaigns'
      },
    ];
    var loading;
    if (this.state.loading) {
      loading = (
        <Grid fluid>
          <Alert bsStyle='info'>Loading ...</Alert>
        </Grid>
      );
    }
    var campaigns;
    if (!this.state.loading) {
      campaigns = this.state.campaigns.map(function (campaign) {
        var url = '/campaign/' + campaign._id;
        var background = {
          'backgroundImage': "url('/public/images/black.jpg')"
        };
        if (campaign.media) {
          var timestamp = new Date(campaign.media.updated_at).getTime();
          if (campaign.media.thumbnails) {
            if (campaign.media.thumbnails['thumb:250']) {
              background.backgroundImage = "url('/" + campaign.media.thumbnails['thumb:250'] + '?' + timestamp + "')";
            }
          }
          if (campaign.media.assets) {
            if (campaign.media.assets['jpg:380']) {
              background.backgroundImage = "url('/" + campaign.media.assets['jpg:380'] + '?' + timestamp + "')";
            } else if (campaign.media.assets['jpg:180']) {
              background.backgroundImage = "url('/" + campaign.media.assets['jpg:180'] + '?' + timestamp + "')";
            } else if (campaign.media.assets['jpg:890']) {
              background.backgroundImage = "url('/" + campaign.media.assets['jpg:890'] + '?' + timestamp + "')";
            } else if (campaign.media.assets['poster:480p']) {
              background.backgroundImage = "url('/" + campaign.media.assets['poster:480p'] + '?' + timestamp + "')";
            } else if (campaign.media.assets['poster:360p']) {
              background.backgroundImage = "url('/" + campaign.media.assets['poster:360p'] + '?' + timestamp + "')";
            } else if (campaign.media.assets['poster:720p']) {
              background.backgroundImage = "url('/" + campaign.media.assets['poster:720p'] + '?' + timestamp + "')";
            }
          }
        }
        var classNames = ['clickable'];
        if (!campaign.online) {
          classNames.push('offline');
        }
        var brand = '-';
        if (campaign.brand && campaign.brand.value) {
          brand = campaign.brand.value;
        }
        return (
          <Col key={campaign._id} lg={3} md={4} sm={6}>
            <Thumbnail className={classNames.join(' ')} onClick={this.transitionTo.bind(this, url)}>
              <div className='thumb' style={background}></div>
              <h4>{campaign.name}</h4>
              <h5>
                <Label bsStyle={campaign.online ? 'success' : 'danger'}>{campaign.online ? 'ON' : 'OFF'}</Label>
                <span className='brand'>{brand}</span>
              </h5>
            </Thumbnail>
          </Col>
        );
      }.bind(this));
      if (campaigns.length == 0) {
        campaigns = (
          <Grid fluid>
            <Alert bsStyle='warning'>No campaign found</Alert>
          </Grid>
        );
      } else {
        campaigns = (
          <GridAsyncPagination total={this.state.total} limit={this.state.limit} page={this.state.page} handlePage={this.handlePage}>
            {campaigns}
          </GridAsyncPagination>
        );
      }
    }
    return (
      <Grid>
        <Row className={'actions'}>
          <Col lg={6} md={4} sm={4} xs={12}>
            <Breadcrumb links={links}></Breadcrumb>
          </Col>
          <Col lg={4} md={5} sm={4} xs={7}>
            <Input addonAfter={<Glyphicon glyph='search'></Glyphicon>} onChange={this.handleSearch} placeholder='Search' ref='search' type='search'></Input>
          </Col>
          <Col lg={2} md={3} sm={4} xs={5}>
            <ButtonLink block bsStyle='success' params={{'id': 'new'}} to='campaign'>Add a campaign</ButtonLink>
          </Col>
        </Row>
        <Row className='campaigns'>
          {loading}
          {campaigns}
        </Row>
      </Grid>
    );
  }
});

module.exports = CampaignsView;
