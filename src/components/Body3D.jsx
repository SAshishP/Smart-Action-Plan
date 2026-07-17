// 3D target-muscle viewer.
// Male/other profiles: the real scanned body model (decimated to 1.1 MB),
// with glowing translucent muscle markers overlaid for primary/secondary
// targets. Female profiles: the gender-tuned stylized rig (no female model
// was provided). If the model file fails to load, the stylized rig is the
// automatic fallback — the screen never breaks.

import { Component, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

const COLORS = { base: '#31415f', body: '#232e47', primary: '#ff5d8f', secondary: '#ffd166' }

/* ---------- shared muscle marker positions (feet y=0 … head y≈3.1) ---------- */
// Tuned for the scanned model's slightly-open arm pose.
const MODEL_MARKERS = [
  { id: 'traps', geo: 'sphere', args: [0.13, 18, 18], pos: [0.18, 2.62, -0.05] },
  { id: 'shoulders', geo: 'sphere', args: [0.16, 18, 18], pos: [0.4, 2.45, 0] },
  { id: 'chest', geo: 'sphere', args: [0.18, 18, 18], pos: [0.16, 2.26, 0.16], scale: [1, 0.8, 0.6] },
  { id: 'lats', geo: 'box', args: [0.16, 0.5, 0.16], pos: [0.24, 2.05, -0.15] },
  { id: 'obliques', geo: 'box', args: [0.1, 0.42, 0.14], pos: [0.24, 1.78, 0.06] },
  { id: 'abs', geo: 'box', args: [0.26, 0.5, 0.12], pos: [0, 1.8, 0.17], center: true },
  { id: 'lowerback', geo: 'box', args: [0.26, 0.34, 0.12], pos: [0, 1.78, -0.2], center: true },
  { id: 'biceps', geo: 'capsule', args: [0.08, 0.26, 6, 12], pos: [0.5, 2.08, 0.06], rot: [0, 0, -0.35] },
  { id: 'triceps', geo: 'capsule', args: [0.08, 0.26, 6, 12], pos: [0.54, 2.08, -0.07], rot: [0, 0, -0.35] },
  { id: 'forearms', geo: 'capsule', args: [0.065, 0.3, 6, 12], pos: [0.63, 1.6, 0.02], rot: [0, 0, -0.3] },
  { id: 'glutes', geo: 'sphere', args: [0.16, 18, 18], pos: [0.14, 1.32, -0.18] },
  { id: 'quads', geo: 'capsule', args: [0.13, 0.42, 6, 12], pos: [0.16, 0.92, 0.09] },
  { id: 'hamstrings', geo: 'capsule', args: [0.11, 0.4, 6, 12], pos: [0.16, 0.92, -0.11] },
  { id: 'calves', geo: 'capsule', args: [0.09, 0.36, 6, 12], pos: [0.16, 0.34, -0.06] },
]

function Geo({ geo, args }) {
  if (geo === 'sphere') return <sphereGeometry args={args} />
  if (geo === 'capsule') return <capsuleGeometry args={args} />
  if (geo === 'box') return <boxGeometry args={args} />
  return <cylinderGeometry args={args} />
}

function Markers({ primary, secondary }) {
  const active = MODEL_MARKERS.filter((m) => primary.includes(m.id) || secondary.includes(m.id))
  return active.flatMap((m) => {
    const color = primary.includes(m.id) ? COLORS.primary : COLORS.secondary
    const sides = m.center ? [1] : [-1, 1]
    return sides.map((s) => (
      <mesh key={m.id + s} position={[m.pos[0] * s, m.pos[1], m.pos[2]]}
        rotation={m.rot ? [m.rot[0], m.rot[1] * s, m.rot[2] * s] : [0, 0, 0]}
        scale={m.scale || [1, 1, 1]} renderOrder={2}>
        <Geo geo={m.geo} args={m.args} />
        <meshBasicMaterial color={color} transparent opacity={0.55} depthTest={false} />
      </mesh>
    ))
  })
}

function ScannedBody() {
  const { scene } = useGLTF('/models/male_body.glb')
  scene.traverse((o) => {
    if (o.isMesh) {
      o.material.color?.set(COLORS.body)
      o.material.roughness = 0.6
      o.material.metalness = 0.08
    }
  })
  return <primitive object={scene} />
}

/* ---------- stylized rig (female + universal fallback) ---------- */
function anatomy(gender) {
  const female = gender === 'female'
  return {
    shoulderX: female ? 0.48 : 0.58, shoulderR: female ? 0.165 : 0.215,
    chestR: female ? 0.21 : 0.245, chestScale: female ? [1, 0.95, 0.8] : [1.05, 0.78, 0.55],
    torsoTop: female ? 0.345 : 0.42, torsoBottom: female ? 0.27 : 0.335,
    pelvisScale: female ? [1.28, 0.75, 0.95] : [1.02, 0.7, 0.85],
    gluteR: female ? 0.215 : 0.185, gluteX: female ? 0.19 : 0.165,
    hipX: female ? 0.235 : 0.2, thighR: female ? 0.15 : 0.14,
    armX: female ? 0.56 : 0.64, neckR: female ? 0.095 : 0.115,
    trapS: female ? [0.95, 0.55, 0.9] : [1.2, 0.75, 1],
  }
}

function Rig({ gender, primary, secondary, onPick }) {
  const a = anatomy(gender)
  const colorOf = (id) =>
    id !== 'body' && primary.includes(id) ? COLORS.primary
      : id !== 'body' && secondary.includes(id) ? COLORS.secondary
      : id === 'body' ? COLORS.body : COLORS.base
  const P = ({ id, geo, args, pos, rot = [0, 0, 0], scale = [1, 1, 1] }) => (
    <mesh position={pos} rotation={rot} scale={scale}
      onClick={(e) => { e.stopPropagation(); if (id !== 'body' && onPick) onPick(id) }}>
      <Geo geo={geo} args={args} />
      <meshStandardMaterial color={colorOf(id)} roughness={0.5} metalness={0.1} />
    </mesh>
  )
  const C = [
    { id: 'body', geo: 'sphere', args: [0.31, 28, 28], pos: [0, 3.12, 0] },
    { id: 'body', geo: 'cyl', args: [a.neckR, a.neckR + 0.02, 0.28, 20], pos: [0, 2.82, 0] },
    { id: 'body', geo: 'cyl', args: [a.torsoTop, a.torsoBottom, 1.18, 28], pos: [0, 2.05, 0] },
    { id: 'body', geo: 'sphere', args: [0.34, 28, 28], pos: [0, 1.42, 0], scale: a.pelvisScale },
    { id: 'abs', geo: 'box', args: [0.34, 0.55, 0.18], pos: [0, 1.82, a.torsoBottom * 0.78] },
    { id: 'lowerback', geo: 'box', args: [0.32, 0.38, 0.15], pos: [0, 1.78, -a.torsoBottom * 0.86] },
  ]
  const S = [
    { id: 'traps', geo: 'sphere', args: [0.15, 22, 22], pos: [0.26, 2.72, -0.06], scale: a.trapS },
    { id: 'shoulders', geo: 'sphere', args: [a.shoulderR, 22, 22], pos: [a.shoulderX, 2.52, 0] },
    { id: 'chest', geo: 'sphere', args: [a.chestR, 22, 22], pos: [0.21, 2.3, a.torsoTop * 0.62], scale: a.chestScale },
    { id: 'lats', geo: 'box', args: [0.17, 0.6, 0.18], pos: [a.torsoTop * 0.82, 2.08, -a.torsoTop * 0.5] },
    { id: 'obliques', geo: 'box', args: [0.11, 0.5, 0.16], pos: [a.torsoBottom * 0.95, 1.8, 0.1] },
    { id: 'biceps', geo: 'capsule', args: [0.085, 0.3, 8, 16], pos: [a.armX, 2.12, 0.09], rot: [0, 0, -0.12] },
    { id: 'triceps', geo: 'capsule', args: [0.085, 0.3, 8, 16], pos: [a.armX + 0.045, 2.12, -0.09], rot: [0, 0, -0.12] },
    { id: 'forearms', geo: 'capsule', args: [0.07, 0.36, 8, 16], pos: [a.armX + 0.09, 1.58, 0.02], rot: [0, 0, -0.06] },
    { id: 'body', geo: 'sphere', args: [0.085, 18, 18], pos: [a.armX + 0.12, 1.26, 0.02] },
    { id: 'glutes', geo: 'sphere', args: [a.gluteR, 22, 22], pos: [a.gluteX, 1.36, -0.2] },
    { id: 'quads', geo: 'capsule', args: [a.thighR, 0.46, 8, 16], pos: [a.hipX, 0.95, 0.1] },
    { id: 'hamstrings', geo: 'capsule', args: [a.thighR - 0.02, 0.44, 8, 16], pos: [a.hipX, 0.95, -0.13] },
    { id: 'calves', geo: 'capsule', args: [0.095, 0.4, 8, 16], pos: [a.hipX, 0.34, -0.06] },
    { id: 'body', geo: 'box', args: [0.13, 0.09, 0.28], pos: [a.hipX, 0.02, 0.06] },
  ]
  return (
    <>
      {C.map((p, i) => <P key={'c' + i} {...p} />)}
      {S.flatMap((p) => [-1, 1].map((s) => (
        <P key={p.id + p.pos.join(',') + s} {...p}
          pos={[p.pos[0] * s, p.pos[1], p.pos[2]]}
          rot={p.rot ? [p.rot[0], p.rot[1] * s, p.rot[2] * s] : [0, 0, 0]} />
      )))}
    </>
  )
}

class ModelBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export default function Body3D({ primary = [], secondary = [], onPick, gender = 'male' }) {
  const useModel = gender !== 'female'
  const rig = <Rig gender={gender} primary={primary} secondary={secondary} onPick={onPick} />
  return (
    <div style={{ height: 320, borderRadius: 14, overflow: 'hidden', background: '#0a0f19', touchAction: 'none' }}>
      <Canvas camera={{ position: [0, 1.9, 4.4], fov: 38 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.15} />
        <directionalLight position={[-3, 2, -4]} intensity={0.35} />
        <group position={[0, -1.55, 0]}>
          {useModel ? (
            <ModelBoundary fallback={rig}>
              <Suspense fallback={rig}>
                <ScannedBody />
                <Markers primary={primary} secondary={secondary} />
              </Suspense>
            </ModelBoundary>
          ) : rig}
        </group>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.7} target={[0, 0.2, 0]} />
      </Canvas>
    </div>
  )
}
