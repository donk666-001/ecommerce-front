<template>
  <div ref="containerRef" class="china-map-3d" :class="{ 'is-hovering': tip.show }">
    <Transition name="tip-fade">
      <div
        v-if="tip.show"
        class="map-tip"
        :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
      >
        <span class="tip-name">{{ tip.name }}</span>
        <span class="tip-val">{{ tip.value.toLocaleString('zh-CN') }} 人</span>
      </div>
    </Transition>
    <div class="map-legend">
      <span class="legend-label">高</span>
      <div class="legend-bar"></div>
      <span class="legend-label">低</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps<{
  data: readonly { name: string; value: number }[]
  activeName?: string
}>()
const emit = defineEmits<{
  (e: 'hover', name: string): void
  (e: 'select', name: string): void
}>()

const containerRef = ref<HTMLDivElement>()
const tip = ref({ show: false, name: '', value: 0, x: 0, y: 0 })

// Three.js state
let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene
let camera: THREE.OrthographicCamera
let rafId = 0
let ro: ResizeObserver | null = null
let mapGroup: THREE.Group | null = null
let mapBounds: { centerX: number; centerY: number; width: number; height: number } | null = null

// Hover state
const hitMeshes: THREE.Mesh[] = []
type Info = {
  name: string
  displayName?: string
  value: number
  mat: THREE.MeshLambertMaterial
  baseZ?: number
  activeZ?: number
}
const meshInfo = new Map<THREE.Mesh, Info>()
let activeMesh: THREE.Mesh | null = null
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2(-9999, -9999)
const MAP_TILT_X = -Math.PI * 0.13
const geoJsonUrl = new URL('../../assets/maps/china.geojson', import.meta.url).href
const HAINAN_OFFSHORE_MAX_LAT = 17.5
const GUANGDONG_SOUTH_ISLAND_MAX_LAT = 21.25
const SPECIAL_REGION_MARKERS = [
  { name: '香港', label: '中国香港', coord: [114.18, 22.28], labelOffset: [0.34, 0.2] },
  { name: '澳门', label: '中国澳门', coord: [113.56, 22.16], labelOffset: [-0.34, -0.18] },
] as const

// ── Coordinate projection ─────────────────────────────────────────────────
// China: lon ≈ [73.5, 135.0], lat ≈ [18.0, 53.5]
const CX = 104.3, CY = 35.8, SC = 0.12

function proj(lon: number, lat: number): [number, number] {
  return [(lon - CX) * SC, (lat - CY) * SC * 1.18]
}

// ── Province name matching ────────────────────────────────────────────────
function normalize(geoName: string): string {
  return geoName
    .replace(/(特别行政区|壮族|回族|维吾尔|藏族|苗族|彝族|自治区|省|市)/g, '')
    .slice(0, 4)
}

function findStat(geoName: string): Info | null {
  if (!geoName) return null
  const short = normalize(geoName)
  const d = props.data.find(p => geoName.includes(p.name) || p.name.includes(short))
  if (!d) return null
  return { name: d.name, value: d.value, mat: null! }
}

// ── Color ramp ────────────────────────────────────────────────────────────
const C_NONE = new THREE.Color('#EEF4ED')
const C_LOW  = new THREE.Color('#C8DCD2')
const C_MID  = new THREE.Color('#5C8374')
const C_HIGH = new THREE.Color('#B33C2C')

function valueColor(ratio: number): THREE.Color {
  if (ratio <= 0) return C_NONE.clone()
  if (ratio < 0.5) return C_LOW.clone().lerp(C_MID, ratio * 2)
  return C_MID.clone().lerp(C_HIGH, (ratio - 0.5) * 2)
}

