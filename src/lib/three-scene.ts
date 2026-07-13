import {
  ACESFilmicToneMapping,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  PointLight,
  Scene,
  SphereGeometry,
  SpotLight,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";

type SceneCanvas = HTMLCanvasElement | OffscreenCanvas;

export type SceneController = {
  resize: (width: number, height: number, pixelRatio: number) => void;
  setPointer: (x: number, y: number) => void;
  resetPointer: () => void;
  dispose: () => void;
};

export function createThreeScene(
  canvas: SceneCanvas,
  width: number,
  height: number,
  pixelRatio: number,
  reduceMotion: boolean,
  onReady: () => void,
): SceneController {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  camera.position.set(0, 0, 9.4);

  const mark = new Group();
  scene.add(mark);

  const makeSphere = (
    radius: number,
    color: number,
    metalness: number,
    roughness: number,
  ) =>
    new Mesh(
      new SphereGeometry(radius, 48, 32),
      new MeshStandardMaterial({ color, metalness, roughness }),
    );

  // Ratios are measured from the public 460px Alkinum organization avatar.
  const top = makeSphere(0.793, 0x3b3d3e, 0.12, 0.62);
  top.position.set(0.81, 1.603, -0.45);
  mark.add(top);

  const left = makeSphere(0.827, 0x343637, 0.12, 0.68);
  left.position.set(-1.709, -0.159, -0.35);
  mark.add(left);

  const center = makeSphere(1.55, 0xcfd0d0, 0.08, 0.58);
  center.position.set(0, 0, 0);
  mark.add(center);

  const lower = makeSphere(0.845, 0x3f4142, 0.14, 0.6);
  lower.position.set(1.18, -1.515, 0.55);
  mark.add(lower);

  scene.add(new HemisphereLight(0x9aa8ad, 0x07080a, 0.72));

  const spotlight = new SpotLight(0xf4f7f7, 95, 28, 0.55, 0.9, 1.55);
  spotlight.position.set(4.8, 5.6, 7.4);
  spotlight.target = mark;
  scene.add(spotlight);

  const rimLight = new PointLight(0x6d93a8, 7, 16, 2);
  rimLight.position.set(-4.2, -2.8, 3.6);
  scene.add(rimLight);

  const pointer = new Vector2(0, 0);
  const targetRotation = new Vector2(0, 0);
  let baseX = 1.75;
  let baseY = -0.08;
  let frame = 0;

  const requestFrame = (callback: FrameRequestCallback) => {
    if (typeof globalThis.requestAnimationFrame === "function") {
      return globalThis.requestAnimationFrame(callback);
    }
    return globalThis.setTimeout(
      () => callback(performance.now()),
      16,
    ) as unknown as number;
  };
  const cancelFrame = (handle: number) => {
    if (typeof globalThis.cancelAnimationFrame === "function") {
      globalThis.cancelAnimationFrame(handle);
      return;
    }
    globalThis.clearTimeout(handle);
  };

  const animate = () => {
    const ease = 0.075;
    const targetX = baseX + pointer.x * 0.075;
    const targetY = baseY - pointer.y * 0.06;
    const targetLightX = 4.8 + pointer.x * 1.15;
    const targetLightY = 5.6 - pointer.y * 0.8;

    mark.rotation.x += (targetRotation.x - mark.rotation.x) * ease;
    mark.rotation.y += (targetRotation.y - mark.rotation.y) * ease;
    mark.position.x += (targetX - mark.position.x) * ease;
    mark.position.y += (targetY - mark.position.y) * ease;
    spotlight.position.x += (targetLightX - spotlight.position.x) * 0.065;
    spotlight.position.y += (targetLightY - spotlight.position.y) * 0.065;

    renderer.render(scene, camera);

    const settled =
      Math.abs(targetRotation.x - mark.rotation.x) < 0.0002 &&
      Math.abs(targetRotation.y - mark.rotation.y) < 0.0002 &&
      Math.abs(targetX - mark.position.x) < 0.0002 &&
      Math.abs(targetY - mark.position.y) < 0.0002 &&
      Math.abs(targetLightX - spotlight.position.x) < 0.001 &&
      Math.abs(targetLightY - spotlight.position.y) < 0.001;

    frame = settled ? 0 : requestFrame(animate);
  };

  const scheduleAnimation = () => {
    if (!frame) frame = requestFrame(animate);
  };

  const resize = (
    nextWidth: number,
    nextHeight: number,
    nextPixelRatio: number,
  ) => {
    const narrow = nextWidth < 760;
    renderer.setPixelRatio(Math.min(nextPixelRatio, narrow ? 1.35 : 1.5));
    renderer.setSize(nextWidth, nextHeight, false);

    const viewHeight = narrow ? 7.9 : 5.8;
    const viewWidth = viewHeight * (nextWidth / nextHeight);
    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();

    baseX = narrow ? 0.28 : 1.75;
    baseY = narrow ? 0.82 : -0.08;
    mark.position.set(baseX, baseY, 0);
    mark.scale.setScalar(narrow ? 0.82 : 1);
    renderer.render(scene, camera);
  };

  resize(width, height, pixelRatio);
  onReady();

  return {
    resize,
    setPointer(x, y) {
      if (reduceMotion) return;
      pointer.set(x, y);
      targetRotation.set(-y * 0.11, x * 0.15);
      scheduleAnimation();
    },
    resetPointer() {
      pointer.set(0, 0);
      targetRotation.set(0, 0);
      if (!reduceMotion) scheduleAnimation();
    },
    dispose() {
      cancelFrame(frame);
      mark.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.dispose();
    },
  };
}
