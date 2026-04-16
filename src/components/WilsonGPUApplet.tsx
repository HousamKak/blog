import { useEffect, useRef } from 'react';

interface WilsonGPUAppletProps {
  /** GLSL fragment shader source */
  shader: string;
  /** Canvas resolution (width in pixels) */
  resolution?: number;
  /** Uniform initial values */
  uniforms?: Record<string, unknown>;
  /** World coordinate dimensions & bounds */
  worldWidth?: number;
  worldHeight?: number;
  worldCenterX?: number;
  worldCenterY?: number;
  minWorldWidth?: number;
  minWorldHeight?: number;
  minWorldX?: number;
  maxWorldX?: number;
  minWorldY?: number;
  maxWorldY?: number;
  /** Enable pan & zoom interaction */
  panAndZoom?: boolean;
  /** Draggable points: { id: [x, y] } */
  draggables?: Record<string, [number, number]>;
  /** Called when a draggable moves — receives (wilson, id, x, y) */
  onDrag?: string;
  /** Called after pan/zoom — receives (wilson) */
  onPanAndZoom?: string;
  /** Enable fullscreen button */
  fullscreen?: boolean;
  /** Enable reset button */
  resetButton?: boolean;
  /** Fill screen when fullscreen (vs preserve aspect ratio) */
  fillScreen?: boolean;
  /** Aspect ratio as a string like "16/9" or "1/1" */
  aspectRatio?: string;
}

export default function WilsonGPUApplet({
  shader,
  resolution = 1000,
  uniforms,
  worldWidth,
  worldHeight = 3,
  worldCenterX,
  worldCenterY,
  minWorldWidth,
  minWorldHeight,
  minWorldX,
  maxWorldX,
  minWorldY,
  maxWorldY,
  panAndZoom = true,
  draggables,
  onDrag,
  onPanAndZoom,
  fullscreen = true,
  resetButton = true,
  fillScreen = true,
  aspectRatio,
}: WilsonGPUAppletProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wilsonRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let destroyed = false;

    async function init() {
      // Dynamic import bypasses Vite's bundler — Wilson stays as a runtime ES module
      const wilsonUrl = new URL('/lib/wilson/wilson.js', window.location.origin).href;
      const { WilsonGPU } = await import(/* @vite-ignore */ wilsonUrl);

      if (destroyed) return;

      const options: any = {
        shader,
        canvasWidth: resolution,

        ...(worldWidth != null && { worldWidth }),
        ...(worldHeight != null && { worldHeight }),
        ...(worldCenterX != null && { worldCenterX }),
        ...(worldCenterY != null && { worldCenterY }),
        ...(minWorldWidth != null && { minWorldWidth }),
        ...(minWorldHeight != null && { minWorldHeight }),
        ...(minWorldX != null && { minWorldX }),
        ...(maxWorldX != null && { maxWorldX }),
        ...(minWorldY != null && { minWorldY }),
        ...(maxWorldY != null && { maxWorldY }),

        ...(uniforms && { uniforms }),
      };

      // Build a drawFrame that updates world uniforms and redraws.
      // We need the wilson instance, so we define it as a closure after construction.
      let drawFrame: () => void;

      if (panAndZoom) {
        options.interactionOptions = {
          useForPanAndZoom: true,
          onPanAndZoom: () => drawFrame(),
        };
      }

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
                // onDrag is a function body string: has access to `wilson`, `id`, `x`, `y`
                const fn = new Function('wilson', 'id', 'x', 'y', onDrag);
                fn(wilson, id, x, y);
              }
            },
          },
        };
      }

      options.onResizeCanvas = () => drawFrame?.();

      const wilson = new WilsonGPU(canvas, options);
      wilsonRef.current = wilson;

      drawFrame = () => {
        wilson.setUniforms({
          worldCenter: [wilson.worldCenterX, wilson.worldCenterY],
          worldSize: [wilson.worldWidth, wilson.worldHeight],
        });
        wilson.drawFrame();

        if (onPanAndZoom) {
          const fn = new Function('wilson', onPanAndZoom);
          fn(wilson);
        }
      };

      drawFrame();
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
      ref={containerRef}
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
