var $ = require('jquery');
var React = require('react');
var Router = require('react-router');
var ReactBootstrap = require('react-bootstrap');
var ReactRouterBootstrap = require('react-router-bootstrap');

var Confirm = require('./dashboard/Confirm.jsx');
var NotificationCenter = require('./dashboard/NotificationCenter.jsx');
var MarkdownBasics = require('./dashboard/MarkdownBasics.jsx');
var PasswordEditor = require('./dashboard/PasswordEditor.jsx');

var RouteHandler = Router.RouteHandler;
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;

var Modal = ReactBootstrap.Modal;
var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var Glyphicon = ReactBootstrap.Glyphicon;
var NavDropdown = ReactBootstrap.NavDropdown;
var MenuItem = ReactBootstrap.MenuItem;

var NavItemLink = ReactRouterBootstrap.NavItemLink;

var App = React.createClass({
  getInitialState: function () {
    return {
      'isConfirmLogoutOpen': false,
      'isPasswordEditorOpen': false,
      'user': {
        'fullname': '',
        'group': 4
      }
    };
  },
  componentDidMount: function () {
    this.getUser();
    $(document).bind('drop dragover', this.handleCancelDrop);
  },
  getUser: function (e) {
    $.get('me').done(function (data) {
      this.setState({
        'user': data.user
      });
    }.bind(this)).fail(function (err) {
      window.location.href = '/admin/login';
    }.bind(this));
  },
  handleCancelDrop: function (e) {
    e.preventDefault();
  },
  handleLogout: function (e) {
    e.preventDefault();
    this.setState({
      'isConfirmLogoutOpen': true
    });
  },
  handleCancelLogoutConfirm: function () {
    this.setState({
      'isConfirmLogoutOpen': false
    });
  },
  handleLogoutConfirm: function () {
    window.location.href = '/logout';
  },
  handleChangePassword: function () {
    this.setState({
      'isPasswordEditorOpen': true
    });
  },
  handleClosePasswordEditor: function () {
    this.setState({
      'isPasswordEditorOpen': false
    });
  },
  handleMarkdownBasics: function () {
    this.setState({
      'isMarkdownBasicsOpen': true
    });
  },
  handleCloseMarkdownBasics: function () {
    this.setState({
      'isMarkdownBasicsOpen': false
    });
  },
  render: function () {
    var editor;
    if (this.state.user._id) {
      editor = (
        <PasswordEditor handleClose={this.handleClosePasswordEditor} user={this.state.user}></PasswordEditor>
      );
    }
    return (
      <div>
        <Navbar brand={<span className='icon-logo-ff'></span>} inverse staticTop toggleNavKey={0}>
          <Nav eventKey={0} right>
            <NavItemLink to='/'>
              <Glyphicon glyph='home'></Glyphicon>
              Dashboard
            </NavItemLink>
            <NotificationCenter></NotificationCenter>
            <NavDropdown id='user-dropdown' navItem={true} title={<span><Glyphicon glyph='user'></Glyphicon> {this.state.user.fullname}</span>}>
              <NavItem onClick={this.handleChangePassword}>
                <Glyphicon glyph='lock'></Glyphicon>
                Change my password
              </NavItem>
              <MenuItem divider />
              <MenuItem header>How to</MenuItem>
              <NavItem onClick={this.handleMarkdownBasics}>
                <Glyphicon glyph='info-sign'></Glyphicon>
                Markdown Basics
              </NavItem>
              <MenuItem divider />
              <NavItem onClick={this.handleLogout}>
                <Glyphicon glyph='off'></Glyphicon>
                Logout
              </NavItem>
            </NavDropdown>
          </Nav>
        </Navbar>
        <RouteHandler user={this.state.user}></RouteHandler>
        <Confirm onConfirm={this.handleLogoutConfirm} onHide={this.handleCancelLogoutConfirm} show={this.state.isConfirmLogoutOpen}></Confirm>
        <Modal animation={false} closeButton={false} onHide={function () {
          return false
        }} show={this.state.isPasswordEditorOpen}>
          {editor}
        </Modal>
        <MarkdownBasics onHide={this.handleCloseMarkdownBasics} show={this.state.isMarkdownBasicsOpen}></MarkdownBasics>
      </div>
    );
  }
});

