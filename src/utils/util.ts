/**
 * 获取字符串的宽度
 * @text   将要被提取的原字符串
 * @fontSize  字符串显示时的字符大小，支持>=12
 * @fontWeight  字符串显示时的字符粗细
 */
export const getTextWidth = (text: string, fontSize: number, fontWeight = 400) => {
  const span = document.createElement('span') as HTMLSpanElement
  span.style.visibility = 'hidden'
  span.style.padding = '0'
  span.style.whiteSpace = 'nowrap'
  span.style.overflow = 'visible'
  span.style.fontSize = fontSize > 12 ? fontSize + 'px' : '12px'
  span.style.fontWeight = fontWeight.toString()
  span.innerText = text
  document.body.appendChild(span)
  const width = span.offsetWidth
  document.body.removeChild(span)
  return width
}
