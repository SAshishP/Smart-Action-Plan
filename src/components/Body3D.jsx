// Interactive 3D body. Rotate with a finger; primary target muscles glow
// pink, secondary glow amber. Tap a muscle to see its name.

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

const COLORS = {
  base: '#31415f',
  body: '#232e47',
  primary: '#ff6b81',
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
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.1} />
    </mesh>
  )
}

// side: -1 left, +1 right (mirrored parts)
function sided(parts) {
  return parts.flatMap((p) => [-1, 1].map((s) => ({
    ...p,
    key: p.id + (s < 0 ? 'L' : 'R'),
    pos: [p.pos[0] * s, p.pos[1], p.pos[2]],
    rot: p.rot ? [p.rot[0], p.rot[1] * s, p.rot[2] * s] : [0, 0, 0],
  })))
}

const CENTER = [
  { id: 'body', geo: 'sphere', args: [0.32, 24, 24], pos: [0, 3.12, 0] },                    // head
  { id: 'body', geo: 'cyl', args: [0.11, 0.13, 0.28, 16], pos: [0, 2.82, 0] },               // neck
  { id: 'body', geo: 'cyl', args: [0.4, 0.32, 1.2, 24], pos: [0, 2.05, 0] },                 // torso core
  { id: 'body', geo: 'sphere', args: [0.34, 24, 24], pos: [0, 1.42, 0], scale: [1, 0.72, 0.85] }, // pelvis
  { id: 'abs', geo: 'box', args: [0.36, 0.55, 0.2], pos: [0, 1.82, 0.26] },
  { id: 'lowerback', geo: 'box', args: [0.34, 0.38, 0.16], pos: [0, 1.78, -0.28] },
]

const SIDED = sided([
  { id: 'traps', geo: 'sphere', args: [0.15, 20, 20], pos: [0.26, 2.72, -0.06], scale: [1.1, 0.7, 1] },
  { id: 'shoulders', geo: 'sphere', args: [0.2, 20, 20], pos: [0.56, 2.52, 0] },
  { id: 'chest', geo: 'sphere', args: [0.24, 20, 20], pos: [0.22, 2.3, 0.2], scale: [1, 0.8, 0.55] },
  { id: 'lats', geo: 'box', args: [0.18, 0.6, 0.2], pos: [0.33, 2.08, -0.2] },
  { id: 'obliques', geo: 'box', args: [0.12, 0.5, 0.18], pos: [0.3, 1.8, 0.14] },
  { id: 'biceps', geo: 'capsule', args: [0.09, 0.3, 6, 12], pos: [0.63, 2.12, 0.1], rot: [0, 0, -0.12] },
  { id: 'triceps', geo: 'capsule', args: [0.09, 0.3, 6, 12], pos: [0.67, 2.12, -0.1], rot: [0, 0, -0.12] },
  { id: 'forearms', geo: 'capsule', args: [0.075, 0.36, 6, 12], pos: [0.72, 1.58, 0.02], rot: [0, 0, -0.06] },
  { id: 'body', geo: 'sphere', args: [0.09, 16, 16], pos: [0.75, 1.26, 0.02] },              // hand
  { id: 'glutes', geo: 'sphere', args: [0.19, 20, 20], pos: [0.17, 1.36, -0.22] },
  { id: 'quads', geo: 'capsule', args: [0.14, 0.46, 6, 12], pos: [0.2, 0.95, 0.1] },
  { id: 'hamstrings', geo: 'capsule', args: [0.12, 0.44, 6, 12], pos: [0.2, 0.95, -0.13] },
  { id: 'calves', geo: 'capsule', args: [0.1, 0.4, 6, 12], pos: [0.2, 0.34, -0.06] },
  { id: 'body', geo: 'box', args: [0.14, 0.1, 0.3], pos: [0.2, 0.02, 0.06] },                // foot
])

export default function Body3D({ primary = [], secondary = [], onPick }) {
  const hl = { primary, secondary }
  return (
    <div style={{ height: 320, borderRadius: 14, overflow: 'hidden', background: '#0a0f19', touchAction: 'none' }}>
      <Canvas camera={{ position: [0, 1.9, 4.4], fov: 38 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 4]} intensity={1.1} />
        <directionalLight position={[-3, 2, -4]} intensity={0.35} />
        <group position={[0, -1.55, 0]}>
          {CENTER.map((p, i) => <Part key={'c' + i} {...p} hl={hl} onPick={onPick} />)}
          {SIDED.map((p) => <Part key={p.key} {...p} hl={hl} onPick={onPick} />)}
        </group>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.7} target={[0, 0.2, 0]} />
      </Canvas>
    </div>
  )
}
