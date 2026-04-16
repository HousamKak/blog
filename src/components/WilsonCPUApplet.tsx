import { useEffect, useRef } from 'react';

interface WilsonCPUAppletProps {
  /** Canvas resolution (width in pixels) */
  resolution?: number;
  /** World coordinate dimensions */
  worldWidth?: number;
  worldHeight?: number;
  worldCenterX?: number;
  worldCenterY?: number;
  /** Draggable points: { id: [x, y] } */
  draggables?: Record<string, [number, number]>;
  /** JS function body to run on each frame. Has access to `wilson`. */
  drawFrame: string;
  /** JS function body called on drag. Has access to `wilson`, `id`, `x`, `y`. */
  onDrag?: string;
  /** Enable fullscreen button */
  fullscreen?: boolean;
  /** Enable reset button */
  resetButton?: boolean;
  /** Fill screen when fullscreen */
  fillScreen?: boolean;
  /** Aspect ratio as a string like "1/1" */
  aspectRatio?: string;
}

export default function WilsonCPUApplet({
  resolution = 800,
  worldWidth,
  worldHeight,
  worldCenterX,
  worldCenterY,
  draggables,
  drawFrame: drawFrameBody,
  onDrag,
  fullscreen = true,
  resetButton = true,
  fillScreen = false,
  aspectRatio,
}: WilsonCPUAppletProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wilsonRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;

    async function init() {
      const wilsonUrl = new URL('/lib/wilson/wilson.js', window.location.origin).href;
      const { WilsonCPU } = await import(/* @vite-ignore */ wilsonUrl);

      if (destroyed) return;

      const drawFn = new Function('wilson', drawFrameBody);

      const options: any = {
        canvasWidth: resolution,
        onResizeCanvas: () => drawFn(wilson),

        ...(worldWidth != null && { worldWidth }),
        ...(worldHeight != null && { worldHeight }),
        ...(worldCenterX != null && { worldCenterX }),
        ...(worldCenterY != null && { worldCenterY }),
      };

      if (resetButton) {
        options.useResetButton = true;
        options.resetButtonIconPath = '/lib/wilson/reset.png';
      }

      if (fullscreen) {
        options.fullscreenOptions = {
          fillScreen,
          useFullscreenButton: true,
          enterFullscreenButtonIconPath: '/lib/wilson/enter-fullscreen.png',
          exitFullscreenButtonIconPath: '/lib/wilson/exit-fullscreen.png',
        };
      }

      if (draggables) {
        options.draggableOptions = {
          draggables,
          callbacks: {
            drag: ({ id, x, y }: { id: string; x: number; y: number }) => {
              if (onDrag) {
                const fn = new Function('wilson', 'id', 'x', 'y', onDrag);
                fn(wilson, id, x, y);
              }
              drawFn(wilson);
            },
          },
        };
      }

      const wilson = new WilsonCPU(canvas, options);
      wilsonRef.current = wilson;

      drawFn(wilson);
    }

    init();

    return () => {
      destroyed = true;
      if (wilsonRef.current) {
        wilsonRef.current.destroy();
        wilsonRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="wilson-applet"
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        margin: '1.5em 0',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: `${resolution}px`,
          borderRadius: '0.75rem',
          border: '1px solid var(--color-border)',
          ...(aspectRatio ? { aspectRatio } : {}),
        }}
      />
    </div>
  );
}
