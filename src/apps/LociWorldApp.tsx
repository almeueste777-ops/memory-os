import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocusStation, type Memory, INITIAL_LOCI_STATIONS } from '../db';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Edit3, 
  Check, 
  Link as LinkIcon, 
  Compass, 
  Eye, 
  Info 
} from 'lucide-react';

interface LociWorldAppProps {
  onOpenViewer?: (memory: Memory) => void;
}

export const LociWorldApp: React.FC<LociWorldAppProps> = ({ onOpenViewer }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stations = useLiveQuery(() => db.loci.orderBy('order').toArray(), []) || INITIAL_LOCI_STATIONS;
  const memories = useLiveQuery(() => db.memories.toArray(), []) || [];

  const [selectedStation, setSelectedStation] = useState<LocusStation | null>(null);
  const [isWalkthroughActive, setIsWalkthroughActive] = useState<boolean>(false);
  const [walkIndex, setWalkIndex] = useState<number>(0);
  const [isEditingMnemonic, setIsEditingMnemonic] = useState<boolean>(false);
  const [editedScene, setEditedScene] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState<string>('');
  const [selectedMemoryId, setSelectedMemoryId] = useState<number | undefined>(undefined);

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 14, 22));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const currentLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const stationMeshesRef = useRef<{ id: string; mesh: THREE.Object3D }[]>([]);

  // Manual camera drag state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 14, 22);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    dirLight.position.set(10, 25, 15);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const centerGlow = new THREE.PointLight(0xa78bfa, 2.5, 30);
    centerGlow.position.set(0, 4, 0);
    scene.add(centerGlow);

    // 5. Holographic Floor Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x4f46e5, 0x1e1b4b);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Outer boundary ring
    const ringGeo = new THREE.RingGeometry(13.8, 14.0, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const boundaryRing = new THREE.Mesh(ringGeo, ringMat);
    boundaryRing.rotation.x = Math.PI / 2;
    boundaryRing.position.y = 0.02;
    scene.add(boundaryRing);

    // Subtle star dust particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 50;
      starPositions[i + 1] = Math.random() * 18 + 0.5;
      starPositions[i + 2] = (Math.random() - 0.5) * 50;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x93c5fd, size: 0.15, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 6. Architectural Loci Monuments
    stationMeshesRef.current = [];

    INITIAL_LOCI_STATIONS.forEach((st) => {
      const group = new THREE.Group();
      group.position.set(st.position[0], 0, st.position[2]);

      // Base Pedestal
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.2;
      base.receiveShadow = true;
      group.add(base);

      // Glowing Aura Ring around pedestal
      const auraRingGeo = new THREE.RingGeometry(1.5, 1.65, 32);
      const auraRingMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(st.color), side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const auraRing = new THREE.Mesh(auraRingGeo, auraRingMat);
      auraRing.rotation.x = Math.PI / 2;
      auraRing.position.y = 0.03;
      group.add(auraRing);

      // Center Monument Iconography by Station
      let monument: THREE.Object3D;

      if (st.id === 'locus-1') {
        // Obsidian Gate
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 }));
        p1.position.set(-0.7, 1.45, 0);
        const p2 = p1.clone();
        p2.position.set(0.7, 1.45, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        top.position.set(0, 2.6, 0);
        const portal = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.2), new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
        portal.position.set(0, 1.4, 0);
        const gateGroup = new THREE.Group();
        gateGroup.add(p1, p2, top, portal);
        monument = gateGroup;
      } else if (st.id === 'locus-2') {
        // Fountain of Light
        const bowlGeo = new THREE.CylinderGeometry(0.8, 0.4, 0.8, 16);
        const bowl = new THREE.Mesh(bowlGeo, new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2 }));
        bowl.position.y = 0.7;
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.3, 2.5, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 }));
        beam.position.y = 1.8;
        const fGroup = new THREE.Group();
        fGroup.add(bowl, beam);
        monument = fGroup;
      } else if (st.id === 'locus-3') {
        // Alchemist Table & Polyhedron
        const table = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        table.position.y = 0.6;
        const crystal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4), new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.1 }));
        crystal.position.y = 1.4;
        crystal.name = 'spinning-crystal';
        const tGroup = new THREE.Group();
        tGroup.add(table, crystal);
        monument = tGroup;
      } else if (st.id === 'locus-4') {
        // Celestial Wireframe Globe
        const globe = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true }));
        globe.position.y = 1.5;
        globe.name = 'spinning-crystal';
        monument = globe;
      } else if (st.id === 'locus-5') {
        // Crystal Sanctuary
        const icosa = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65), new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.1, metalness: 0.6 }));
        icosa.position.y = 1.5;
        icosa.name = 'spinning-crystal';
        monument = icosa;
      } else if (st.id === 'locus-6') {
        // Zen Bonsai Tree (sculptural pyramid spirals)
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        trunk.position.y = 0.8;
        const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 }));
        canopy.position.y = 1.8;
        const bGroup = new THREE.Group();
        bGroup.add(trunk, canopy);
        monument = bGroup;
      } else if (st.id === 'locus-7') {
        // Mirror of Time
        const slab = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 1.3), new THREE.MeshStandardMaterial({ color: 0xf43f5e, metalness: 0.9, roughness: 0.05 }));
        slab.position.y = 1.4;
        monument = slab;
      } else {
        // Central Zenith Monolith
        const apex = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.8, roughness: 0.1 }));
        apex.position.y = 2.4;
        apex.name = 'spinning-crystal';
        monument = apex;
      }

      group.add(monument);

      // Point Light at station
      const stLight = new THREE.PointLight(new THREE.Color(st.color), 1.2, 6);
      stLight.position.y = 1.8;
      group.add(stLight);

      scene.add(group);
      stationMeshesRef.current.push({ id: st.id, mesh: group });
    });

    // 7. Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      if (!mount) return;
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / mount.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / mount.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersections with all station groups
      for (const item of stationMeshesRef.current) {
        const intersects = raycaster.intersectObjects(item.mesh.children, true);
        if (intersects.length > 0) {
          const st = stations.find((s) => s.id === item.id);
          if (st) {
            selectStation(st);
            setIsWalkthroughActive(false);
          }
          break;
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || isWalkthroughActive) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      // Orbit camera around current target
      const radius = targetCamPosRef.current.distanceTo(currentLookAtRef.current);
      const theta = Math.atan2(targetCamPosRef.current.x - currentLookAtRef.current.x, targetCamPosRef.current.z - currentLookAtRef.current.z) - deltaX * 0.005;
      const phi = Math.max(0.2, Math.min(Math.PI / 2.2, Math.acos((targetCamPosRef.current.y - currentLookAtRef.current.y) / radius) - deltaY * 0.005));

      targetCamPosRef.current.x = currentLookAtRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
      targetCamPosRef.current.y = currentLookAtRef.current.y + radius * Math.cos(phi);
      targetCamPosRef.current.z = currentLookAtRef.current.z + radius * Math.sin(phi) * Math.cos(theta);

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.002;
      const dir = targetCamPosRef.current.clone().sub(currentLookAtRef.current).normalize();
      const dist = targetCamPosRef.current.distanceTo(currentLookAtRef.current);
      const newDist = Math.max(5, Math.min(35, dist + e.deltaY * zoomSpeed * 5));
      targetCamPosRef.current.copy(currentLookAtRef.current).add(dir.multiplyScalar(newDist));
    };

    mount.addEventListener('click', handleCanvasClick);
    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    mount.addEventListener('wheel', handleWheel, { passive: false });

    // 8. Animation & Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation (lerp)
      camera.position.lerp(targetCamPosRef.current, 0.05);
      currentLookAtRef.current.lerp(targetLookAtRef.current, 0.05);
      camera.lookAt(currentLookAtRef.current);

      // Rotate decorative crystals
      scene.traverse((obj) => {
        if (obj.name === 'spinning-crystal') {
          obj.rotation.y = elapsedTime * 0.8;
          obj.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
        }
      });

      // Slowly oscillate star dust
      stars.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      mount.removeEventListener('click', handleCanvasClick);
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mount.removeEventListener('wheel', handleWheel);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update camera focus when a station is selected
  const selectStation = (st: LocusStation) => {
    setSelectedStation(st);
    setEditedScene(st.mnemonicScene || '');
    setEditedTitle(st.customTitle || st.name);
    setSelectedMemoryId(st.memoryId);
    setIsEditingMnemonic(false);

    // Position camera near the station looking at it
    const stPos = new THREE.Vector3(st.position[0], st.position[1], st.position[2]);
    const offsetDir = stPos.clone().normalize();
    if (offsetDir.length() === 0) offsetDir.set(0, 0, 1);

    targetCamPosRef.current.set(
      st.position[0] + offsetDir.x * 4.5,
      st.position[1] + 2.5,
      st.position[2] + offsetDir.z * 4.5
    );
    targetLookAtRef.current.set(st.position[0], st.position[1] + 0.5, st.position[2]);
  };

  // Reset view to wide angle
  const handleResetCamera = () => {
    setSelectedStation(null);
    setIsWalkthroughActive(false);
    targetCamPosRef.current.set(0, 14, 22);
    targetLookAtRef.current.set(0, 1, 0);
  };

  // Walkthrough mode sequential stepper
  useEffect(() => {
    if (!isWalkthroughActive) return;

    const currentSt = stations[walkIndex];
    if (currentSt) {
      selectStation(currentSt);
    }

    const timer = setTimeout(() => {
      if (walkIndex < stations.length - 1) {
        setWalkIndex((prev) => prev + 1);
      } else {
        setIsWalkthroughActive(false);
        setWalkIndex(0);
      }
    }, 6000); // 6 seconds per locus

    return () => clearTimeout(timer);
  }, [isWalkthroughActive, walkIndex, stations]);

  const handleToggleWalk = () => {
    if (!isWalkthroughActive) {
      setIsWalkthroughActive(true);
      setWalkIndex(0);
    } else {
      setIsWalkthroughActive(false);
    }
  };

  const handleNextStation = () => {
    const currentOrder = selectedStation ? selectedStation.order : 0;
    const nextSt = stations.find((s) => s.order === (currentOrder % stations.length) + 1);
    if (nextSt) selectStation(nextSt);
  };

  const handlePrevStation = () => {
    const currentOrder = selectedStation ? selectedStation.order : 1;
    const prevOrder = currentOrder === 1 ? stations.length : currentOrder - 1;
    const prevSt = stations.find((s) => s.order === prevOrder);
    if (prevSt) selectStation(prevSt);
  };

  const handleSaveLocusEdits = async () => {
    if (!selectedStation) return;
    await db.loci.update(selectedStation.id, {
      customTitle: editedTitle.trim(),
      mnemonicScene: editedScene.trim(),
      memoryId: selectedMemoryId,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingMnemonic(false);
  };

  const linkedMemory = selectedStation?.memoryId
    ? memories.find((m) => m.id === selectedStation.memoryId)
    : null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060913] select-none text-slate-200">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Header & Walkthrough Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Title Badge */}
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center space-x-2.5 pointer-events-auto border border-white/15 shadow-xl">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/40 shadow-sm">
            <Compass size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Palatul Virtual Loci</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-full border border-indigo-500/30">
                3D World
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Traseu spatial de 8 stații neuronale • Fără intersecții
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Walkthrough Button */}
          <button
            onClick={handleToggleWalk}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg border ${
              isWalkthroughActive
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 ring-2 ring-amber-500/40 animate-pulse'
                : 'glass-panel hover:bg-white/10 text-white border-white/20'
            }`}
          >
            {isWalkthroughActive ? <Pause size={14} /> : <Play size={14} />}
            <span>{isWalkthroughActive ? `Tur Activ (Stația ${walkIndex + 1}/8)` : 'Parcurge Traseul Mental'}</span>
          </button>

          {/* Reset Overview */}
          <button
            onClick={handleResetCamera}
            className="glass-panel hover:bg-white/10 p-2 rounded-xl text-slate-300 hover:text-white border border-white/15 transition-all shadow-md"
            title="Vedere de ansamblu"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Station Selector Bar at Bottom */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center space-x-1.5 glass-panel p-1.5 rounded-2xl border border-white/15 shadow-2xl overflow-x-auto max-w-[92vw]">
        <button
          onClick={handlePrevStation}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
          title="Stația precedentă"
        >
          <ChevronLeft size={16} />
        </button>

        {stations.map((st) => {
          const isSelected = selectedStation?.id === st.id;
          return (
            <button
              key={st.id}
              onClick={() => {
                selectStation(st);
                setIsWalkthroughActive(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center space-x-1.5 border ${
                isSelected
                  ? 'bg-indigo-600/50 border-indigo-400 text-white shadow-lg'
                  : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${st.color}33`, color: st.color }}>
                {st.order}
              </span>
              <span className="truncate max-w-[120px]">{st.name}</span>
            </button>
          );
        })}

        <button
          onClick={handleNextStation}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white shrink-0"
          title="Stația următoare"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Station Details Card Overlay (When a station is active) */}
      {selectedStation && (
        <div className="absolute top-20 right-5 z-20 w-80 sm:w-96 glass-window p-5 rounded-2xl border border-white/20 shadow-2xl animate-scale-up space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: `${selectedStation.color}40`, color: selectedStation.color }}
              >
                {selectedStation.order}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedStation.name}</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{selectedStation.room}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingMnemonic(!isEditingMnemonic)}
              className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Edit3 size={12} />
              <span>{isEditingMnemonic ? 'Anulează' : 'Personalizează'}</span>
            </button>
          </div>

          {/* Mnemonic Anchor Content */}
          {isEditingMnemonic ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Titlu Concept / Gând
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                  placeholder="Ex: Citat Seneca, Numărul de card, Formule..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Scena Mnemotehnică Vizuală (Principiul V.A.E.)
                </label>
                <textarea
                  rows={3}
                  value={editedScene}
                  onChange={(e) => setEditedScene(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-white focus:outline-none resize-none"
                  placeholder="Descrie o imagine bizară, animată și plină de emoție așezată pe această stație..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
                  Leagă cu o amintire din Seif (Opțional)
                </label>
                <select
                  value={selectedMemoryId || ''}
                  onChange={(e) => setSelectedMemoryId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-xs text-slate-300 focus:outline-none"
                >
                  <option value="">-- Fără legătură directă --</option>
                  {memories.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveLocusEdits}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                <Check size={14} />
                <span>Fixează în Palat</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Concept Ancorat
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {selectedStation.customTitle || selectedStation.name}
                </div>
              </div>

              <div className="glass-card rounded-xl p-3 border border-white/10 bg-black/20">
                <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <Sparkles size={11} /> Scenă Mnemotehnică Activă:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  „{selectedStation.mnemonicScene || 'Nicio scenă mnemotehnică definită încă. Apasă pe Personalizează pentru a depune o imagine aici.'}”
                </p>
              </div>

              {linkedMemory && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-indigo-300 truncate max-w-[200px]">
                    <LinkIcon size={12} className="shrink-0" />
                    <span className="truncate">{linkedMemory.title}</span>
                  </div>
                  {onOpenViewer && (
                    <button
                      onClick={() => onOpenViewer(linkedMemory)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                    >
                      <Eye size={12} />
                      <span>Deschide</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Instructions Tooltip on First Visit */}
      <div className="absolute top-20 left-4 z-10 glass-panel p-2.5 rounded-xl border border-white/10 max-w-xs text-[11px] text-slate-400 space-y-1 hidden md:block">
        <div className="font-semibold text-slate-200 flex items-center gap-1">
          <Info size={13} className="text-indigo-400" />
          <span>Navigare în Lumea Virtuală:</span>
        </div>
        <p>• Trage cu mouse-ul pentru a roti camera în jurul palatului.</p>
        <p>• Rotiță mouse pentru zoom in/out.</p>
        <p>• Click pe oricare din cele 8 monumente pentru a-l explora sau personaliza.</p>
      </div>
    </div>
  );
};
