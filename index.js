const baseUrl = document.location.pathname
let examples = []

function tagView(tag, href) {
  return m(
    'li.tag',
    m(
      'a',
      {
        href,
        oncreate: m.route.link,
      },
      tag
    )
  )
}

function currentTagsView(tags) {
  return m(
    'ul.tags.currentTags',
    tags.map(tag => tagView(tag, getTagHref(tags.filter(t => tag !== t))))
  )
}

function exampleTagsView(example, currentTags) {
  return m(
    'ul.tags',
    example.tags
      .filter(tag => !currentTags.includes(tag))
      .map(tag => tagView(tag, getTagHref(currentTags.concat(tag))))
  )
}

function getTagHref(tags) {
  return `/tags/${tags.join(',')}`
}

const app = {
  oninit: async function() {
    examples = await m.request(`${baseUrl}examples.json`)
  },
  view: ({ attrs }) => {
    const currentTags = attrs.tags ? attrs.tags.split(',') : []
    const hasAllTags = example =>
      !currentTags.length ||
      currentTags.every(tag => example.tags.includes(tag))
    return [
      currentTagsView(currentTags),
      m(
        'ul.examples',
        examples.filter(hasAllTags).map(example =>
          m(
            'li.example',
            {
              title: example.description,
            },
            [
              m(
                'a',
                {
                  href: example.link,
                },
                example.name
              ),
              exampleTagsView(example, currentTags),
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
})
