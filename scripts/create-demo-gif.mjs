import { mkdirSync, writeFileSync } from 'node:fs'

const width = 320
const height = 180
const frameCount = 6
const values = [28, 82, 45, 68, 18, 91, 55, 36, 74, 24, 62, 42, 88, 31, 70, 50, 96, 20, 58, 39, 77, 33, 86, 47]

const palette = new Uint8Array(256 * 3)
const colors = [[8, 8, 8], [243, 241, 238], [42, 42, 42], [239, 45, 30], [100, 214, 135], [255, 142, 54]]
colors.forEach(([r, g, b], index) => { palette[index * 3] = r; palette[index * 3 + 1] = g; palette[index * 3 + 2] = b })

function textBytes(value) { return [...value].map((character) => character.charCodeAt(0)) }
function le16(value) { return [value & 255, (value >> 8) & 255] }

function drawFrame(frame) {
  const pixels = new Uint8Array(width * height)
  const set = (x, y, color) => { if (x >= 0 && x < width && y >= 0 && y < height) pixels[y * width + x] = color }
  const fill = (x, y, w, h, color) => { for (let py = y; py < y + h; py += 1) for (let px = x; px < x + w; px += 1) set(px, py, color) }
  for (let y = 28; y < height - 30; y += 34) for (let x = 18; x < width - 18; x += 34) { set(x, y, 2); if (x + 1 < width) set(x + 1, y, 2) }
  const gap = 3
  const barWidth = Math.floor((width - 36 - gap * (values.length - 1)) / values.length)
  const completed = Math.max(0, frame - 3) * 4
  const active = Math.min(values.length - 1, frame * 3)
  values.forEach((value, index) => {
    const x = 18 + index * (barWidth + gap)
    const barHeight = Math.floor(value * 1.2)
    const y = height - 30 - barHeight
    const color = index < completed ? 4 : index === active ? 3 : 1
    fill(x, y, barWidth, barHeight, color)
  })
  fill(18, height - 29, width - 36, 2, 2)
  return pixels
}

function encodeImageData(pixels) {
  const codes = []
  for (const pixel of pixels) { codes.push(256, pixel) }
  codes.push(257)
  const bytes = []
  let buffer = 0
  let bits = 0
  for (const code of codes) {
    buffer |= code << bits
    bits += 9
    while (bits >= 8) { bytes.push(buffer & 255); buffer >>= 8; bits -= 8 }
  }
  if (bits > 0) bytes.push(buffer & 255)
  const output = [8]
  for (let index = 0; index < bytes.length; index += 255) {
    const block = bytes.slice(index, index + 255)
    output.push(block.length, ...block)
  }
  output.push(0)
  return output
}

const output = [...textBytes('GIF89a'), ...le16(width), ...le16(height), 0xf7, 0, 0, ...palette]
for (let frame = 0; frame < frameCount; frame += 1) {
  output.push(0x21, 0xf9, 4, 0, 8, 0, 0, 0)
  output.push(0x2c, 0, 0, 0, 0, ...le16(width), ...le16(height), 0)
  const imageData = encodeImageData(drawFrame(frame))
  for (const byte of imageData) output.push(byte)
}
output.push(0x3b)
mkdirSync('public', { recursive: true })
writeFileSync('public/sort-with-sound-demo.gif', Buffer.from(output))
