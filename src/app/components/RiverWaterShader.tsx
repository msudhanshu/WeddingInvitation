import React, { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from './ImageWithFallback';

const VERT = `
attribute vec2 a_p;
attribute vec2 a_uv;
varying vec2 v_uv;
void main(void) {
  v_uv = a_uv;
  gl_Position = vec4(a_p, 0.0, 1.0);
}
`;

/**
 * Warp follows the illustration: **uv.y = 0** bottom (foreground boat), **uv.y = 1** top (distant river).
 * Use same UV as flipped texture upload (no manual Y flip — avoids inverted flow).
 */
const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform float u_time;
varying vec2 v_uv;

void main(void) {
  vec2 uv = v_uv;

  /* 1 at bottom/front; ~0 toward top/back — foreground moves more than distant water */
  float fore = 1.0 - smoothstep(0.2, 0.88, uv.y);
  /* Extra calm in the distant channel (narrow + busy-looking if we stripe it too hard) */
  float backEase = smoothstep(0.55, 1.0, uv.y);
  /* Longer waves up top = less “white noise” where the river is narrow */
  float waveScale = mix(0.58, 1.0, fore);

  float t = u_time;
  /* Down-screen current (matches river running from mountains toward viewer) */
  vec2 downstream = normalize(vec2(0.035, -1.0));

  float fq = mix(11.5, 20.5, fore) * waveScale;

  float w1 = sin(dot(uv * fq, downstream) + t * 1.0);
  float w2 =
    sin(uv.x * (17.5 * waveScale + 11. * fore) - t * 0.82) *
    cos(uv.y * (12. + 11. * fore) - t * 0.71);
  float w3 = sin((uv.x * 34. + uv.y * 28.) * waveScale - t * 1.05);

  float combine = clamp(w1 * 0.4 + w2 * 0.38 + w3 * 0.28, -1.0, 1.0);
  float shimmer = smoothstep(-0.45, 0.45, combine);

  vec2 warp;
  warp.x = (w2 + w3 * 0.28) * (0.0042 * fore + 0.00075);
  warp.y = (w1 + w3 * 0.22) * (0.0049 * fore + 0.00085);
  warp -= downstream *
    sin(uv.y * 8.8 + t * 0.38) *
    (0.0029 * fore + 0.00045);
  warp *= (1.0 - backEase * 0.72);

  vec4 col =
    texture2D(u_tex, clamp(uv + warp, 0.002, 0.998));

  /* Soft matte edge vs hard discard “patches” on alpha fringe */
  if (col.a < 0.016) discard;
  float edge = smoothstep(0.016, 0.09, col.a);

  /* Subtle luminance only — no blue vector add (that + screen blend read as milky white bands) */
  float lift = shimmer * fore * (0.028 - backEase * 0.014);
  vec3 rgb = col.rgb * (1.0 + lift);
  rgb = clamp(rgb, 0.0, 1.0);

  gl_FragColor = vec4(rgb, col.a * edge);
}
`;

function compileShader(gl: WebGLRenderingContext, type: GLenum, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.warn('[RiverWaterShader]', gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
  const p = gl.createProgram();
  if (!p) return null;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    // eslint-disable-next-line no-console
    console.warn('[RiverWaterShader]', gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    return null;
  }
  return p;
}

interface RiverWaterShaderProps {
  textureSrc: string;
  /** When WebGL / load fails or reduced motion — static plate. */
  imgClassName: string;
}

export function RiverWaterShader({ textureSrc, imgClassName }: RiverWaterShaderProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (reduced) return undefined;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      powerPreference: 'low-power',
    });
    if (!gl) {
      setFallback(true);
      return undefined;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      setFallback(true);
      return undefined;
    }
    const prog = linkProgram(gl, vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!prog) {
      setFallback(true);
      return undefined;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const quad = new Float32Array([
      -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const locP = gl.getAttribLocation(prog, 'a_p');
    const locUv = gl.getAttribLocation(prog, 'a_uv');

    gl.useProgram(prog);
    gl.enableVertexAttribArray(locP);
    gl.enableVertexAttribArray(locUv);
    gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(locUv, 2, gl.FLOAT, false, 16, 8);

    const uTex = gl.getUniformLocation(prog, 'u_tex');
    const uTime = gl.getUniformLocation(prog, 'u_time');

    const tex = gl.createTexture();
    const img = new Image();
    img.decoding = 'async';

    let alive = true;
    let raf = 0;
    let ro: ResizeObserver | null = null;

    function resizeGl() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.floor(wrap!.clientWidth * dpr));
      const h = Math.max(2, Math.floor(wrap!.clientHeight * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      gl.viewport(0, 0, w, h);
    }

    img.onload = () => {
      if (!alive) return;

      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      gl.enable(gl.BLEND);
      gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      ro = new ResizeObserver(() => resizeGl());
      ro.observe(wrap);
      resizeGl();

      const t0 = performance.now();

      function frame(now: number) {
        if (!alive) return;
        raf = requestAnimationFrame(frame);
        resizeGl();
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(locP);
        gl.enableVertexAttribArray(locUv);
        gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(locUv, 2, gl.FLOAT, false, 16, 8);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(uTex, 0);
        gl.uniform1f(uTime, (now - t0) / 1000);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      raf = requestAnimationFrame(frame);
    };

    img.onerror = () => {
      if (alive) setFallback(true);
    };

    img.src = textureSrc;

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [textureSrc, reduced]);

  if (reduced || fallback) {
    return <ImageWithFallback src={textureSrc} alt="" draggable={false} className={imgClassName} />;
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
