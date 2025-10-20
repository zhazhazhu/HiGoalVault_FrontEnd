import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)

const marked = new Marked(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext'
    return hljs.highlight(code, { language }).value
  },
}))

// 给每个标签加上class
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens)
      return `<h${depth} class="prose-h${depth}">${text}</h${depth}>`
    },
    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens)
      return `<p class="prose-p">${text}</p>`
    },
    strong({ tokens }) {
      const text = this.parser.parseInline(tokens)
      return `<strong class="prose-strong">${text}</strong>`
    },
    em({ tokens }) {
      const text = this.parser.parseInline(tokens)
      return `<em class="prose-em">${text}</em>`
    },
    codespan({ text }) {
      return `<code class="prose-code">${text}</code>`
    },
    blockquote({ tokens }) {
      const body = this.parser.parse(tokens)
      return `<blockquote class="prose-blockquote">${body}</blockquote>`
    },
    list(token) {
      const type = token.ordered ? 'ol' : 'ul'
      const startAttr = token.ordered && token.start !== 1 ? ` start="${token.start}"` : ''
      // 遍历每个列表项，手动构建 HTML
      let body = ''
      for (const item of token.items) {
        const itemContent = this.parser.parse(item.tokens)
        body += `<li class="prose-li">${itemContent}</li>`
      }
      return `<${type} class="prose-${type}"${startAttr}>${body}</${type}>`
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens)
      const titleAttr = title ? ` title="${title}"` : ''
      return `<a class="prose-a" href="${href}"${titleAttr}>${text}</a>`
    },
    image({ href, title, text }) {
      const titleAttr = title ? ` title="${title}"` : ''
      return `<img class="prose-img" src="${href}" alt="${text}"${titleAttr} />`
    },
    table(token) {
      let header = '<tr class="prose-tr">'
      for (const cell of token.header) {
        const content = this.parser.parseInline(cell.tokens)
        const align = cell.align ? ` align="${cell.align}"` : ''
        header += `<th class="prose-th"${align}>${content}</th>`
      }
      header += '</tr>'

      let body = ''
      for (const row of token.rows) {
        body += '<tr class="prose-tr">'
        for (const cell of row) {
          const content = this.parser.parseInline(cell.tokens)
          const align = cell.align ? ` align="${cell.align}"` : ''
          body += `<td class="prose-td"${align}>${content}</td>`
        }
        body += '</tr>'
      }

      return `<table class="prose-table"><thead>${header}</thead><tbody>${body}</tbody></table>`
    },
    tablecell(token) {
      const content = this.parser.parseInline(token.tokens)
      const type = token.header ? 'th' : 'td'
      const align = token.align ? ` align="${token.align}"` : ''
      return `<${type} class="prose-${type}"${align}>${content}</${type}>`
    },
    hr() {
      return '<hr class="prose-hr" />'
    },
    br() {
      return '<br class="prose-br" />'
    },
  },
})

export { marked }
