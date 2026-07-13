/// <reference lib="webworker" />

import { createThreeScene, type SceneController } from "../lib/three-scene";

type WorkerMessage =
  | {
      type: "initialize";
      canvas: OffscreenCanvas;
      width: number;
      height: number;
      pixelRatio: number;
      reduceMotion: boolean;
    }
  | { type: "resize"; width: number; height: number; pixelRatio: number }
  | { type: "pointer"; x: number; y: number }
  | { type: "reset-pointer" };

let controller: SceneController | undefined;

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  try {
    if (message.type === "initialize") {
      controller = createThreeScene(
        message.canvas,
        message.width,
        message.height,
        message.pixelRatio,
        message.reduceMotion,
        () => self.postMessage({ type: "ready" }),
      );
      return;
    }

    if (message.type === "resize") {
      controller?.resize(message.width, message.height, message.pixelRatio);
      return;
    }

    if (message.type === "pointer") {
      controller?.setPointer(message.x, message.y);
      return;
    }

    controller?.resetPointer();
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};

export {};
