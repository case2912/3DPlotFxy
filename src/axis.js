export default () => {
  const positions = new Float32Array(6)
  const GeometryFactory = gr.lib.fundamental.Geometry.GeometryFactory
  const Geometry = gr.lib.fundamental.Geometry.Geometry
  GeometryFactory.addType("axis", {}, (gl) => {
    const geometry = new Geometry(gl)
    positions[0] = 1
    positions[1] = 0
    positions[2] = 0
    positions[3] = -1
    positions[4] = 0
    positions[5] = 0
    const indices = new Uint16Array(2)
    indices[0] = 0
    indices[1] = 1
    geometry.addAttributes(positions, {
      POSITION: {
        size: 3
      }
    })
    geometry.addIndex("default", indices, WebGLRenderingContext.LINES)
    return geometry
  })
}