// Interactive 3D body, v2 — anatomy adapts to the profile's gender:
// female builds narrower shoulders, defined waist, wider hips; male builds
// broader shoulders and a straighter torso. Auto-rotates slowly; drag to
// spin; tap a muscle to name it. Primary targets glow pink, secondary amber.

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const COLORS = {
  base: '#31415f',
  body: '#232e47',
  primary: '#ff5d8f',
  secondary: '#ffd166',
}

function Part({ id, hl, onPick, geo, args, pos, rot = [0, 0, 0], scale = [1, 1, 1] }) {
  const color =
    id !== 'body' && hl.primary.includes(id) ? COLORS.primary
      : id !== 'body' && hl.secondary.includes(id) ? COLORS.secondary
      : id === 'body' ? COLORS.body : COLORS.base
  return (
    <mesh
      position={pos} rotation={rot} scale={scale}
      onClick={(e) => { e.stopPropagation(); if (id !== 'body' && onPick) onPick(id) }}
    >
      {geo === 'sphere' && <sphereGeometry args={args} />}
      {geo === 'capsule' && <capsuleGeometry args={args} />}
      {geo === 'box' && <boxGeometry args={args} />}
      {geo === 'cyl' && <cylinderGeometry args={args} />}
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
    </mesh>
  )
}

// Gender anatomy parameters
function anatomy(gender) {
  const female = gender === 'female'
  return {
    shoulderX: female ? 0.48 : 0.58,       // how far out the deltoids sit
    shoulderR: female ? 0.165 : 0.215,
    chestR: female ? 0.21 : 0.245,
    chestScale: female ? [1, 0.95, 0.8] : [1.05, 0.78, 0.55],
    torsoTop: female ? 0.345 : 0.42,       // ribcage width
    torsoBottom: female ? 0.27 : 0.335,    // waist width
    pelvisScale: female ? [1.28, 0.75, 0.95] : [1.02, 0.7, 0.85],
    gluteR: female ? 0.215 : 0.185,
    gluteX: female ? 0.19 : 0.165,
    hipX: female ? 0.235 : 0.2,            // leg spacing
    thighR: female ? 0.15 : 0.14,
    armX: female ? 0.56 : 0.64,
    neckR: female ? 0.095 : 0.115,
    trapS: female ? [0.95, 0.55, 0.9] : [1.2, 0.75, 1],
  }
}

function buildParts(a) {
  const center = [
    { id: 'body', geo: 'sphere', args: [0.31, 28, 28], pos: [0, 3.12, 0] },
    { id: 'body', geo: 'cyl', args: [a.neckR, a.neckR + 0.02, 0.28, 20], pos: [0, 2.82, 0] },
    { id: 'body', geo: 'cyl', args: [a.torsoTop, a.torsoBottom, 1.18, 28], pos: [0, 2.05, 0] },
    { id: 'body', geo: 'sphere', args: [0.34, 28, 28], pos: [0, 1.42, 0], scale: a.pelvisScale },
    { id: 'abs', geo: 'box', args: [0.34, 0.55, 0.18], pos: [0, 1.82, a.torsoBottom * 0.78] },
    { id: 'lowerback', geo: 'box', args: [0.32, 0.38, 0.15], pos: [0, 1.78, -a.torsoBottom * 0.86] },
  ]
  const sided = [
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
  const mirrored = sided.flatMap((p) => [-1, 1].map((s) => ({
    ...p,
    key: p.id + p.pos.join(',') + (s < 0 ? 'L' : 'R'),
    pos: [p.pos[0] * s, p.pos[1], p.pos[2]],
    rot: p.rot ? [p.rot[0], p.rot[1] * s, p.rot[2] * s] : [0, 0, 0],
  })))
  return { center, mirrored }
}

export default function Body3D({ primary = [], secondary = [], onPick, gender = 'male' }) {
  const hl = { primary, secondary }
  const { center, mirrored } = buildParts(anatomy(gender))
  return (
    <div style={{ height: 320, borderRadius: 14, overflow: 'hidden', background: '#0a0f19', touchAction: 'none' }}>
      <Canvas camera={{ position: [0, 1.9, 4.4], fov: 38 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.15} />
        <directionalLight position={[-3, 2, -4]} intensity={0.35} />
        <group position={[0, -1.55, 0]}>
          {center.map((p, i) => <Part key={'c' + i} {...p} hl={hl} onPick={onPick} />)}
          {mirrored.map((p) => <Part key={p.key} {...p} hl={hl} onPick={onPick} />)}
        </group>
        <OrbitControls
          enablePan={false} enableZoom={false}
          autoRotate autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.7} target={[0, 0.2, 0]}
        />
      </Canvas>
    </div>
  )
}
