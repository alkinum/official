/// <reference lib="webworker" />

type GrainMessage =
  | {
      type: "initialize";
      canvas: OffscreenCanvas;
      width: number;
      height: number;
      reduceMotion: boolean;
      active: boolean;
    }
  | { type: "resize"; width: number; height: number }
  | { type: "visibility"; active: boolean };

let canvas: OffscreenCanvas;
let context: OffscreenCanvasRenderingContext2D;
let imageData: ImageData;
let timer: ReturnType<typeof setInterval> | undefined;
let reduceMotion = false;
let active = true;
let randomState = (Math.random() * 0xffffffff) >>> 0 || 0x9e3779b9;

function nextRandom() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return randomState >>> 0;
}

function resize(width: number, height: number) {
  canvas.width = width;
  canvas.height = height;
  imageData = context.createImageData(width, height);
}

function paint() {
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
}

function updateTimer() {
  if (timer) clearInterval(timer);
  timer = undefined;

  if (!reduceMotion && active) timer = setInterval(paint, 72);
}

self.onmessage = (event: MessageEvent<GrainMessage>) => {
  const message = event.data;

  if (message.type === "initialize") {
    canvas = message.canvas;
    const nextContext = canvas.getContext("2d", { alpha: false });
    if (!nextContext) return;
    context = nextContext;
    reduceMotion = message.reduceMotion;
    active = message.active;
    resize(message.width, message.height);
    paint();
    updateTimer();
    return;
  }

  if (message.type === "resize") {
    resize(message.width, message.height);
    paint();
    return;
  }

  active = message.active;
  updateTimer();
};

export {};