if (window.location.pathname != '/admin/dashboard/') {
  window.location.href = '/admin/dashboard/' + window.location.hash;
} else {
  var routes = [
    <Route handler={App} path={'/admin/dashboard/'}>
      <Route handler={require('./dashboard/DashboardView.jsx')} name='dashboard' path='/'></Route>
      <Route handler={require('./dashboard/SlidesView.jsx')} name='slides' path='/cases'></Route>
      <Route handler={require('./dashboard/SlideView.jsx')} name='slide' path='/case/:id'></Route>
      <Route handler={require('./dashboard/CampaignsView.jsx')} name='campaigns' path='/campaigns'></Route>
      <Route handler={require('./dashboard/CampaignView.jsx')} name='campaign' path='/campaign/:id'></Route>
      <Route handler={require('./dashboard/UsersView.jsx')} name='users' path='/users'></Route>
      <Route handler={require('./dashboard/UserView.jsx')} name='user' path='/user/:id'></Route>
      <Route handler={require('./dashboard/JobsView.jsx')} name='jobs' path='/jobs'></Route>
      <Route handler={require('./dashboard/JobView.jsx')} name='job' path='/job/:id'></Route>
      <Route handler={require('./dashboard/PropertiesView.jsx')} name='properties' path='/properties'></Route>
      <Route handler={require('./dashboard/PropertiesView.jsx')} name='properties-type' path='/properties/:type'></Route>
      <Route handler={require('./dashboard/PropertyView.jsx')} name='property' path='/property/:id'></Route>
      <Route handler={require('./dashboard/PropertyView.jsx')} name='property-type' path='/property/:id/:type'></Route>
      <Route handler={require('./dashboard/NumbersView.jsx')} name='numbers' path='/numbers'></Route>
      <Route handler={require('./dashboard/NumberView.jsx')} name='number' path='/number/:id'></Route>
      <Route handler={require('./dashboard/ExpertisesView.jsx')} name='expertise' path='/expertise'></Route>
      <Route handler={require('./dashboard/ServiceView.jsx')} name='unit' path='/unit/:id'></Route>
      <Route handler={require('./dashboard/AwardsView.jsx')} name='awards' path='/awards'></Route>
      <Route handler={require('./dashboard/AwardView.jsx')} name='award' path='/award/:id'></Route>
      <Route handler={require('./dashboard/FundsView.jsx')} name='funds' path='/funds'></Route>
      <Route handler={require('./dashboard/FundView.jsx')} name='fund' path='/fund/:id'></Route>
      <Route handler={require('./dashboard/PublicationsView.jsx')} name='publications' path='/publications'></Route>
      <Route handler={require('./dashboard/PublicationView.jsx')} name='publication' path='/publication/:id'></Route>
      <Route handler={require('./dashboard/BioView.jsx')} name='bio' path='/bio'></Route>
      <Route handler={require('./dashboard/YearView.jsx')} name='year' path='/year/:id'></Route>
      <Route handler={require('./dashboard/AgenciesView.jsx')} name='agencies' path='/agencies'></Route>
      <Route handler={require('./dashboard/AgencyView.jsx')} name='agency' path='/agency/:id'></Route>
      <Route handler={require('./dashboard/PicturesView.jsx')} name='pictures' path='/pictures'></Route>
      <Route handler={require('./dashboard/PictureView.jsx')} name='picture' path='/picture/:id'></Route>
      <Route handler={require('./dashboard/DiversityView.jsx')} name='diversity' path='/diversity'></Route>
      <Route handler={require('./dashboard/CelebritiesView.jsx')} name='celebrities' path='/celebrities'></Route>
      <Route handler={require('./dashboard/CelebrityView.jsx')} name='celebrity' path='/celebrity/:id'></Route>
    </Route>,
    <Route handler={require('./dashboard/UnauthorizedView.jsx')} name='401' path='/401'></Route>,
    <NotFoundRoute handler={require('./dashboard/NotFoundView.jsx')} name='404'></NotFoundRoute>
  ];

  Router.run(routes, function (Handler) {
    React.render(<Handler/>, $('.content').get(0));
  });
}
