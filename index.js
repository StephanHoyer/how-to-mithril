let examples = []

function tagsView(tags) {
  return m(
    'ul.tags',
    tags.map(tag =>
      m(
        'li.tag',
        m(
          'a',
          {
            href: getTagHref(tags.filter(t => tag !== t)),
            oncreate: m.route.link,
          },
          tag
        )
      )
    )
  )
}

function getTagHref(tags) {
  return `/${tags.join(',')}`
}

const app = {
  oninit: async function() {
    examples = await m.request('/examples.json')
  },
  view: ({ attrs }) => {
    const currentTags = attrs.tags ? attrs.tags.split(',') : []
    const hasAllTags = example =>
      !currentTags.length ||
      currentTags.every(tag => example.tags.includes(tag))
    const isNotCurrentTag = tag => !currentTags.includes(tag)
    return [
      tagsView(currentTags),
      m(
        'ul',
        examples.filter(hasAllTags).map(example =>
          m(
            'li',
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
              m(
                'ul.tags',
                example.tags.filter(isNotCurrentTag).map(tag =>
                  m(
                    'li.tag',
                    m(
                      'a',
                      {
                        href: getTagHref(currentTags.concat(tag)),
                        oncreate: m.route.link,
                      },
                      tag
                    )
                  )
                )
              ),
            ]
          )
        )
      ),
    ]
  },
}

m.route(document.body, '/', {
  '/': app,
  '/:tags': app,
})
