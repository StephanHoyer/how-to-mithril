const baseUrl = document.location.pathname
let examples = []
const KEY_CODE_ESC = 27
let currentFilter = {}

function getRouteByFilter(filter) {
  return (
    (filter.tags.length ? `/tags/${filter.tags.join(',')}` : '') +
    (filter.q ? `/q/${filter.q}` : '') +
    (filter.version ? `/version/${filter.version}` : '')
  )
}

function tagView(tag, filterUpdates) {
  return m('li.tag', linkView(filterUpdates, tag))
}

function linkView(filterUpdates, children) {
  return m(
    'a',
    {
      className: filterUpdates.className || '',
      href: getRouteByFilter(Object.assign({}, currentFilter, filterUpdates)),
      oncreate: m.route.link,
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
          className: 'version',
          version: '',
        },
        currentFilter.version
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
      .indexOf(currentFilter.q) < 0
  ) {
    return false
  }
  if (
    currentFilter.version &&
    example.mithrilVersion !== currentFilter.version
  ) {
    return false
  }
  return true
}

const app = {
  oninit: async function() {
    examples = await m.request(`${baseUrl}examples.json`)
  },
  view: ({ attrs }) => {
    currentFilter = {
      tags: attrs.tags ? attrs.tags.split(',') : [],
      q: attrs.q || '',
      version: attrs.version,
    }
    return [
      currentFilterView(),
      m(
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
            ]
          )
        )
      ),
    ]
  },
}

m.route(document.body, '/', {
  '/': app,
  '/tags/:tags': app,
  '/tags/:tags/q/:q': app,
  '/tags/:tags/q/:q/version/:version': app,
  '/q/:q': app,
  '/q/:q/version/:version': app,
  '/version/:version': app,
})
