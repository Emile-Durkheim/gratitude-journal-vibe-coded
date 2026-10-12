import {
  AmbientLight,
  Color,
  DirectionalLight,
  DoubleSide,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  Shape,
  ShapeGeometry,
  WebGLRenderer,
} from 'three'

const TINTS = ['#d98f9f', '#e0a96d', '#a99ad6', '#c97a8d', '#e3bd62', '#f3e3c2']
const COUNT = 90
const DURATION = 5200

/** One petal outline, base at the origin, pointing up; the same curve the drawings use. */
function petalShape(): Shape {
  const s = new Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(-0.62, 0.15, -0.58, 0.95, 0, 1.05)
  s.bezierCurveTo(0.58, 0.95, 0.62, 0.15, 0, 0)
  return s
}

/**
 * Petals tumbling down over the page in 3D, lit from above so they catch the light as they turn.
 * Draws into `canvas` and calls `onDone` once the last petal has fallen out of view.
 */
export function startPetalStorm(canvas: HTMLCanvasElement, color: string, onDone: () => void): () => void {
  const width = window.innerWidth
  const height = window.innerHeight
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height, false)

  const scene = new Scene()
  const camera = new PerspectiveCamera(40, width / height, 1, 100)
  camera.position.z = 30
  // The visible half-height and half-width at the petals' depth, so they span the whole screen.
  const halfH = Math.tan((camera.fov / 2) * (Math.PI / 180)) * camera.position.z
  const halfW = halfH * camera.aspect

  scene.add(new AmbientLight(0xffffff, 1.6))
  const sun = new DirectionalLight(0xfff4dc, 2.2)
  sun.position.set(-3, 8, 10)
  scene.add(sun)

  const geometry = new ShapeGeometry(petalShape(), 8)
  geometry.translate(0, -0.5, 0)
  const materials = [color, ...TINTS].map(
    (c) => new MeshLambertMaterial({ color: new Color(c), side: DoubleSide, transparent: true, opacity: 0.78 }),
  )

  const petals = Array.from({ length: COUNT }, (_, i) => {
    const mesh = new Mesh(geometry, materials[i % 3 === 0 ? 1 + (i % TINTS.length) : 0])
    const size = 0.35 + Math.random() * 0.4
    mesh.scale.set(size, size * 1.3, size)
    scene.add(mesh)
    return {
      mesh,
      x: (Math.random() * 2 - 1) * halfW,
      z: (Math.random() * 2 - 1) * 6,
      start: Math.random() * 1400,
      fall: 2400 + Math.random() * 1800,
      sway: 0.6 + Math.random() * 1.4,
      swaySpeed: 1.5 + Math.random() * 2,
      spin: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 4 - 2] as const,
      phase: Math.random() * Math.PI * 2,
    }
  })

  let frame = 0
  const t0 = performance.now()
  const tick = (now: number) => {
    const t = now - t0
    for (const p of petals) {
      const k = (t - p.start) / p.fall
      p.mesh.visible = k > 0 && k < 1
      if (!p.mesh.visible) continue
      const s = (t - p.start) / 1000
      // falls a little faster as it goes, fluttering side to side
      p.mesh.position.set(
        p.x + Math.sin(s * p.swaySpeed + p.phase) * p.sway,
        halfH + 2 - k * k * 0.35 * (2 * halfH + 4) - k * 0.65 * (2 * halfH + 4),
        p.z,
      )
      p.mesh.rotation.set(p.phase + s * p.spin[0], s * p.spin[1], p.phase + s * p.spin[2])
    }
    renderer.render(scene, camera)
    if (t < DURATION) frame = requestAnimationFrame(tick)
    else onDone()
  }
  frame = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frame)
    geometry.dispose()
    materials.forEach((m) => m.dispose())
    renderer.dispose()
  }
}
