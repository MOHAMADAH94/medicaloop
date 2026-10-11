import { useEffect, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  CircleGeometry,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Object3D,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { BuiltModel, PinPos } from './shared';
import { disposeBuiltModel } from './loadHraModel';

export type PinMeta = { id: string; label: string; color: string };

type Props = {
  createModel: () => BuiltModel;
  loadModel?: () => Promise<BuiltModel>;
  pinMeta: PinMeta[];
  selectedId?: string;
  activeIds?: string[];
  onSelect?: (id: string, label: string) => void;
  onHover?: (id: string | null) => void;
  pickMeshes?: boolean;
  height?: number;
  loadingLabel?: string;
  credit?: string;
};

export default function Medical3DViewport({
  createModel,
  loadModel,
  pinMeta,
  selectedId,
  activeIds = [],
  onSelect,
  onHover,
  pickMeshes = true,
  height = 440,
  loadingLabel = '…',
  credit,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinEls = useRef<Record<string, HTMLButtonElement | null>>({});
  const modelRef = useRef<BuiltModel | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  const activeRef = useRef(activeIds);
  const hoverRef = useRef<string | null>(null);
  const pickRef = useRef(pickMeshes);
  const onSelectRef = useRef(onSelect);
  const onHoverRef = useRef(onHover);
  const pinMetaRef = useRef(pinMeta);

  selectedRef.current = selectedId;
  activeRef.current = activeIds;
  pickRef.current = pickMeshes;
  onSelectRef.current = onSelect;
  onHoverRef.current = onHover;
  pinMetaRef.current = pinMeta;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.setClearColor(0xe8eef4, 1);

    const scene = new Scene();
    scene.background = new Color(0xe8eef4);

    const camera = new PerspectiveCamera(36, 1, 0.05, 40);
    camera.position.set(1.4, 1.1, 2.2);

    scene.add(new AmbientLight(0xffffff, 0.42));
    const hemi = new HemisphereLight(0xf4f8fc, 0xbcaaa4, 0.95);
    scene.add(hemi);
    const key = new DirectionalLight(0xfff6ea, 1.55);
      key.position.set(2.2, 4.2, 3.2);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.4;
      key.shadow.camera.far = 14;
      scene.add(key);
      const fill = new DirectionalLight(0xd6e7ff, 0.58);
      fill.position.set(-2.8, 1.8, 2.2);
      scene.add(fill);
      const rim = new DirectionalLight(0xffffff, 0.42);
      rim.position.set(0.2, 2.6, -3.2);
      scene.add(rim);

    const ground = new Mesh(
      new CircleGeometry(1.55, 48),
      new MeshStandardMaterial({ color: 0xd5dee6, roughness: 0.92, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 0.45;
    controls.maxDistance = 8;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.target.set(0, 0.55, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
    });

    const raycaster = new Raycaster();
    const pointer = new Vector2();
    const projected = new Vector3();
    let pointerDown = { x: 0, y: 0 };

    const size = () => {
      const w = wrap.clientWidth || 320;
      const h = wrap.clientHeight || height;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(wrap);

    const applyHighlights = () => {
      const model = modelRef.current;
      if (!model) return;
      const selected = selectedRef.current;
      const active = activeRef.current;
      const hovered = hoverRef.current;
      model.group.traverse((obj) => {
        if (!(obj instanceof Mesh)) return;
        const id = obj.userData.zoneId as string | undefined;
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const raw of mats) {
          const mat = raw as MeshStandardMaterial;
          if (!id || !mat?.emissive) continue;
          if (id === selected) {
            mat.emissive.setHex(0x1565c0);
            mat.emissiveIntensity = 0.42;
          } else if (id === hovered) {
            mat.emissive.setHex(0xef6c00);
            mat.emissiveIntensity = 0.28;
          } else if (active.includes(id)) {
            mat.emissive.setHex(0xf9a825);
            mat.emissiveIntensity = 0.16;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      });
    };

    const updatePins = () => {
      const model = modelRef.current;
      if (!model) return;
      const w = wrap.clientWidth || 1;
      const h = wrap.clientHeight || 1;
      const wanted = new Set(pinMetaRef.current.map((p) => p.id));
      for (const pin of model.pins) {
        const el = pinEls.current[pin.id];
        if (!el) continue;
        if (!wanted.has(pin.id)) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }
        projected.set(pin.position[0], pin.position[1], pin.position[2]);
        projected.project(camera);
        const x = (projected.x * 0.5 + 0.5) * w;
        const y = (-projected.y * 0.5 + 0.5) * h;
        const visible = projected.z > -1 && projected.z < 1 && projected.x > -1.15 && projected.x < 1.15;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        el.style.opacity = visible ? '1' : '0';
        el.style.pointerEvents = visible ? 'auto' : 'none';
        el.style.zIndex = String(20 + Math.round((1 - projected.z) * 80));
      }
    };

    const pickId = (clientX: number, clientY: number) => {
      const model = modelRef.current;
      if (!model) return null;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(model.group, true);
      for (const hit of hits) {
        let obj: Object3D | null = hit.object;
        while (obj) {
          const id = obj.userData.zoneId as string | undefined;
          if (id) return id;
          obj = obj.parent;
        }
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDown = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDown.x;
      const dy = e.clientY - pointerDown.y;
      if (dx * dx + dy * dy > 16) return;
      if (!pickRef.current) return;
      const id = pickId(e.clientX, e.clientY);
      if (!id) return;
      const meta = pinMetaRef.current.find((p) => p.id === id);
      onSelectRef.current?.(id, meta?.label ?? id);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pickRef.current) return;
      const id = pickId(e.clientX, e.clientY);
      if (hoverRef.current !== id) {
        hoverRef.current = id;
        onHoverRef.current?.(id);
      }
      canvas.style.cursor = id ? 'pointer' : 'grab';
    };
    const onPointerLeave = () => {
      hoverRef.current = null;
      onHoverRef.current?.(null);
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);

    const setLoading = (on: boolean) => {
      if (loadingRef.current) loadingRef.current.style.display = on ? 'flex' : 'none';
    };

    const attachModel = (built: BuiltModel) => {
      const previous = modelRef.current;
      if (previous) {
        scene.remove(previous.group);
        disposeBuiltModel(previous);
      }
      modelRef.current = built;
      scene.add(built.group);
      camera.position.set(...built.camera.position);
      controls.target.set(...built.camera.target);
      setLoading(false);
    };

    let cancelled = false;
    setLoading(Boolean(loadModel));
    const boot = loadModel
      ? loadModel().catch(() => createModel())
      : Promise.resolve(createModel());
    void boot.then((built) => {
      if (cancelled) {
        disposeBuiltModel(built);
        return;
      }
      attachModel(built);
    });

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      controls.update();
      applyHighlights();
      renderer.render(scene, camera);
      updatePins();
    };
    tick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      controls.dispose();
      if (modelRef.current) disposeBuiltModel(modelRef.current);
      ground.geometry.dispose();
      (ground.material as MeshStandardMaterial).dispose();
      renderer.dispose();
      modelRef.current = null;
    };
  }, [createModel, loadModel, height]);

  return (
    <div>
      <div
        ref={wrapRef}
        style={{
          position: 'relative',
          height,
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'radial-gradient(ellipse at 50% 20%, #ffffff 0%, #e8eef4 55%, #cfd8e3 100%)',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab', touchAction: 'none' }} />
        <div
          ref={loadingRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(232,238,244,0.78)',
            zIndex: 30,
            color: '#455A64',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {loadingLabel}
        </div>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {pinMeta.map((pin, i) => (
            <button
              key={pin.id}
              ref={(el) => { pinEls.current[pin.id] = el; }}
              type="button"
              title={pin.label}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(pin.id, pin.label);
              }}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: selectedId === pin.id ? 26 : 22,
                height: selectedId === pin.id ? 26 : 22,
                borderRadius: '50%',
                border: `2px solid ${pin.color}`,
                background: selectedId === pin.id ? pin.color : activeIds.includes(pin.id) ? '#FFF8E1' : '#fff',
                color: selectedId === pin.id ? '#fff' : '#263238',
                fontWeight: 800,
                fontSize: 11,
                boxShadow: '0 2px 8px rgba(0,0,0,0.28)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                padding: 0,
                opacity: 0,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      {credit && (
        <p style={{ margin: '8px 0 0', textAlign: 'center', fontSize: 11, color: '#607D8B', lineHeight: 1.45 }}>
          {credit}
        </p>
      )}
    </div>
  );
}

export type { PinPos };
