import type { SceneController } from "./three-scene";

type SceneMessage = { type: "ready" } | { type: "error"; message: string };

function viewport() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  };
}

export function initializeScene(
  canvas: HTMLCanvasElement,
  reduceMotion: boolean,
  onReady: () => void,
) {
  let disposed = false;
  let controller: SceneController | undefined;
  let worker: Worker | undefined;

  const handleResize = () => {
    const size = viewport();
    if (worker) worker.postMessage({ type: "resize", ...size });
    else controller?.resize(size.width, size.height, size.pixelRatio);
  };
  const handlePointer = (event: PointerEvent) => {
    if (reduceMotion) return;
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    if (worker) worker.postMessage({ type: "pointer", x, y });
    else controller?.setPointer(x, y);
  };
  const handlePointerReset = () => {
    if (worker) worker.postMessage({ type: "reset-pointer" });
    else controller?.resetPointer();
  };

  if (
    typeof Worker !== "undefined" &&
    typeof canvas.transferControlToOffscreen === "function"
  ) {
    worker = new Worker(
      new URL("../workers/scene.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    const offscreen = canvas.transferControlToOffscreen();
    worker.addEventListener("message", (event: MessageEvent<SceneMessage>) => {
      if (event.data.type === "ready") onReady();
      else
        console.error(
          "Unable to initialize the Three.js scene",
          event.data.message,
        );
    });
    worker.postMessage(
      {
        type: "initialize",
        canvas: offscreen,
        reduceMotion,
        ...viewport(),
      },
      [offscreen],
    );
  } else {
    void import("./three-scene").then(({ createThreeScene }) => {
      if (disposed) return;
      const size = viewport();
      controller = createThreeScene(
        canvas,
        size.width,
        size.height,
        size.pixelRatio,
        reduceMotion,
        onReady,
      );
    });
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("pointermove", handlePointer, { passive: true });
  document.documentElement.addEventListener("mouseleave", handlePointerReset);

  return () => {
    disposed = true;
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("pointermove", handlePointer);
    document.documentElement.removeEventListener(
      "mouseleave",
      handlePointerReset,
    );
    controller?.dispose();
    worker?.terminate();
  };
}
