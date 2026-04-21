import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function CarHero3D({ className = '' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const w = mount.clientWidth
    const h = mount.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a18)

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100)
    camera.position.set(4, 3, 7)
    camera.lookAt(0, 0.5, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.8
    mount.appendChild(renderer.domElement)

    // Bright lighting
    scene.add(new THREE.AmbientLight(0xffffff, 5))
    const sun = new THREE.DirectionalLight(0xffffff, 10)
    sun.position.set(8, 12, 8)
    sun.castShadow = true
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0xaaddff, 5)
    fill.position.set(-8, 5, -5)
    scene.add(fill)
    const orange1 = new THREE.PointLight(0xf97316, 8, 15)
    orange1.position.set(4, 4, 6)
    scene.add(orange1)
    const orange2 = new THREE.PointLight(0xff6600, 5, 12)
    orange2.position.set(-4, 2, 3)
    scene.add(orange2)
    const under = new THREE.PointLight(0xf97316, 4, 8)
    under.position.set(0, -0.3, 0)
    scene.add(under)

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111133, metalness: 0.95, roughness: 0.05 })
    const redMat = new THREE.MeshStandardMaterial({ color: 0xcc1100, metalness: 0.85, roughness: 0.15 })
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.5, roughness: 0.5 })
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3, metalness: 0, roughness: 0 })
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0 })
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.9 })
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.98, roughness: 0.02 })
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 5 })
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffcc00, emissiveIntensity: 12 })
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff2200, emissiveIntensity: 10 })

    const car = new THREE.Group()

    // ── BODY ──
    // Lower body sill
    const sill = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.25, 2.0), darkMat)
    sill.position.set(0, 0.13, 0)
    sill.castShadow = true
    car.add(sill)

    // Main lower body
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.55, 1.85), bodyMat)
    lowerBody.position.set(0, 0.43, 0)
    lowerBody.castShadow = true
    car.add(lowerBody)

    // Hood (front)
    const hoodShape = new THREE.Shape()
    hoodShape.moveTo(0, 0)
    hoodShape.lineTo(1.6, 0)
    hoodShape.lineTo(1.6, 0.08)
    hoodShape.lineTo(0, 0.22)
    hoodShape.closePath()
    const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, { depth: 1.82, bevelEnabled: false })
    const hoodMesh = new THREE.Mesh(hoodGeo, bodyMat)
    hoodMesh.position.set(0.45, 0.67, -0.91)
    hoodMesh.castShadow = true
    car.add(hoodMesh)

    // Trunk (rear)
    const trunkMesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 1.82), bodyMat)
    trunkMesh.position.set(-1.7, 0.75, 0)
    car.add(trunkMesh)

    // ── CABIN ──
    // A-pillar left
    const aPillarL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), bodyMat)
    aPillarL.position.set(0.75, 1.08, 0.88)
    aPillarL.rotation.z = -0.25
    car.add(aPillarL)
    // A-pillar right
    const aPillarR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), bodyMat)
    aPillarR.position.set(0.75, 1.08, -0.88)
    aPillarR.rotation.z = -0.25
    car.add(aPillarR)

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.1, 1.68), bodyMat)
    roof.position.set(-0.12, 1.42, 0)
    car.add(roof)

    // C-pillar left
    const cPillarL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), bodyMat)
    cPillarL.position.set(-0.95, 1.08, 0.88)
    cPillarL.rotation.z = 0.25
    car.add(cPillarL)
    // C-pillar right
    const cPillarR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), bodyMat)
    cPillarR.position.set(-0.95, 1.08, -0.88)
    cPillarR.rotation.z = 0.25
    car.add(cPillarR)

    // B-pillar left & right
    const bPillarL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.68, 0.07), bodyMat)
    bPillarL.position.set(-0.12, 1.07, 0.89)
    car.add(bPillarL)
    const bPillarR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.68, 0.07), bodyMat)
    bPillarR.position.set(-0.12, 1.07, -0.89)
    car.add(bPillarR)

    // ── WINDOWS ──
    // Windshield
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.62), glassMat)
    ws.position.set(0.65, 1.1, 0)
    ws.rotation.y = Math.PI / 2
    ws.rotation.z = 0.25
    car.add(ws)

    // Rear glass
    const rg = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.62), glassMat)
    rg.position.set(-0.98, 1.1, 0)
    rg.rotation.y = Math.PI / 2
    rg.rotation.z = -0.25
    car.add(rg)

    // Side windows
    const swGeo = new THREE.PlaneGeometry(0.55, 0.5)
    for (const [x, z, ry] of [[0.28, 0.9, 0], [-0.48, 0.9, 0]]) {
      const swL = new THREE.Mesh(swGeo, glassMat)
      swL.position.set(x, 1.12, z)
      car.add(swL)
      const swR = new THREE.Mesh(swGeo, glassMat)
      swR.position.set(x, 1.12, -z)
      car.add(swR)
    }

    // ── DOORS ──
    const doorL1 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.62, 0.04), bodyMat)
    doorL1.position.set(0.28, 0.73, 0.93)
    car.add(doorL1)
    const doorL2 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.62, 0.04), bodyMat)
    doorL2.position.set(-0.62, 0.73, 0.93)
    car.add(doorL2)
    const doorR1 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.62, 0.04), bodyMat)
    doorR1.position.set(0.28, 0.73, -0.93)
    car.add(doorR1)
    const doorR2 = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.62, 0.04), bodyMat)
    doorR2.position.set(-0.62, 0.73, -0.93)
    car.add(doorR2)

    // Door handles
    for (const [x, z] of [[0.28, 0.95], [-0.62, 0.95], [0.28, -0.95], [-0.62, -0.95]]) {
      const dh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.03), chromeMat)
      dh.position.set(x, 0.78, z)
      car.add(dh)
    }

    // ── FRONT DETAILS ──
    // Front fascia
    const frontFascia = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 1.88), darkMat)
    frontFascia.position.set(2.07, 0.35, 0)
    car.add(frontFascia)

    // Grille opening
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 1.1), new THREE.MeshStandardMaterial({ color: 0x000000 }))
    grille.position.set(2.12, 0.32, 0)
    car.add(grille)

    // Grille bars
    for (let i = 0; i < 4; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 1.08), chromeMat)
      bar.position.set(2.13, 0.22 + i * 0.055, 0)
      car.add(bar)
    }

    // Headlights
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.42), hlMat)
    hl1.position.set(2.1, 0.42, 0.65)
    const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.42), hlMat)
    hl2.position.set(2.1, 0.42, -0.65)
    car.add(hl1, hl2)

    // DRL strips
    const drlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 8 })
    const drl1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.55), drlMat)
    drl1.position.set(2.13, 0.56, 0.6)
    const drl2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.55), drlMat)
    drl2.position.set(2.13, 0.56, -0.6)
    car.add(drl1, drl2)

    // Front bumper lower
    const fb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 1.7), darkMat)
    fb.position.set(2.1, 0.1, 0)
    car.add(fb)

    // ── REAR DETAILS ──
    const rearFascia = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 1.88), darkMat)
    rearFascia.position.set(-2.07, 0.35, 0)
    car.add(rearFascia)

    // Taillights
    const tl1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.55), tlMat)
    tl1.position.set(-2.1, 0.42, 0.62)
    const tl2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.55), tlMat)
    tl2.position.set(-2.1, 0.42, -0.62)
    car.add(tl1, tl2)

    // Taillight bar
    const tlBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 1.3), tlMat)
    tlBar.position.set(-2.11, 0.56, 0)
    car.add(tlBar)

    // Rear bumper
    const rb = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 1.7), darkMat)
    rb.position.set(-2.1, 0.1, 0)
    car.add(rb)

    // Exhaust pipes
    for (const z of [0.38, 0.55]) {
      const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 12), chromeMat)
      ex.rotation.x = Math.PI / 2
      ex.position.set(-2.1, 0.12, z)
      car.add(ex)
    }

    // ── ORANGE ACCENT STRIPES ──
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.06, 0.06), stripeMat)
    s1.position.set(0, 0.48, 0.97)
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.06, 0.06), stripeMat)
    s2.position.set(0, 0.48, -0.97)
    car.add(s1, s2)

    // Roof stripe
    const rs = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.02, 0.05), stripeMat)
    rs.position.set(-0.12, 1.48, 0)
    car.add(rs)

    // ── SIDE MIRRORS ──
    for (const z of [0.98, -0.98]) {
      const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.06), bodyMat)
      mirrorArm.position.set(0.8, 1.02, z)
      const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.1), bodyMat)
      mirrorHead.position.set(0.8, 1.0, z > 0 ? z + 0.08 : z - 0.08)
      car.add(mirrorArm, mirrorHead)
    }

    // ── WHEELS ──
    const wheels = []
    const wheelPositions = [[1.28, -0.18, 1.02], [-1.28, -0.18, 1.02], [1.28, -0.18, -1.02], [-1.28, -0.18, -1.02]]

    wheelPositions.forEach(pos => {
      const wGroup = new THREE.Group()

      // Tire outer
      const tireOuter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.44, 0.44, 0.28, 32), wheelMat
      )
      tireOuter.rotation.z = Math.PI / 2
      wGroup.add(tireOuter)

      // Tire tread (slightly larger radius, darker)
      const tread = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.46, 0.24, 32),
        new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1 })
      )
      tread.rotation.z = Math.PI / 2
      wGroup.add(tread)

      // Rim dish
      const rimDish = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.29, 32), rimMat
      )
      rimDish.rotation.z = Math.PI / 2
      wGroup.add(rimDish)

      // Spokes (6)
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.31, 0.06, 0.05),
          new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.95, roughness: 0.05 })
        )
        spoke.rotation.x = angle
        spoke.position.set(0, Math.sin(angle) * 0.15, Math.cos(angle) * 0.15)
        wGroup.add(spoke)
      }

      // Center cap
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.31, 16), chromeMat
      )
      cap.rotation.z = Math.PI / 2
      wGroup.add(cap)

      // Hub bolt
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.32, 6), darkMat
      )
      bolt.rotation.z = Math.PI / 2
      wGroup.add(bolt)

      wGroup.position.set(...pos)
      car.add(wGroup)
      wheels.push(wGroup)
    })

    // Wheel arches
    for (const [x, z] of [[1.28, 0.96], [1.28, -0.96], [-1.28, 0.96], [-1.28, -0.96]]) {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.06, 8, 24, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x0a0a18, metalness: 0.3, roughness: 0.7 })
      )
      arch.position.set(x, 0.3, z)
      arch.rotation.y = z > 0 ? Math.PI / 2 : -Math.PI / 2
      car.add(arch)
    }

    // ── UNDERCAR GLOW ──
    const glowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 1.75),
      new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    )
    glowMesh.rotation.x = Math.PI / 2
    glowMesh.position.y = -0.35
    car.add(glowMesh)

    car.position.y = 0.62
    scene.add(car)

    // ── GROUND ──
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 22),
      new THREE.MeshStandardMaterial({ color: 0x070710, metalness: 0.95, roughness: 0.05 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.68
    ground.receiveShadow = true
    scene.add(ground)

    // Grid
    const grid = new THREE.GridHelper(22, 32, 0xf97316, 0x0f0f1e)
    grid.position.y = -0.67
    grid.material.transparent = true
    grid.material.opacity = 0.2
    scene.add(grid)

    // Reflection plane
    const reflMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x111133, metalness: 1, roughness: 0, transparent: true, opacity: 0.3 })
    )
    reflMesh.rotation.x = -Math.PI / 2
    reflMesh.position.y = -0.66
    scene.add(reflMesh)

    // Particles
    const pCount = 150
    const pGeo = new THREE.BufferGeometry()
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 18
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const particles = new THREE.Points(pGeo,
      new THREE.PointsMaterial({ color: 0xf97316, size: 0.05, transparent: true, opacity: 0.75 }))
    scene.add(particles)

    // Mouse
    let mouseX = 0, mouseY = 0
    const onMouse = (e) => {
      mouseX = ((e.clientX / window.innerWidth) - 0.5) * 2
      mouseY = ((e.clientY / window.innerHeight) - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouse)

    // Animation
    let frame = 0, rafId
    const animate = () => {
      frame++
      const t = frame * 0.01

      car.rotation.y += (mouseX * 0.45 - car.rotation.y) * 0.04
      car.rotation.x += (-mouseY * 0.05 - car.rotation.x) * 0.04
      car.position.y = 0.62 + Math.sin(t * 0.8) * 0.09

      wheels.forEach(w => { w.rotation.x += 0.022 })

      orange1.intensity = 6 + Math.sin(t * 2) * 2
      hl1.material.emissiveIntensity = 10 + Math.sin(t * 3) * 3
      hl2.material.emissiveIntensity = 10 + Math.sin(t * 3) * 3
      tl1.material.emissiveIntensity = 8 + Math.sin(t * 2.5) * 2
      tl2.material.emissiveIntensity = 8 + Math.sin(t * 2.5) * 2
      glowMesh.material.opacity = 0.14 + Math.sin(t) * 0.05
      particles.rotation.y += 0.0008

      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} className={`w-full h-full ${className}`} />
}