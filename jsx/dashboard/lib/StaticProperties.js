var _ = require('lodash');

var StaticProperties = {
  'property': {
    'type': [{
      'code': 'campaign_agency',
      'group': 'campaign',
      'label': 'Campaign agency'
    }, {
      'code': 'campaign_brand',
      'group': 'campaign',
      'label': 'Campaign brand'
    }, {
      'code': 'campaign_category',
      'group': 'campaign',
      'label': 'Campaign industry'
    }, {
      'code': 'campaign_kind',
      'group': 'campaign',
      'label': 'Campaign category'
    }, {
      'code': 'campaign_tag',
      'group': 'campaign',
      'label': 'Campaign tag'
    }, {
      'code': 'campaign_territory',
      'group': 'campaign',
      'label': 'Campaign territory'
    }, {
      'code': 'slide_category',
      'group': 'case',
      'label': 'Case category'
    }, {
      'code': 'slide_city',
      'group': 'case',
      'label': 'Case city'
    }, {
      'code': 'job_category',
      'group': 'job',
      'label': 'Job category'
    }, {
      'code': 'job_contract',
      'group': 'job',
      'label': 'Job contract'
    }, {
      'code': 'job_title',
      'group': 'job',
      'label': 'Job title'
    }, {
      'code': 'number',
      'group': 'number',
      'label': 'Number label'
    }, {
      'code': 'award_category',
      'group': 'award',
      'label': 'Award category'
    }, {
      'code': 'fund_category',
      'group': 'fund',
      'label': 'Fund category'
    }, {
      'code': 'publication_channel',
      'group': 'publication',
      'label': 'Publication channel'
    }, {
      'code': 'publication_medium',
      'group': 'publication',
      'label': 'Publication medium'
    }, {
      'code': 'agency_category',
      'group': 'agency',
      'label': 'Agency category'
    }],
    getLabelForType: function (code) {
      var index = _.findIndex(StaticProperties.property.type, function (item) {
        return item.code == code;
      });
      if (index >= 0) {
        return StaticProperties.property.type[index].label;
      }
      return '';
    }
  },
  'pictures': {
    'categories': [{
      'id': 1,
      'label': 'About'
    }, {
      'id': 2,
      'label': 'Awards'
    }, {
      'id': 3,
      'label': 'Presse'
    }, {
      'id': 4,
      'label': 'Careers'
    }]
  },
  'user': {
    'group': [{
      'id': 1,
      'label': 'Superadmin',
    }, {
      'id': 2,
      'label': 'Admin',
    }, {
      'id': 3,
      'label': 'Manager',
    }, {
      'id': 4,
      'label': 'Editor',
    }],
    getLabelForGroup: function (id) {
      var index = _.findIndex(StaticProperties.user.group, function (item) {
        return item.id == id;
      });
      if (index >= 0) {
        return StaticProperties.user.group[index].label;
      }
      return '';
    },
    isSuperAdmin: function (user) {
      return user.group == 1;
    },
    isAdmin: function (user) {
      return user.group == 1 || user.group == 2;
    },
    isManager: function (user) {
      return user.group == 3;
    },
    isEditor: function (user) {
      return user.group == 4;
    }
  }
};

module.exports = StaticProperties;
