import * as T from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { asset } from "../content";
import { clamp, samplePose, smooth } from "./choreography";

export function createScene(
  host: HTMLElement,
  onReady: () => void,
  onLost: () => void,
) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor("#101116");
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.25 : 1.5),
  );
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  scene.fog = new T.Fog("#101116", 20, 72);
  const camera = new T.PerspectiveCamera(42, 1, 0.08, 120);
  const geometries = new Set<T.BufferGeometry>(),
    materials = new Set<T.Material>(),
    textures = new Set<T.Texture>();
  const pmrem = new T.PMREMGenerator(renderer),
    room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  let progress = 0,
    raf = 0,
    disposed = false,
    visible = true,
    loadedKorte = false,
    delivered = false;
  function requestRender() {
    if (!disposed && visible && !raf) raf = requestAnimationFrame(render);
  }
  const standard = (color: string, metalness = 0.1, roughness = 0.5) => {
    const m = new T.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      envMapIntensity: 0.22,
    });
    materials.add(m);
    return m;
  };
  const ink = standard("#17191e", 0.15, 0.75),
    bronze = standard("#735334", 0.78, 0.25),
    silver = standard("#89929a", 0.86, 0.3),
    navy = standard("#102636", 0.25, 0.5);
  const amberLight = new T.MeshBasicMaterial({ color: "#d9ad78" });
  materials.add(amberLight);
  const limeLight = new T.MeshBasicMaterial({ color: "#afcf6c" });
  materials.add(limeLight);
  function mesh(
    g: T.BufferGeometry,
    m: T.Material,
    parent: T.Object3D = scene,
  ) {
    geometries.add(g);
    const o = new T.Mesh(g, m);
    parent.add(o);
    return o;
  }
  function box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    m: T.Material,
    parent: T.Object3D = scene,
  ) {
    const o = mesh(new T.BoxGeometry(w, h, d), m, parent);
    o.position.set(x, y, z);
    return o;
  }
  scene.add(new T.HemisphereLight("#bfc9dd", "#161319", 0.65));
  const key = new T.DirectionalLight("#e4e7ef", 1.25);
  key.position.set(-5, 10, 6);
  scene.add(key);
  const warm = new T.PointLight("#ffc078", 65, 24, 1.8);
  warm.position.set(1, 5, -4);
  scene.add(warm);
  const cool = new T.PointLight("#9cb6e5", 75, 28, 1.8);
  cool.position.set(6, 7, -25);
  scene.add(cool);
  const floor = standard("#080a0e", 0, 1);
  floor.envMapIntensity = 0.035;
  box(2, -0.28, -15, 64, 0.4, 94, floor);

  function arch(
    x: number,
    z: number,
    width: number,
    height: number,
    thickness: number,
    m: T.Material,
  ) {
    const r = width / 2,
      spring = height - r,
      inside = r - thickness;
    const s = new T.Shape();
    s.moveTo(-r, 0);
    s.lineTo(-r, spring);
    s.absarc(0, spring, r, Math.PI, 0, true);
    s.lineTo(r, 0);
    s.lineTo(inside, 0);
    s.lineTo(inside, spring);
    s.absarc(0, spring, inside, 0, Math.PI, false);
    s.lineTo(-inside, 0);
    s.closePath();
    const o = mesh(
      new T.ExtrudeGeometry(s, {
        depth: 0.45,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.035,
        bevelThickness: 0.025,
        curveSegments: 36,
      }),
      m,
    );
    o.position.set(x, 0, z);
    return o;
  }
  const first = arch(3.3, 0, 6.5, 7.2, 0.48, bronze);
  arch(3.3, -0.06, 5.55, 6.75, 0.035, amberLight);
  arch(3.3, -1.1, 6.5, 7.2, 0.2, ink);
  const second = arch(3.3, -11.5, 6.8, 6.4, 0.17, silver);
  // A single shared slat geometry keeps the gallery's repeated forms inexpensive.
  const slatG = new T.BoxGeometry(0.12, 6.8, 0.16);
  geometries.add(slatG);
  const slats = new T.InstancedMesh(slatG, ink, 18),
    matrix = new T.Matrix4();
  for (let i = 0; i < 18; i++) {
    matrix.makeTranslation(7.2 + i * 0.24, 3.4, -3.4 - i * 0.36);
    slats.setMatrixAt(i, matrix);
  }
  scene.add(slats);

  // Soft pools of light are procedural textures, not expensive live reflections.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,.22)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const glow = new T.CanvasTexture(canvas);
  textures.add(glow);
  for (const [x, z, color] of [
    [3, -2, "#b68450"],
    [3, -24, "#7894ad"],
  ] as const) {
    const m = new T.MeshBasicMaterial({
      color,
      map: glow,
      transparent: true,
      depthWrite: false,
    });
    materials.add(m);
    const o = mesh(new T.PlaneGeometry(15, 15), m);
    o.rotation.x = -Math.PI / 2;
    o.position.set(x, -0.065, z);
  }

  const space = new T.Group();
  scene.add(space);
  const korte = new T.Group();
  scene.add(korte);
  const korteScreens = new T.Group();
  korte.add(korteScreens);
  const loader = new T.TextureLoader();
  function image(
    name: string,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    group: T.Group,
    cutout = false,
  ) {
    const m = new T.MeshBasicMaterial({
      transparent: cutout,
      alphaTest: cutout ? 0.08 : 0,
      side: T.DoubleSide,
      color: "#ffffff",
      toneMapped: false,
    });
    materials.add(m);
    const o = mesh(new T.PlaneGeometry(w, h), m, group);
    o.position.set(x, y, z);
    o.visible = false;
    loader.load(asset(`media/${name}.webp`), (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = T.SRGBColorSpace;
      texture.anisotropy = Math.min(
        4,
        renderer.capabilities.getMaxAnisotropy(),
      );
      textures.add(texture);
      m.map = texture;
      m.needsUpdate = true;
      o.visible = true;
      requestRender();
    });
    return o;
  }
  box(3.3, 0.3, -7.7, 3.5, 0.6, 2.6, standard("#302821"), space);
  const cup = image("space-cup", 3.3, 2.75, -7.5, 3.1, 3.92, space, true);
  const rose = image("space-rose", 5.9, 2.6, -9, 2.1, 2.52, space, true);
  rose.rotation.z = -0.08;
  const sitePanel = new T.Group();
  sitePanel.position.set(-0.9, 3.5, -10.5);
  sitePanel.rotation.y = 0.2;
  space.add(sitePanel);
  image("space-home", 0, 0, 0.025, 4.4, 2.75, sitePanel);
  box(0, 0, -0.12, 4.55, 2.9, 0.16, bronze, sitePanel);

  // A matched topology changes the arch's crown into a straight edge before the plane lowers.
  const ringCount = 97,
    sides = 6,
    positions = new Float32Array(ringCount * sides * 3),
    indices: number[] = [];
  for (let i = 0; i < ringCount - 1; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j,
        b = i * sides + ((j + 1) % sides),
        c = (i + 1) * sides + j,
        d = (i + 1) * sides + ((j + 1) % sides);
      indices.push(a, c, b, b, c, d);
    }
  const frameGeometry = new T.BufferGeometry();
  frameGeometry.setAttribute("position", new T.BufferAttribute(positions, 3));
  frameGeometry.setIndex(indices);
  geometries.add(frameGeometry);
  const frameMaterial = standard("#a9a99e", 0.7, 0.3);
  const frame = mesh(frameGeometry, frameMaterial);
  frame.position.set(3.3, 3.3, -18);
  let lastMorph = -1;
  function framePoint(t: number, morph: number): [number, number] {
    const w = 3.5,
      low = -3,
      spring = 0.1,
      top = 3.6;
    if (t < 0.22)
      return [-w, low + ((spring - low + (top - spring) * morph) * t) / 0.22];
    if (t < 0.62) {
      const u = (t - 0.22) / 0.4,
        a = Math.PI * (1 - u);
      return [
        Math.cos(a) * w * (1 - morph) + (-w + u * 2 * w) * morph,
        (spring + Math.sin(a) * w) * (1 - morph) + top * morph,
      ];
    }
    if (t < 0.84)
      return [
        w,
        spring +
          (top - spring) * morph +
          ((low - spring - (top - spring) * morph) * (t - 0.62)) / 0.22,
      ];
    return [w - ((t - 0.84) / 0.16) * 2 * w, low];
  }
  function morphFrame(v: number) {
    if (Math.abs(v - lastMorph) < 0.0001) return;
    lastMorph = v;
    for (let i = 0; i < ringCount; i++) {
      const t = i / (ringCount - 1),
        [x, y] = framePoint(t, v),
        next = framePoint((t + 0.001) % 1, v),
        prev = framePoint((t - 0.001 + 1) % 1, v);
      const dx = next[0] - prev[0],
        dy = next[1] - prev[1],
        len = Math.hypot(dx, dy) || 1;
      for (let j = 0; j < sides; j++) {
        const a = (j / sides) * Math.PI * 2,
          at = (i * sides + j) * 3;
        positions[at] = x - (dy / len) * Math.cos(a) * 0.075;
        positions[at + 1] = y + (dx / len) * Math.cos(a) * 0.075;
        positions[at + 2] = Math.sin(a) * 0.075;
      }
    }
    frameGeometry.attributes.position.needsUpdate = true;
    frameGeometry.computeVertexNormals();
    frameGeometry.computeBoundingSphere();
  }
  morphFrame(0);
  for (const x of [1.25, 5.35]) {
    box(x, -0.06, -25, 3.8, 0.1, 8, navy, korte);
    for (const dx of [-1.8, 1.8])
      box(x + dx, 0.002, -25, 0.025, 0.015, 7.8, limeLight, korte);
    for (const dz of [-3.9, -1.15, 0, 1.15, 3.9])
      box(x, 0.002, -25 + dz, 3.6, 0.015, 0.025, limeLight, korte);
    box(x, 0.002, -25, 0.025, 0.015, 7.8, limeLight, korte);
    const net = standard("#657b8b", 0.3);
    box(x, 0.34, -25, 3.6, 0.65, 0.025, net, korte);
  }
  const playerG = new T.CylinderGeometry(0.13, 0.18, 0.25, 12);
  geometries.add(playerG);
  const players = new T.InstancedMesh(playerG, limeLight, 8);
  korte.add(players);
  for (let i = 0; i < 8; i++) {
    const court = i < 4 ? 1.25 : 5.35,
      side = i % 4;
    matrix.makeTranslation(
      court + (side % 2 ? 0.7 : -0.7),
      0.16,
      -25 + (side < 2 ? -2.3 : 2.3),
    );
    players.setMatrixAt(i, matrix);
  }
  function loadKorte() {
    if (loadedKorte) return;
    loadedKorte = true;
    image("korte-live", 3.3, 3.7, -33, 7.2, 4.5, korteScreens);
    box(3.3, 3.7, -33.16, 7.4, 4.7, 0.16, silver, korteScreens);
    image("korte-organizer", 8, 2.9, -31.5, 1.78, 3.85, korteScreens);
  }

  function render() {
    raf = 0;
    if (disposed || !visible) return;
    const pose = samplePose(progress, host.clientWidth < 768);
    camera.position.set(...pose.camera);
    camera.lookAt(...pose.target);
    const morph = smooth((progress - 43) / 14);
    morphFrame(morph);
    const fold = smooth((progress - 52) / 12);
    frame.rotation.x = (-Math.PI / 2) * fold;
    frame.position.y = 3.3 * (1 - fold) + 0.06 * fold;
    frame.position.z = -18 - 7 * fold;
    frameMaterial.color.set("#a9a99e").lerp(new T.Color("#9bb765"), fold);
    cup.rotation.y = -0.05 + 0.16 * smooth(progress / 35);
    space.visible = progress < 58 || progress > 92;
    first.visible = progress < 30 || progress > 92;
    second.visible = progress < 58 || progress > 92;
    slats.visible = progress < 58 || progress > 92;
    korte.visible = progress > 36;
    korteScreens.visible = progress > 71;
    frame.visible = progress > 36 && progress < 80;
    if (progress > 34) loadKorte();
    renderer.render(scene, camera);
    host.dataset.progress = progress.toFixed(2);
    host.dataset.calls = String(renderer.info.render.calls);
    host.dataset.triangles = String(renderer.info.render.triangles);
    if (!delivered) {
      delivered = true;
      onReady();
    }
  }
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  });
  resize.observe(host);
  const lost = (event: Event) => {
    event.preventDefault();
    visible = false;
    delivered = false;
    onLost();
  };
  const restored = () => {
    visible = true;
    requestRender();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  renderer.domElement.addEventListener("webglcontextrestored", restored);
  requestRender();
  return {
    setProgress(p: number) {
      const next = clamp(p, 0, 100);
      if (Math.abs(next - progress) > 0.001) {
        progress = next;
        requestRender();
      }
    },
    setVisible(value: boolean) {
      visible = value;
      if (value) requestRender();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      renderer.domElement.removeEventListener("webglcontextrestored", restored);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      environment.dispose();
      slats.dispose();
      players.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
