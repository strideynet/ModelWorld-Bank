export default {
  items: [
    {
      name: 'Announcements',
      url: '/announcements',
      icon: 'cui-home'
    },
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'cui-chart'
    },
    {
      name: 'Transactions',
      url: '/transactions',
      icon: 'cui-british-pound'
    },
    {
      name: 'Wages',
      requiredScopes: ['salary'],
      url: '/wages',
      icon: 'cui-briefcase'
    },
    {
      name: 'Assets',
      url: '/assets?view=owned',
      icon: 'cui-home',
      requiredScopes: ['property'],
      children: [
        {
          name: 'My Assets',
          url: '/assets?view=owned'
        },
        {
          name: 'Assets Market',
          url: '/assets?view=all'
        }
      ]
    },
    {
      name: 'Bets',
      url: '/bets',
      icon: 'cui-note',
      requiredScopes: ['betting']
    },
    {
      name: 'Rich List',
      url: '/rich-list/personal',
      icon: 'cui-list',
      children: [
        {
          name: 'People',
          url: '/rich-list/personal'
        },
        {
          name: 'Company',
          url: '/rich-list/company'
        }
      ]
    },
    {
      name: 'Staff',
      url: '/staff',
      icon: 'cui-user'
    },
    {
      name: 'Admin',
      url: '/admin',
      icon: 'icon-list',
      requiredScopes: ['admin'],
      children: [
        {
          name: 'Accounts',
          url: '/admin/accounts'
        },
        {
          name: 'Account Types',
          url: '/admin/account-types'
        },
        {
          name: 'Bets',
          url: '/admin/bets'
        },
        {
          name: 'Economy',
          url: '/admin/economy'
        },
        {
          name: 'Properties',
          url: '/admin/properties'
        },
        {
          name: 'Wage Management',
          url: '/admin/wages'
        }
      ]
    }
  ]
}
