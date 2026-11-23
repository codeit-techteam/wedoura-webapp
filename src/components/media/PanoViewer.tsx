"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import "@/styles/pano-viewer.css";

export type PanoScene = {
  id: string;
  name: string;
  /** Equirectangular image URL (2:1). */
  src: string;
  /** Optional small poster for the scene chip and start button. */
  posterSrc?: string;
};

export type PanoComingSoon = {
  name: string;
  posterSrc?: string;
};

type Props = {
  scenes: PanoScene[];
  comingSoon?: PanoComingSoon[];
  /** Under the start button. Defaults to "Tap to load". */
  loadHint?: string;
  note?: string;
  className?: string;
  /** `tour` = venue section chrome; `inline` = fill a parent (lightbox / studio). */
  variant?: "tour" | "inline";
  /** Skip the poster and load the first (or initial) scene immediately. */
  autoStart?: boolean;
  initialSceneId?: string;
  /** Degrees; applied when a scene loads. */
  startYawDeg?: number;
  autorotate?: boolean;
  onYawChange?: (yawDeg: number) => void;
  /** External load request (e.g. space card "360° view"). */
  loadRequest?: { sceneId: string; nonce: number } | null;
  /** Hide scene strip (single-photo inline use). */
  hideScenes?: boolean;
};

const VS =
  "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS =
  "precision mediump float;uniform sampler2D t;uniform vec2 r;uniform float y,x,f;void main(){vec2 u=(gl_FragCoord.xy/r)*2.-1.;u.x*=r.x/r.y;vec3 d=normalize(vec3(u.x*tan(f*.5),u.y*tan(f*.5),1.));float cp=cos(x),sp=sin(x);d=vec3(d.x,d.y*cp+d.z*sp,-d.y*sp+d.z*cp);float cy=cos(y),sy=sin(y);d=vec3(d.x*cy+d.z*sy,d.y,-d.x*sy+d.z*cy);float lon=atan(d.x,d.z),lat=asin(clamp(d.y,-1.,1.));gl_FragColor=texture2D(t,vec2(lon/6.2831853+.5,.5-lat/3.1415927));}";

const PMAX = 0.14;

type Drag = { x: number; y: number; yw: number; pt: number };

type Engine = {
  load: (j: number) => void;
  destroy: () => void;
};

/**
 * Exact 360° WebGL viewer from the venue reference script.js.
 * Same shaders, pitch limit (PMAX 0.14), drag/keyboard/wheel speeds,
 * auto-rotate, zoom buttons, full screen, and pause when off screen.
 * Only React wiring (refs, effects, cleanup) and URL-based scenes differ.
 */