function createTextSprite(text: string) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const pixelRatio = Math.min(devicePixelRatio || 1, 2)
  const fontSize = 24
  const paddingX = 13
  const paddingY = 7

  ctx.font = `600 ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`
  const width = Math.ceil(ctx.measureText(text).width + paddingX * 2)
  const height = fontSize + paddingY * 2
  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  ctx.scale(pixelRatio, pixelRatio)
  ctx.font = `600 ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)'
  ctx.strokeStyle = 'rgba(201, 165, 92, 0.62)'
  ctx.lineWidth = 1
  ctx.fillRect(0.5, 0.5, width - 1, height - 1)
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1)
  ctx.fillStyle = '#2C3639'
  ctx.fillText(text, paddingX, height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
  sprite.scale.set(width * 0.004, height * 0.004, 1)
  sprite.renderOrder = 30
  return sprite
}

// ── Shape builders ────────────────────────────────────────────────────────
function buildShape(ring: number[][]): THREE.Shape | null {
  if (ring.length < 3) return null
  const pts = ring.map(point => new THREE.Vector2(...proj(point[0]!, point[1]!)))
  return new THREE.Shape(pts)
}

function buildPath(ring: number[][]): THREE.Path | null {
  if (ring.length < 3) return null
  const p = new THREE.Path()
  ring.forEach((point, i) => {
    const [x, y] = proj(point[0]!, point[1]!)
    i === 0 ? p.moveTo(x, y) : p.lineTo(x, y)
  })
  return p
}

function getRingBounds(ring: number[][]) {
  return ring.reduce(
    (bounds, point) => ({
      minLon: Math.min(bounds.minLon, point[0]!),
      maxLon: Math.max(bounds.maxLon, point[0]!),
      minLat: Math.min(bounds.minLat, point[1]!),
      maxLat: Math.max(bounds.maxLat, point[1]!),
    }),
    { minLon: 180, maxLon: -180, minLat: 90, maxLat: -90 },
  )
}

function shouldRenderFeature(feat: any, geoName: string) {
  if (!geoName) return false
  const properties = feat.properties ?? {}
  return properties.adchar !== 'JD' && String(properties.adcode ?? '') !== '100000_JD'
}

function shouldRenderPolygon(geoName: string, outerRing: number[][]) {
  const bounds = getRingBounds(outerRing)
  if (geoName.includes('海南') && bounds.maxLat < HAINAN_OFFSHORE_MAX_LAT) return false
  if (geoName.includes('广东') && bounds.maxLat <= GUANGDONG_SOUTH_ISLAND_MAX_LAT) return false
  return true
}

function addSpecialRegionMarkers(maxVal: number) {
  if (!mapGroup) return

  for (const marker of SPECIAL_REGION_MARKERS) {
    const stat = findStat(marker.name)
    if (!stat) continue

    const ratio = stat.value / maxVal
    const [x, y] = proj(marker.coord[0], marker.coord[1])
    const [labelX, labelY] = marker.labelOffset
    const mat = new THREE.MeshLambertMaterial({
      color: valueColor(ratio),
      emissive: new THREE.Color('#000000'),
    })
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 16), mat)
    dot.position.set(x, y, 0.38)
    dot.renderOrder = 25
    mapGroup.add(dot)
    hitMeshes.push(dot)
    meshInfo.set(dot, {
      name: marker.name,
      displayName: marker.label,
      value: stat.value,
      mat,
      baseZ: 0.38,
      activeZ: 0.47,
    })

    const label = createTextSprite(marker.label)
    label.position.set(x + labelX, y + labelY, 0.5)
    mapGroup.add(label)

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y, 0.39),
      new THREE.Vector3(x + labelX * 0.78, y + labelY * 0.78, 0.46),
    ])
    const lineMat = new THREE.LineBasicMaterial({ color: '#A07840', transparent: true, opacity: 0.72, depthTest: false })
    const line = new THREE.Line(lineGeo, lineMat)
    line.renderOrder = 24
    mapGroup.add(line)
  }
}

// ── Province mesh construction ────────────────────────────────────────────
async function buildProvinces() {
  const geoJson = await fetch(geoJsonUrl).then(async response => {
    if (!response.ok) {
      throw new Error(`Failed to load china.geojson: ${response.status}`)
    }
    return response.json()
  })
  const maxVal  = Math.max(...props.data.map(d => d.value), 1)
  const borderMat = new THREE.LineBasicMaterial({ color: '#9AB8AC' })
  mapGroup = new THREE.Group()
  mapGroup.rotation.x = MAP_TILT_X
  scene.add(mapGroup)

  for (const feat of geoJson.features) {
    const geoName: string = feat.properties?.name ?? ''
    if (!shouldRenderFeature(feat, geoName)) continue

    const stat  = findStat(geoName)
    const ratio = stat ? stat.value / maxVal : 0
    const depth = 0.04 + ratio * 0.22

    const mat = new THREE.MeshLambertMaterial({ color: valueColor(ratio) })

    const geom = feat.geometry
    const polys: number[][][][] =
      geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates]

    for (const poly of polys) {
      const outerRing = poly[0]
      if (!outerRing) continue
      if (!shouldRenderPolygon(geoName, outerRing)) continue

      const shape = buildShape(outerRing)
      if (!shape) continue

      for (const hole of poly.slice(1)) {
        const p = buildPath(hole)
        if (p) shape.holes.push(p)
      }

      // Filled extruded province
      const extGeo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false })
      const mesh = new THREE.Mesh(extGeo, mat.clone())
      mapGroup.add(mesh)
      hitMeshes.push(mesh)

      if (stat) {
        const info: Info = { name: stat.name, value: stat.value, mat: mesh.material as THREE.MeshLambertMaterial, baseZ: 0, activeZ: 0.07 }
        meshInfo.set(mesh, info)
      }

      // Province border on the top face
      const borderPts = outerRing.map(point => {
        const [x, y] = proj(point[0]!, point[1]!)
        return new THREE.Vector3(x, y, depth + 0.001)
      })
      const lineGeo = new THREE.BufferGeometry().setFromPoints(borderPts)
      mapGroup.add(new THREE.LineLoop(lineGeo, borderMat))
    }
  }
  addSpecialRegionMarkers(maxVal)

  const box = new THREE.Box3().setFromObject(mapGroup)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  mapBounds = {
    centerX: center.x,
    centerY: center.y,
    width: Math.max(size.x, 1),
    height: Math.max(size.y, 1),
  }
}

// ── Three.js initialization ───────────────────────────────────────────────
function initRenderer() {
  const el = containerRef.value!
  const { width, height } = el.getBoundingClientRect()
  if (!width || !height) return

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.setClearColor(0, 0)
  el.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  const halfViewHeight = 4.6
  const halfViewWidth = (width / height) * halfViewHeight
  camera = new THREE.OrthographicCamera(-halfViewWidth, halfViewWidth, halfViewHeight, -halfViewHeight, 0.1, 100)
  camera.position.set(0, 0, 10)
  camera.lookAt(0, 0, 0)

  // Warm ambient + soft directional light to highlight extrusions
  scene.add(new THREE.AmbientLight(0xfff8f0, 1.1))
  const dir = new THREE.DirectionalLight(0xffffff, 0.55)
  dir.position.set(3, 5, 8)
  scene.add(dir)

  const loop = () => {
    rafId = requestAnimationFrame(loop)
    raycaster.setFromCamera(pointer, camera)
    renderer!.render(scene, camera)
  }
  loop()
}

function fitCameraToMap(width: number, height: number) {
  if (!mapBounds) return
  const aspect = width / height || 1
  const paddedWidth = mapBounds.width * 1.12
  const paddedHeight = mapBounds.height * 1.16

  let viewWidth = paddedWidth
  let viewHeight = paddedHeight

  if (paddedWidth / paddedHeight > aspect) {
    viewHeight = paddedWidth / aspect
  } else {
    viewWidth = paddedHeight * aspect
  }

  camera.left = -viewWidth / 2
  camera.right = viewWidth / 2
  camera.top = viewHeight / 2
  camera.bottom = -viewHeight / 2
  camera.position.set(mapBounds.centerX, mapBounds.centerY, 10)
  camera.lookAt(mapBounds.centerX, mapBounds.centerY, 0)
  camera.updateProjectionMatrix()
}

function resize() {
  const el = containerRef.value
  if (!el || !renderer) return
  const { width, height } = el.getBoundingClientRect()
  if (!width || !height) return
  fitCameraToMap(width, height)
  renderer.setSize(width, height)
}

// ── Hover / tooltip ───────────────────────────────────────────────────────
function onMouseMove(e: MouseEvent) {
  const el = containerRef.value!
  const rect = el.getBoundingClientRect()
  pointer.x =  (e.clientX - rect.left) / rect.width  * 2 - 1
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(hitMeshes)[0]?.object as THREE.Mesh | undefined

  if (hit !== activeMesh) {
    activeMesh = hit ?? null
    refreshActiveMeshes()
  }

  if (activeMesh && meshInfo.has(activeMesh)) {
    const info = meshInfo.get(activeMesh)!
    emit('hover', info.name)
    tip.value = {
      show: true, name: info.displayName ?? info.name, value: info.value,
      x: e.clientX - rect.left + 14,
      y: e.clientY - rect.top  - 48,
    }
  } else {
    emit('hover', '')
    tip.value.show = false
  }
}

function onMouseLeave() {
  activeMesh = null
  refreshActiveMeshes()
  emit('hover', '')
  tip.value.show = false
  pointer.set(-9999, -9999)
}

function onClick() {
  if (!activeMesh || !meshInfo.has(activeMesh)) return
  emit('select', meshInfo.get(activeMesh)!.name)
}

function refreshMeshState(m: THREE.Mesh) {
  const info = meshInfo.get(m)
  if (!info) return
  const isActive = activeMesh === m || props.activeName === info.name
  info.mat.emissive.setHex(isActive ? 0x1a3530 : 0x000000)
  m.position.z = isActive ? (info.activeZ ?? 0.07) : (info.baseZ ?? 0)
}

function refreshActiveMeshes() {
  meshInfo.forEach((_, mesh) => refreshMeshState(mesh))
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  await nextTick()
  initRenderer()
  try {
    await buildProvinces()
    resize()
  } catch (error) {
    console.error('ChinaMap3D build failed', error)
  }

  const el = containerRef.value!
  el.addEventListener('mousemove', onMouseMove)
  el.addEventListener('mouseleave', onMouseLeave)
  el.addEventListener('click', onClick)
  ro = new ResizeObserver(resize)
  ro.observe(el)
})

watch(() => props.activeName, refreshActiveMeshes)

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  ro?.disconnect()
  const el = containerRef.value
  if (el) {
    el.removeEventListener('mousemove', onMouseMove)
    el.removeEventListener('mouseleave', onMouseLeave)
    el.removeEventListener('click', onClick)
    if (renderer?.domElement.parentNode === el) el.removeChild(renderer.domElement)
  }
  hitMeshes.forEach(m => m.geometry.dispose())
  hitMeshes.length = 0
  meshInfo.clear()
  mapGroup?.clear()
  mapGroup = null
  mapBounds = null
  renderer?.dispose()
  renderer = null
})
</script>

<style scoped>
.china-map-3d {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.china-map-3d :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
.china-map-3d.is-hovering :deep(canvas) {
  cursor: pointer;
}

/* Tooltip */
.map-tip {
  position: absolute;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.97);
  border: 1px solid #E8DFD0;
  border-radius: 8px;
  padding: 7px 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 4px 16px rgba(60, 50, 30, 0.12);
  z-index: 20;
  white-space: nowrap;
}
.tip-name { font-size: 13px; font-weight: 600; color: #2C3639; }
.tip-val  { font-size: 12px; color: #6B7C7A; }

/* Tooltip fade transition */
.tip-fade-enter-active,
.tip-fade-leave-active { transition: opacity 0.15s ease; }
.tip-fade-enter-from,
.tip-fade-leave-to    { opacity: 0; }

/* Color legend */
.map-legend {
  position: absolute;
  bottom: 14px;
  left: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  z-index: 10;
}
.legend-label {
  font-size: 10px;
  color: #6B7C7A;
  line-height: 1;
}
.legend-bar {
  width: 8px;
  height: 72px;
  border-radius: 4px;
  background: linear-gradient(to bottom, #B33C2C, #5C8374, #C8DCD2, #EEF4ED);
}
</style>
