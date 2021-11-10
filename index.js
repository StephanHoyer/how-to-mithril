const baseUrl = document.location.pathname
let examples = []
const KEY_CODE_ESC = 27
let currentFilter = {}

function parseParams(filterString = '') {
  return filterString.split('/').reduce((params, filter) => {
    const [key, value] = filter.split('=')
    params[key] = value
    return params
  }, {})
}

function getRouteByFilter(filter) {
  return (
    (filter.tags.length ? `/tags=${filter.tags.join(',')}` : '') +
    (filter.q ? `/q=${filter.q}` : '') +
    (filter.version ? `/version=${filter.version}` : '') +
    (filter.author ? `/author=${filter.author}` : '')
  )
}

function tagView(tag, filterUpdates) {
  return m('li.tag', linkView(filterUpdates, tag))
}

function linkView(filterUpdates, children) {
  return m(
    m.route.Link,
    {
      className: filterUpdates.className || '',
      href: getRouteByFilter(Object.assign({}, currentFilter, filterUpdates))
    },
    children
  )
}

function currentFilterView() {
  return [
    m('input.q[autofocus]', {
      oncreate: ({ dom }) => setTimeout(dom.focus),
      value: currentFilter.q,
      onkeydown: e => {
        if (e.keyCode === KEY_CODE_ESC) {
          currentFilter.q = ''
          m.route.set(getRouteByFilter(currentFilter))
        }
      },
      oninput: e => {
        currentFilter.q = event.target.value
        m.route.set(getRouteByFilter(currentFilter))
      },
    }),
    currentFilter.q &&
      linkView(
        {
          className: 'clear',
          q: '',
        },
        '×'
      ),
    m(
      'ul.tags.currentTags.tags',
      currentFilter.tags.map(tag =>
        tagView(tag, {
          tags: currentFilter.tags.filter(t => tag !== t),
        })
      )
    ),
    currentFilter.version &&
      linkView(
        {
          className: 'version current',
          version: '',
        },
        currentFilter.version
      ),
    currentFilter.author &&
      linkView(
        {
          className: 'author current',
          author: '',
        },
        currentFilter.author
      ),
  ]
}

function exampleTagsView(example) {
  return m(
    'ul.tags',
    example.tags.map(tag =>
      tagView(tag, {
        tags: currentFilter.tags.includes(tag)
          ? currentFilter.tags
          : currentFilter.tags.concat(tag),
      })
    )
  )
}

function versionView(example) {
  return linkView(
    {
      className: 'version',
      version: example.mithrilVersion,
    },
    example.mithrilVersion
  )
}

function versionView(example) {
  return linkView(
    {
      className: 'version',
      version: example.mithrilVersion,
    },
    example.mithrilVersion
  )
}

function authorView(example) {
  return linkView(
    {
      className: 'author',
      author: example.author,
    },
    example.author
  )
}

function matchesFilter(example) {
  if (
    currentFilter.tags.length &&
    currentFilter.tags.some(tag => !example.tags.includes(tag))
  ) {
    return false
  }
  if (
    currentFilter.q &&
    example.tags
      .concat([example.name, example.description])
      .join('')
      .toLowerCase()
      .indexOf(currentFilter.q.toLowerCase()) < 0
  ) {
    return false
  }
  if (
    currentFilter.version &&
    example.mithrilVersion !== currentFilter.version
  ) {
    return false
  }
  if (currentFilter.author && example.author !== currentFilter.author) {
    return false
  }
  return true
}

function examplesView(examples) {
  return m(
    'ul.examples',
    examples.filter(example => matchesFilter(example)).map(example =>
      m(
        'li.example',
        {
          title: example.description,
        },
        [
          m(
            'a.name',
            {
              href: example.link,
            },
            example.name
          ),
          exampleTagsView(example),
          versionView(example),
          authorView(example),
        ]
      )
    )
  )
}

function contributeView() {
  return m('.contribute', [
    'Something is missing? Add your own ',
    m('a[href=https://flems.io/mithril]', 'flems'),
    ' ',
    m(
      'a[href=https://github.com/StephanHoyer/how-to-mithril/blob/master/examples.json]',
      'here'
    ),
    '.',
  ])
}

const app = {
  oninit: async function() {
    examples = await m.request(`${baseUrl}examples.json`)
  },
  view: ({ attrs }) => {
    const params = parseParams(attrs.filter)
    currentFilter = {
      tags: params.tags ? params.tags.split(',') : [],
      q: params.q || '',
      version: params.version || '',
      author: params.author || '',
    }
    return [currentFilterView(), examplesView(examples), contributeView()]
  },
}

m.route(document.body, '/', {
  '/': app,
  '/:filter...': app,
})