export function PanoViewer({
  scenes,
  comingSoon = [],
  loadHint = "Tap to load",
  note,
  className,
  variant = "tour",
  autoStart = false,
  initialSceneId,
  startYawDeg = 0,
  autorotate = true,
  onYawChange,
  loadRequest,
  hideScenes = false,
}: Props) {
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const pvRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  const loadElRef = useRef<HTMLDivElement>(null);
  const scenesElRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const onYawRef = useRef(onYawChange);
  const [current, setCurrent] = useState(0);
  const [showStart, setShowStart] = useState(!autoStart);

  useEffect(() => {
    onYawRef.current = onYawChange;
  }, [onYawChange]);

  useEffect(() => {
    if (scenes.length === 0) return;
    const pvEl = pvRef.current;
    if (!pvEl) return;
    const pv: HTMLDivElement = pvEl;

    let disposed = false;
    let cv: HTMLCanvasElement | null = null;
    let gl: WebGLRenderingContext | null = null;
    let tex: WebGLTexture | null = null;
    let prog: WebGLProgram | null = null;
    const U: Record<string, WebGLUniformLocation | null> = {};
    let yaw = (startYawDeg * Math.PI) / 180;
    let pitch = 0;
    let fov = 1.15;
    let auto = autorotate;
    let need = true;
    let vis = true;
    let cur = -1;
    let last = 0;
    let running = false;
    let raf = 0;
    let dn: Drag | null = null;
    let io: IntersectionObserver | null = null;
    let hintEl: HTMLSpanElement | null = null;
    let nameEl: HTMLSpanElement | null = null;
    let autoBtn: HTMLButtonElement | null = null;
    let fullBtn: HTMLButtonElement | null = null;

    const startYawRad = () => (startYawDeg * Math.PI) / 180;

    function $(id: string) {
      return document.getElementById(id);
    }

    function sh(type: number, src: string) {
      const o = gl!.createShader(type)!;
      gl!.shaderSource(o, src);
      gl!.compileShader(o);
      return o;
    }

    function zoom(d: number) {
      fov = Math.max(0.75, Math.min(1.25, fov + d));
      need = true;
    }

    function setAuto(a: boolean) {
      auto = a;
      if (autoBtn) autoBtn.setAttribute("aria-pressed", String(a));
    }

    function hint() {
      if (hintEl) hintEl.style.opacity = "0";
    }

    function loop() {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    }

    function frame(t: number) {
      running = false;
      if (disposed || !vis || !gl || !cv) return;
      const dt = last ? Math.min(t - last, 50) : 16;
      last = t;
      if (auto) {
        yaw += dt * 0.00006;
        need = true;
      }
      if (need) {
        const w = cv.clientWidth;
        const h = cv.clientHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
          cv.width = Math.round(w * dpr);
          cv.height = Math.round(h * dpr);
        }
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(U.r, cv.width, cv.height);
        gl.uniform1f(U.y, yaw);
        gl.uniform1f(U.x, pitch);
        gl.uniform1f(U.f, fov);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        need = false;
        if (!auto) {
          onYawRef.current?.((((yaw * 180) / Math.PI) % 360 + 360) % 360);
        }
      }
      if (auto) loop();
      else last = 0;
    }

    function setup(): boolean {
      if (cv) return true;
      cv = document.createElement("canvas");
      cv.setAttribute("role", "img");
      cv.setAttribute("aria-label", "360 degree view. Drag or use arrow keys to look around.");
      cv.tabIndex = 0;
      pv.insertBefore(cv, pv.firstChild);
      gl = cv.getContext("webgl", {
        antialias: false,
        alpha: false,
        preserveDrawingBuffer: false,
      });
      if (!gl) return false;
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const n of ["t", "r", "y", "x", "f"]) U[n] = gl.getUniformLocation(prog, n);
      tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      for (const w of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) {
        gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      // controls — same markup as the reference
      const ui = document.createElement("div");
      ui.innerHTML =
        `<span class="pvhint" id="${uid}-pvHint">Drag to look around</span>` +
        `<span class="pvname" id="${uid}-pvName"></span>` +
        `<div class="pvui">` +
        `<button type="button" id="${uid}-pvAuto" aria-pressed="${auto}" aria-label="Auto-rotate"><svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 11-3-6.3M20 4v5h-5"/></svg></button>` +
        `<button type="button" id="${uid}-pvIn" aria-label="Zoom in">+</button>` +
        `<button type="button" id="${uid}-pvOut" aria-label="Zoom out">−</button>` +
        `<button type="button" id="${uid}-pvFull" aria-pressed="false" aria-label="Full screen"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>` +
        `</div>`;
      while (ui.firstChild) pv.appendChild(ui.firstChild);
      hintEl = $(`${uid}-pvHint`) as HTMLSpanElement;
      nameEl = $(`${uid}-pvName`) as HTMLSpanElement;
      autoBtn = $(`${uid}-pvAuto`) as HTMLButtonElement;
      fullBtn = $(`${uid}-pvFull`) as HTMLButtonElement;

      cv.addEventListener("pointerdown", (e) => {
        dn = { x: e.clientX, y: e.clientY, yw: yaw, pt: pitch };
        cv!.setPointerCapture(e.pointerId);
        setAuto(false);
        hint();
      });
      cv.addEventListener("pointermove", (e) => {
        if (!dn) return;
        const scale = fov / cv!.clientHeight;
        yaw = dn.yw - (e.clientX - dn.x) * scale;
        pitch = Math.max(-PMAX, Math.min(PMAX, dn.pt + (e.clientY - dn.y) * scale));
        need = true;
      });
      cv.addEventListener("pointerup", () => {
        dn = null;
      });
      cv.addEventListener("pointercancel", () => {
        dn = null;
      });
      cv.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          zoom(e.deltaY > 0 ? 0.08 : -0.08);
        },
        { passive: false },
      );
      cv.addEventListener("keydown", (e) => {
        const m: Record<string, [number, number] | undefined> = {
          ArrowLeft: [-0.12, 0],
          ArrowRight: [0.12, 0],
          ArrowUp: [0, -0.05],
          ArrowDown: [0, 0.05],
        };
        const move = m[e.key];
        if (move) {
          e.preventDefault();
          setAuto(false);
          yaw += move[0];
          pitch = Math.max(-PMAX, Math.min(PMAX, pitch + move[1]));
          need = true;
        }
        if (e.key === "+" || e.key === "=") zoom(-0.08);
        if (e.key === "-") zoom(0.08);
      });

      autoBtn.onclick = () => setAuto(!auto);
      $(`${uid}-pvIn`)!.onclick = () => zoom(-0.12);
      $(`${uid}-pvOut`)!.onclick = () => zoom(0.12);
      fullBtn.onclick = () => {
        const on = !pv.classList.contains("full");
        pv.classList.toggle("full", on);
        fullBtn!.setAttribute("aria-pressed", String(on));
        document.body.style.overflow = on ? "hidden" : "";
        need = true;
      };

      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(
          (es) => {
            vis = es[0]?.isIntersecting ?? true;
            if (vis) loop();
          },
          { threshold: 0 },
        );
        io.observe(pv);
      }

      return true;
    }

    function fallback(img: HTMLImageElement) {
      if (loadElRef.current) loadElRef.current.hidden = true;
      startRef.current?.remove();
      setShowStart(false);
      pv.style.overflowX = "auto";
      pv.innerHTML =
        `<img src="${img.src}" alt="Panorama" style="height:100%;width:auto;max-width:none">`;
    }

    function load(j: number) {
      const scene = scenes[j];
      if (!scene || cur === j) return;
      cur = j;
      setCurrent(j);
      setShowStart(false);
      if (loadElRef.current) loadElRef.current.hidden = false;
      scenesElRef.current?.querySelectorAll("[data-s]").forEach((b) => {
        b.setAttribute("aria-pressed", String(+(b as HTMLElement).dataset.s! === j));
      });
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (disposed) return;
        if (!gl && !setup()) {
          fallback(img);
          return;
        }
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGB, gl!.RGB, gl!.UNSIGNED_BYTE, img);
        gl!.uniform1i(U.t, 0);
        yaw = startYawRad();
        pitch = 0;
        need = true;
        if (loadElRef.current) loadElRef.current.hidden = true;
        if (nameEl) nameEl.textContent = scene.name;
        startRef.current?.remove();
        loop();
      };
      img.onerror = () => {
        if (loadElRef.current) loadElRef.current.hidden = true;
      };
      img.src = scene.src;
    }

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && pv.classList.contains("full")) fullBtn?.click();
    };
    const onResize = () => {
      need = true;
    };
    const kick = () => {
      if (need) loop();
    };
    document.addEventListener("keydown", onEsc);
    window.addEventListener("resize", onResize);
    pv.addEventListener("pointermove", kick);
    pv.addEventListener("wheel", () => loop());
    pv.addEventListener("keydown", () => loop());
    pv.addEventListener("click", () => loop());

    engineRef.current = {
      load,
      destroy: () => {
        disposed = true;
        cancelAnimationFrame(raf);
        document.removeEventListener("keydown", onEsc);
        window.removeEventListener("resize", onResize);
        io?.disconnect();
        if (pv.classList.contains("full")) document.body.style.overflow = "";
        if (gl && tex) gl.deleteTexture(tex);
        if (gl && prog) gl.deleteProgram(prog);
        cv?.remove();
        hintEl?.remove();
        nameEl?.remove();
        pv.querySelector(".pvui")?.remove();
        engineRef.current = null;
      },
    };

    if (autoStart) {
      const i = initialSceneId ? scenes.findIndex((sc) => sc.id === initialSceneId) : 0;
      load(i < 0 ? 0 : i);
    }

    return () => {
      engineRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes.map((sc) => `${sc.id}:${sc.src}`).join("|"), uid]);

  useEffect(() => {
    if (!loadRequest) return;
    const j = scenes.findIndex((sc) => sc.id === loadRequest.sceneId);
    if (j < 0) return;
    engineRef.current?.load(j);
  }, [loadRequest, scenes]);

  if (scenes.length === 0) return null;

  const first = scenes[current] ?? scenes[0];
  const poster = first.posterSrc ?? first.src;

  return (
    <div ref={rootRef} className={cn("wedoura-pano", `variant-${variant}`, className)}>
      <div className="pv" ref={pvRef}>
        {showStart && (
          <button
            type="button"
            className="pvpost"
            ref={startRef}
            aria-label={`Start the 360 degree tour of ${first.name}`}
            style={{ backgroundImage: `url(${poster})` }}
            onClick={() => engineRef.current?.load(current)}
          >
            <span className="ring">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <ellipse cx="24" cy="24" rx="20" ry="8" />
                <path d="M24 4v6M24 38v6" />
                <path d="M38 21l4 3-4 3" />
              </svg>
            </span>
            <b>Start the 360° tour</b>
            <small>{loadHint}</small>
          </button>
        )}
        <div className="pvload" ref={loadElRef} hidden>
          Loading the view…
        </div>
      </div>

      {!hideScenes && (scenes.length > 1 || comingSoon.length > 0) && (
        <div className="scenes" ref={scenesElRef} role="group" aria-label="Choose a space">
          {scenes.map((sc, j) => (
            <button
              key={sc.id}
              type="button"
              className="scene"
              data-s={j}
              aria-pressed={current === j}
              onClick={() => engineRef.current?.load(j)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sc.posterSrc ?? sc.src} alt="" />
              {sc.name}
            </button>
          ))}
          {comingSoon.map((sc) => (
            <span key={sc.name} className="scene soon">
              {sc.posterSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sc.posterSrc} alt="" />
              ) : null}
              {sc.name} · 360° coming soon
            </span>
          ))}
        </div>
      )}

      {note && <p className="pvnote">{note}</p>}
    </div>
  );
}
