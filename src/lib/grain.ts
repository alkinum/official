type GrainSize = {
  width: number;
  height: number;
};

function getGrainSize(): GrainSize {
  const scale = Math.min(
    0.5,
    720 / window.innerWidth,
    540 / window.innerHeight,
  );

  return {
    width: Math.max(1, Math.round(window.innerWidth * scale)),
    height: Math.max(1, Math.round(window.innerHeight * scale)),
  };
}

function initializeFallback(canvas: HTMLCanvasElement, reduceMotion: boolean) {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return () => {};

  let imageData: ImageData;
  let timer = 0;
  let randomState = (Math.random() * 0xffffffff) >>> 0 || 0x9e3779b9;

  const nextRandom = () => {
    randomState ^= randomState << 13;
    randomState ^= randomState >>> 17;
    randomState ^= randomState << 5;
    return randomState >>> 0;
  };

  const resize = () => {
    const { width, height } = getGrainSize();
    canvas.width = width;
    canvas.height = height;
    imageData = context.createImageData(width, height);
  };

  const paint = () => {
    const pixels = imageData.data;
    for (let index = 0; index < pixels.length; index += 4) {
      const random = nextRandom();
      const base = 102 + (random & 63);
      pixels[index] = base + ((random >>> 8) & 15);
      pixels[index + 1] = base + ((random >>> 16) & 13);
      pixels[index + 2] = base + ((random >>> 24) & 17);
      pixels[index + 3] = 255;
    }
    context.putImageData(imageData, 0, 0);
  };

  const schedule = () => {
    if (!document.hidden) paint();
    timer = window.setTimeout(schedule, 100);
  };

  const handleResize = () => {
    resize();
    paint();
  };

  resize();
  paint();
  if (!reduceMotion) timer = window.setTimeout(schedule, 100);
  window.addEventListener("resize", handleResize);

  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("resize", handleResize);
  };
}

export function initializeGrain(
  canvas: HTMLCanvasElement,
  reduceMotion: boolean,
) {
  if (
    typeof Worker === "undefined" ||
    typeof canvas.transferControlToOffscreen !== "function"
  ) {
    return initializeFallback(canvas, reduceMotion);
  }

  const worker = new Worker(
    new URL("../workers/grain.worker.ts", import.meta.url),
    {
      type: "module",
    },
  );
  const offscreen = canvas.transferControlToOffscreen();
  const size = getGrainSize();

  worker.postMessage(
    {
      type: "initialize",
      canvas: offscreen,
      reduceMotion,
      active: !document.hidden,
      ...size,
    },
    [offscreen],
  );

  const handleResize = () => {
    worker.postMessage({ type: "resize", ...getGrainSize() });
  };
  const handleVisibility = () => {
    worker.postMessage({ type: "visibility", active: !document.hidden });
  };

  window.addEventListener("resize", handleResize);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibility);
    worker.terminate();
  };
}
