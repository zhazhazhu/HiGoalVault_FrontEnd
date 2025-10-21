import { marked } from 'marked'
import { hljs } from './highlight'

marked.use({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
  renderer: {
    code(code: string, lang: string) {
      return `<pre class='md-pre'><p class='code-title'>${lang}</p><code class='hljs language-${lang}'>${hljs.highlight(code, { language: lang }).value}</code></pre>`
    },
    heading(text: string, level: number) {
      return `<h${level} class='md-h${level}'>${text}</h${level}>`
    },
    paragraph(text: string) {
      return `<p class='md-p'>${text}</p>`
    },
    blockquote(quote: string) {
      return `<blockquote class='md-blockquote'>${quote}</blockquote>`
    },
    link(href: string, title: string, text: string) {
      return `<a href='${href}' title='${title}' class='md-a'>${text}</a>`
    },
    image(href: string, title: string, text: string) {
      return `<img src='${href}' alt='${text}' title='${title}' class='md-img'>`
    },
    strong(text: string) {
      return `<strong class='md-strong'>${text}</strong>`
    },
    em(text: string) {
      return `<em class='md-em'>${text}</em>`
    },
    list(body: string, ordered: boolean, start: number) {
      const listType = ordered ? 'ol' : 'ul'
      const startAttr = ordered && start !== 1 ? ` start='${start}'` : ''
      return `<${listType} class='md-${listType}'${startAttr}>${body}</${listType}>`
    },
    listitem(text: string, task: boolean, checked: boolean) {
      return `<li class='md-li' ${task ? `class='md-li' ${checked ? 'checked' : ''}` : ''}>${text}</li>`
    },
    table(header, body) {
      return `<table class='md-table'><thead>${header}</thead><tbody>${body}</tbody></table>`
    },
    tablerow(content) {
      return `<tr class='md-tr'>${content}</tr>`
    },
    tablecell(content, flags) {
      const isHeader = flags.header
      const cellTag = isHeader ? 'th' : 'td'
      const cellClass = isHeader ? 'md-th' : 'md-td'
      const alignAttr = flags.align ? ` align='${flags.align}'` : ''
      return `<${cellTag} class='${cellClass}'${alignAttr}>${content}</${cellTag}>`
    },
    hr() {
      return `<hr class='md-hr'>`
    },
    br() {
      return `<br class='md-br'>`
    },
  },
})

export function renderMarkdown(text: string = '') {
  const html = marked(text)
  return html
}

export const testContent = `
# h1
## h2
### h3
#### h4
##### h5
###### h6

[link](https://github.com/yunjey/markdown-it-katex)

> blockquote

- list item 1
- list item 2
- list item 3

1. list item 1
2. list item 2
3. list item 3

\`\`\`javascript
function test() {
  console.log('hello world!');
  return true;
}
\`\`\`
`

export { marked }
