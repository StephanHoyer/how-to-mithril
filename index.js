const baseUrl = document.location.pathname
let examples = []
const KEY_CODE_ESC = 27

function getHrefByFilter(filter) {
  return (
    (filter.tags.length ? `/tags/${filter.tags.join(',')}` : '') +
    (filter.q ? `/q/${filter.q}` : '') +
    (filter.version ? `/version/${filter.version}` : '')
  )
}

function tagView(tag, filter) {
  return m('li.tag', linkView(filter, tag))
}

function linkView({ className, tags, q, version }, children) {
  return m(
    'a',
    {
      className: className || '',
      href: getHrefByFilter({ tags, q, version }),
      oncreate: m.route.link,
    },
    children
  )
}

function currentFilterView(currentFilter) {
  return [
    m('input.q[autofocus]', {
      oncreate: ({ dom }) => setTimeout(dom.focus),
      value: currentFilter.q,
      onkeydown: e => {
        if (e.keyCode === KEY_CODE_ESC) {
          currentFilter.q = ''
          m.route.set(getHrefByFilter(currentFilter))
        }
      },
      oninput: e => {
        currentFilter.q = event.target.value
        m.route.set(getHrefByFilter(currentFilter))
      },
    }),
    currentFilter.q &&
      linkView(
        {
          className: 'clear',
          q: '',
          tags: currentFilter.tags,
        },
        '×'
      ),
    m(
      'ul.tags.currentTags.tags',
      currentFilter.tags.map(tag =>
        tagView(tag, {
          tags: currentFilter.tags.filter(t => tag !== t),
          q: currentFilter.q,
        })
      )
    ),
    currentFilter.version &&
      linkView(
        Object.assign({}, currentFilter, {
          className: 'version',
          version: '',
        }),
        currentFilter.version
      ),
  ]
}

function exampleTagsView(example, currentFilter) {
  return m(
    'ul.tags',
    example.tags.map(tag =>
      tagView(tag, {
        q: currentFilter.q,
        tags: currentFilter.tags.includes(tag)
          ? currentFilter.tags
          : currentFilter.tags.concat(tag),
      })
    )
  )
}

function versionView(example, currentFilter) {
  return linkView(
    Object.assign({}, currentFilter, {
      className: 'version',
      version: example.mithrilVersion,
    }),
    example.mithrilVersion
  )
}

function matchesFilter(example, filter) {
  if (
    filter.tags.length &&
    filter.tags.some(tag => !example.tags.includes(tag))
  ) {
    return false
  }
  if (
    filter.q &&
    example.tags
      .concat([example.name, example.description])
      .join('')
      .indexOf(filter.q) < 0
  ) {
    return false
  }
  if (filter.version && example.mithrilVersion !== filter.version) {
    return false
  }
  return true
}

const app = {
  oninit: async function() {
    examples = await m.request(`${baseUrl}examples.json`)
  },
  view: ({ attrs }) => {
    const currentFilter = {
      tags: attrs.tags ? attrs.tags.split(',') : [],
      q: attrs.q || '',
      version: attrs.version,
    }
    return [
      currentFilterView(currentFilter),
      m(
        'ul.examples',
        examples
          .filter(example => matchesFilter(example, currentFilter))
          .map(example =>
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
                exampleTagsView(example, currentFilter),
                versionView(example, currentFilter),
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
