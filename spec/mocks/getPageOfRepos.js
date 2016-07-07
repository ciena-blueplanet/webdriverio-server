module.exports = [
  {
    'id': '4243533400',
    'type': 'DeleteEvent',
    'actor': {
      'id': 11398549,
      'login': 'pastorsj',
      'display_login': 'pastorsj',
      'gravatar_id': '',
      'url': 'https://api.github.com/users/pastorsj',
      'avatar_url': 'https://avatars.githubusercontent.com/u/11398549?'
    },
    'repo': {
      'id': 61072418,
      'name': 'pastorsj/webdriverio-server',
      'url': 'https://api.github.com/repos/pastorsj/webdriverio-server'
    },
    'payload': {
      'ref': 'webdriverio-app',
      'ref_type': 'branch',
      'pusher_type': 'user'
    },
    'public': true,
    'created_at': '2016-07-06T23:31:02Z'
  },
  {
    'id': '4243420946',
    'type': 'PushEvent',
    'actor': {
      'id': 11398549,
      'login': 'pastorsj',
      'display_login': 'pastorsj',
      'gravatar_id': '',
      'url': 'https://api.github.com/users/pastorsj',
      'avatar_url': 'https://avatars.githubusercontent.com/u/11398549?'
    },
    'repo': {
      'id': 61072418,
      'name': 'pastorsj/webdriverio-server',
      'url': 'https://api.github.com/repos/pastorsj/webdriverio-server'
    },
    'payload': {
      'push_id': 1191738540,
      'size': 1,
      'distinct_size': 1,
      'ref': 'refs/heads/github-auth',
      'head': '24f36f64a33398d5b2f819c533e11b50acd12096',
      'before': '10fd4b998d9b316e5082eda0388ed984c073ad06',
      'commits': [
        {
          'sha': '24f36f64a33398d5b2f819c533e11b50acd12096',
          'author': {
            'email': 'pastorsj@rose-hulman.edu',
            'name': 'Sam Pastoriza'
          },
          'message': 'Continued testing front end, one test remains to be fixed',
          'distinct': true,
          'url': 'https://api.github.com/repos/pastorsj/webdriverio-server/commits/24f36f64a33398d5b2f819c533e11b50acd12096'
        }
      ]
    },
    'public': true,
    'created_at': '2016-07-06T22:58:26Z'
  },
  {
    'id': '4235774286',
    'type': 'PullRequestEvent',
    'actor': {
      'id': 11398549,
      'login': 'pastorsj',
      'display_login': 'pastorsj',
      'gravatar_id': '',
      'url': 'https://api.github.com/users/pastorsj',
      'avatar_url': 'https://avatars.githubusercontent.com/u/11398549?'
    },
    'repo': {
      'id': 33571015,
      'name': 'ciena-blueplanet/webdriverio-server',
      'url': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server'
    },
    'payload': {
      'action': 'opened',
      'number': 35,
      'pull_request': {
        'url': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/pulls/35',
        'id': 76301135,
        'number': 35,
        'state': 'open',
        'locked': false,
        'title': 'NPM Ignore Fix ',
        'user': {
          'login': 'pastorsj',
          'id': 11398549,
          'type': 'User',
          'site_admin': false
        },
        'body': '#PATCH#\r\n\r\n# CHANGELOG\r\n* Deleted /routes from npmignore\r\n* Deleted `bower install` from the prepublish script',
        'created_at': '2016-07-05T16:11:27Z',
        'updated_at': '2016-07-05T16:11:27Z',
        'closed_at': null,
        'merged_at': null,
        'merge_commit_sha': 'a986a5758ee2b9250ddd7a76f313fa6b0b4498fd',
        'assignee': null,
        'assignees': [],
        'milestone': null,
        'commits_url': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/pulls/35/commits',
        'review_comments_url': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/pulls/35/comments',
        'review_comment_url': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/pulls/comments{/number}',
        'comments_url': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/issues/35/comments',
        'statuses_url': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/statuses/b921f3612412738ab7535f68e91766e84d8932d8',
        'head': {
          'label': 'pastorsj:npm-fix',
          'ref': 'npm-fix',
          'sha': 'b921f3612412738ab7535f68e91766e84d8932d8',
          'user': {
            'login': 'pastorsj',
            'id': 11398549,
            'type': 'User',
            'site_admin': false
          },
          'repo': {
            'id': 61072418,
            'name': 'webdriverio-server',
            'full_name': 'pastorsj/webdriverio-server',
            'owner': {
              'login': 'pastorsj',
              'id': 11398549,
              'type': 'User',
              'site_admin': false
            },
            'private': false,
            'html_url': 'https://github.com/pastorsj/webdriverio-server',
            'description': 'webdriverio-server - If you want a remote server to do selenium testing, this is a better way',
            'fork': true,
            'default_branch': 'master'
          }
        },
        'base': {
          'label': 'ciena-blueplanet:master',
          'ref': 'master',
          'sha': '4e430cda1172c326c4fe01671d2516700f9ca703',
          'user': {
            'login': 'ciena-blueplanet',
            'id': 4604820,
            'avatar_url': 'https://avatars.githubusercontent.com/u/4604820?v=3',
            'gravatar_id': '',
            'url': 'https://api.github.com/users/ciena-blueplanet',
            'html_url': 'https://github.com/ciena-blueplanet',
            'followers_url': 'https://api.github.com/users/ciena-blueplanet/followers',
            'following_url': 'https://api.github.com/users/ciena-blueplanet/following{/other_user}',
            'gists_url': 'https://api.github.com/users/ciena-blueplanet/gists{/gist_id}',
            'starred_url': 'https://api.github.com/users/ciena-blueplanet/starred{/owner}{/repo}',
            'subscriptions_url': 'https://api.github.com/users/ciena-blueplanet/subscriptions',
            'organizations_url': 'https://api.github.com/users/ciena-blueplanet/orgs',
            'repos_url': 'https://api.github.com/users/ciena-blueplanet/repos',
            'events_url': 'https://api.github.com/users/ciena-blueplanet/events{/privacy}',
            'received_events_url': 'https://api.github.com/users/ciena-blueplanet/received_events',
            'type': 'Organization',
            'site_admin': false
          },
          'repo': {
            'id': 33571015,
            'name': 'webdriverio-server',
            'full_name': 'ciena-blueplanet/webdriverio-server',
            'owner': {
              'login': 'ciena-blueplanet',
              'id': 4604820,
              'type': 'Organization',
              'site_admin': false
            },
            'private': false,
            'html_url': 'https://github.com/ciena-blueplanet/webdriverio-server',
            'description': 'webdriverio-server - If you want a remote server to do selenium testing, this is a better way',
            'fork': false,
            'homepage': null,
            'size': 1777,
            'stargazers_count': 2,
            'watchers_count': 2,
            'language': 'JavaScript',
            'has_issues': true,
            'has_downloads': true,
            'has_wiki': true,
            'has_pages': false,
            'forks_count': 5,
            'mirror_url': null,
            'open_issues_count': 3,
            'forks': 5,
            'open_issues': 3,
            'watchers': 2,
            'default_branch': 'master'
          }
        },
        '_links': {
          'self': {
            'href': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/pulls/35'
          },
          'html': {
            'href': 'https://github.com/ciena-blueplanet/webdriverio-server/pull/35'
          },
          'issue': {
            'href': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/issues/35'
          },
          'comments': {
            'href': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/issues/35/comments'
          },
          'review_comments': {
            'href': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/pulls/35/comments'
          },
          'review_comment': {
            'href': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/pulls/comments{/number}'
          },
          'commits': {
            'href': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/pulls/35/commits'
          },
          'statuses': {
            'href': 'https://api.github.com/repos/ciena-blueplanet/webdriverio-server/statuses/b921f3612412738ab7535f68e91766e84d8932d8'
          }
        },
        'merged': false,
        'mergeable': true,
        'mergeable_state': 'clean',
        'merged_by': null,
        'comments': 0,
        'review_comments': 0,
        'commits': 2,
        'additions': 1,
        'deletions': 2,
        'changed_files': 2
      }
    },
    'public': true,
    'created_at': '2016-07-05T16:11:28Z',
    'org': {
      'id': 4604820,
      'login': 'ciena-blueplanet',
      'gravatar_id': '',
      'url': 'https://api.github.com/orgs/ciena-blueplanet',
      'avatar_url': 'https://avatars.githubusercontent.com/u/4604820?'
    }
  }
]
