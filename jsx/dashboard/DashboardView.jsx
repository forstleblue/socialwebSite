var Static = require('./lib/StaticProperties.js');
var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Grid = ReactBootstrap.Grid;
var Row = ReactBootstrap.Row;
var Col = ReactBootstrap.Col;
var Panel = ReactBootstrap.Panel;

var ButtonLink = ReactRouterBootstrap.ButtonLink;

var DashboardView = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function () {
    var modules = [
      <Col lg={2} md={3} sm={4} xs={6} key='campaigns'>
        <Panel className='section' footer={<ButtonLink block bsStyle='default' to='campaigns'>Campaigns</ButtonLink>}>
          <i className='fa fa-file-o'></i>
        </Panel>
      </Col>
    ];
    if (Static.user.isAdmin(this.props.user)) {
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='slides'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='slides'>Cases</ButtonLink>}>
            <i className='fa fa-youtube-play'></i>
          </Panel>
        </Col>
      );
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='numbers'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='numbers'>Numbers</ButtonLink>}>
            <i className='fa fa-calculator'></i>
          </Panel>
        </Col>
      );
      {/* modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='expertise'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='expertise'>Expertise</ButtonLink>}>
            <i className='fa fa-cubes'></i>
          </Panel>
        </Col>
      ); */}
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='pictures'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='pictures'>Moments</ButtonLink>}>
            <i className='fa fa-camera'></i>
          </Panel>
        </Col>
      );
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='awards'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='awards'>Awards</ButtonLink>}>
            <i className='fa fa-trophy'></i>
          </Panel>
        </Col>
      );
       {/* modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='funds'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='funds'>FFDIF</ButtonLink>}>
            <i className='fa fa-euro'></i>
          </Panel>
        </Col>
      ); */}
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='publications'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='publications'>Publications</ButtonLink>}>
            <i className='fa fa-newspaper-o'></i>
          </Panel>
        </Col>
      );
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='bio'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='bio'>Bio</ButtonLink>}>
            <i className='fa fa-user'></i>
          </Panel>
        </Col>
      );
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='diversity'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='diversity'>Diversity</ButtonLink>}>
            <i className='fa fa-adjust'></i>
          </Panel>
        </Col>
      );

      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='celebrities'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='celebrities'>Celebrities</ButtonLink>}>
            <i className='fa fa-star'></i>
          </Panel>
        </Col>
      );

    }
    if (Static.user.isAdmin(this.props.user) || Static.user.isManager(this.props.user)) {
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='jobs'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='jobs'>Jobs</ButtonLink>}>
            <i className='fa fa-briefcase'></i>
          </Panel>
        </Col>
      );
    }
    if (Static.user.isAdmin(this.props.user)) {
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='agencies'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='agencies'>Agencies</ButtonLink>}>
            <i className='fa fa-building'></i>
          </Panel>
        </Col>
      );
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='properties'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='properties'>Properties</ButtonLink>}>
            <i className='fa fa-cogs'></i>
          </Panel>
        </Col>
      );
    }
    if (Static.user.isAdmin(this.props.user) || Static.user.isManager(this.props.user)) {
      modules.push(
        <Col lg={2} md={3} sm={4} xs={6} key='users'>
          <Panel className='section' footer={<ButtonLink block bsStyle='default' to='users'>Users & Groups</ButtonLink>}>
            <i className='fa fa-users'></i>
          </Panel>
        </Col>
      );
    }
    return (
      <Grid className='wrapper'>
        <Row>
          {modules}
        </Row>
      </Grid>
    );
  }
});

module.exports = DashboardView;
