import { run, html, css } from './util/run'

test('raw values are unmodifed', () => {
  let config = {
    content: [{ raw: html`<div class="bg-url-[/my/image-1-2-3.png]"></div>` }],
    plugins: [
      function ({ matchUtilities }) {
        matchUtilities(
          {
            'bg-url': (value) => {
              return {
                'background-image': `url(${value})`,
              }
            },
          },
          {
            type: 'raw',
          }
        )
      },
    ],
  }

  return run('@tailwind utilities', config).then((result) => {
    expect(result.css).toMatchFormattedCss(css`
      .bg-url-\\[\\/my\\/image-1-2-3\\.png\\] {
        background-image: url(/my/image-1-2-3.png);
      }
    `)
  })
})
