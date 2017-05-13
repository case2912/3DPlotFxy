import math from 'mathjs'
import $ from 'jquery'
import axis from './axis'
axis()
let s = 'sin(x + y*y)'
const f = {
  x: 0,
  y: 0
}
const range = {
  x1: -2,
  x2: 2,
  y1: -2,
  y2: 2
}
document.addEventListener("DOMContentLoaded", () => {
  $("#range-x1").val(range.x1)
  console.log(document)
  $("#range-x2").val(range.x2)
  $("#range-y1").val(range.y1)
  $("#range-y2").val(range.y2)
})
const node = math.parse(s)
const code = node.compile()

const WIDTH_SEGMENT = 100
const HEIGHT_SEGMENT = 100
const positions = new Float32Array((WIDTH_SEGMENT) * (HEIGHT_SEGMENT) * 3)
const GeometryFactory = gr.lib.fundamental.Geometry.GeometryFactory
const Geometry = gr.lib.fundamental.Geometry.Geometry
const normalize = (a, b, value, direction) => math.abs(b - a) * (value / (direction - 1) - 1 / 2)
GeometryFactory.addType("custom", {}, (gl) => {
  const geometry = new Geometry(gl)
  let k = 0
  for (let j = 0; j < HEIGHT_SEGMENT; j++) {
    for (let i = 0; i < WIDTH_SEGMENT; i++) {
      f.x = normalize(range.x1, range.x2, i, WIDTH_SEGMENT)
      f.y = normalize(range.y1, range.y2, j, HEIGHT_SEGMENT)
      positions[k * 3] = f.x
      positions[k * 3 + 1] = f.y
      positions[k * 3 + 2] = code.eval(f)
      k++
    }
  }
  const indices = new Uint16Array(WIDTH_SEGMENT * HEIGHT_SEGMENT * 4)
  k = 0
  for (let row = 0; row < HEIGHT_SEGMENT; row++) {
    for (let col = 0; col < WIDTH_SEGMENT - 1; col++) {
      indices[k] = row * WIDTH_SEGMENT + col
      indices[k + 1] = row * WIDTH_SEGMENT + col + 1
      k += 2
    }
  }
  for (let row = 0; row < HEIGHT_SEGMENT - 1; row++) {
    for (let col = 0; col < WIDTH_SEGMENT; col++) {
      indices[k] = row * WIDTH_SEGMENT + col
      indices[k + 1] = (row + 1) * WIDTH_SEGMENT + col
      k += 2
    }
  }

  geometry.addAttributes(positions, {
    POSITION: {
      size: 3
    }
  })
  geometry.addIndex("default", indices, WebGLRenderingContext.LINES)
  return geometry
})


gr(() => {
  const GeometryRegistory = gr("#main")("goml").first().companion.get("GeometryRegistory")
  const geometry = GeometryRegistory.getGeometry("geo");
  $('#f-input').change(() => {
    s = $('#f-input').val()
    updateGeometry(geometry)
  })
  $('#scale').change(() => {
    gr("#main")(".graph").setAttribute("scale", $('#scale').val())
  })
  $("#range-x1").change(() => {
    range.x1 = $('#range-x1').val()
  })
  $("#range-x2").change(() => {
    range.x2 = $('#range-x2').val()
  })
  $("#range-y1").change(() => {
    range.y1 = $('#range-y1').val()
  })
  $("#range-y2").change(() => {
    range.y2 = $('#range-y2').val()
  })
})
const updateGeometry = (geometry) => {
  let node
  try {
    node = math.parse(s)
  } catch (e) {
    return
  }
  if (node.filter((n) => n.isSymbolNode && !(n.name == 'x' || n.name == 'y')).length > 0) return
  let l = 0
  for (let j = 0; j < HEIGHT_SEGMENT; j++) {
    for (let i = 0; i < WIDTH_SEGMENT; i++) {
      f.x = normalize(range.x1, range.x2, i, WIDTH_SEGMENT)
      f.y = normalize(range.y1, range.y2, j, HEIGHT_SEGMENT)
      positions[l * 3] = f.x
      positions[l * 3 + 1] = f.y
      positions[l * 3 + 2] = node.compile().eval(f)
      l++
    }
  }
  geometry.then(v => {
    const buffer = v.buffers[v.accessors["POSITION"].bufferIndex]
    buffer.update(positions)
  })
}