/**
 * 为富文本 HTML 内容中的 <img /> 和 <pre /> 标签添加内联样式。
 * @param html 原始的 HTML 字符串内容。
 * @returns 添加了内联样式的 HTML 字符串。
 */
export function injectRichTextStyles(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }

  const commonStyles = 'max-width:100%;height:auto;display:block;'

  // --- 1. 处理 <img> 标签 ---
  // 目标：为所有 <img 添加 style 属性。
  // 使用非捕获组 (?!) 来避免在 style 属性值中出现重复的 'style='
  let processedHtml = html.replace(
    /<img([^>]*?)(\/?>)/gi, // 捕获 <img、属性、以及结束的 /> 或 >
    (match, attributes, closingTag) => {
      // 简单处理：如果已存在 style 属性，追加样式；否则创建 style 属性。
      if (attributes.toLowerCase().includes('style=')) {
        return match.replace(/style=['"](.*?)['"]/i, (styleMatch, existingStyles) => {
          const finalStyles = existingStyles.trim().endsWith(';')
            ? existingStyles + commonStyles
            : `${existingStyles};${commonStyles}`
          return `style="${finalStyles}"`
        })
      }
      else {
        return `<img${attributes} style="${commonStyles}"${closingTag}`
      }
    },
  )

  // --- 2. 处理 <pre> 标签 ---
  // 目标：为所有 <pre> 标签添加 style 属性。这里只处理开始标签 <pre...>.
  processedHtml = processedHtml.replace(
    /<pre([^>]*)>/gi, // 捕获 <pre、属性、以及结束的 >
    (match, attributes) => {
      // 简单处理：如果已存在 style 属性，追加样式；否则创建 style 属性。
      if (attributes.toLowerCase().includes('style=')) {
        return match.replace(/style=['"](.*?)['"]/i, (styleMatch, existingStyles) => {
          const finalStyles = existingStyles.trim().endsWith(';')
            ? existingStyles + commonStyles
            : `${existingStyles};${commonStyles}`
          return `<pre${attributes.replace(styleMatch, `style="${finalStyles}"`)}>`
        })
      }
      else {
        return `<pre${attributes} style="${commonStyles}">`
      }
    },
  )

  return processedHtml
}
