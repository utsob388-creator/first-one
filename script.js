(() => {
  'use strict';

  const WORLD = { width: 1200, height: 760 };
  const TAU = Math.PI * 2;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Math.round(value));
  const average = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const byId = (id) => document.getElementById(id);

  const CATEGORIES = [
    { id: 'all', label: 'All systems' },
    { id: 'terrain', label: 'Terrain' },
    { id: 'civic', label: 'Civic' },
    { id: 'housing', label: 'Housing' },
    { id: 'food', label: 'Food' },
    { id: 'industry', label: 'Industry' },
    { id: 'energy', label: 'Energy' },
    { id: 'transport', label: 'Transit' },
    { id: 'culture', label: 'Culture' },
    { id: 'utility', label: 'Utility' }
  ];

  const SYSTEMS = [
    { id:'river', category:'terrain', label:'River corridor', icon:'≈', description:'A natural waterway that anchors growth and cools the land.', size: { w: 184, h: 38 }, color:'#57cfe1', shape:'river', tags:['water','green'], effects:{ water:20, green:5, pollution:-2 }, capacity:{ water:80 }, solid:false },
    { id:'lake', category:'terrain', label:'Freshwater lake', icon:'◌', description:'A resilient freshwater reserve with a wide ecological footprint.', size:{ w:122, h:88 }, color:'#51b9d7', shape:'lake', tags:['water','reserve'], effects:{ water:32, green:6, pollution:-3 }, capacity:{ water:130 }, solid:false },
    { id:'forest', category:'terrain', label:'Forest reserve', icon:'♧', description:'Protected canopy that absorbs pressure and preserves biodiversity.', size:{ w:118, h:102 }, color:'#7ed18b', shape:'forest', tags:['green','resilience'], effects:{ green:26, pollution:-10, resilience:8 }, capacity:{ green:85 }, solid:false },
    { id:'park', category:'terrain', label:'Civic park', icon:'✦', description:'Open space that keeps dense districts healthy and connected.', size:{ w:78, h:64 }, color:'#91d89d', shape:'park', tags:['green','civic'], effects:{ green:11, health:5, pollution:-4 }, capacity:{ green:26 }, solid:false },
    { id:'neighborhood', category:'housing', label:'Neighborhood', icon:'⌂', description:'Mid-density homes for a growing population.', size:{ w:80, h:62 }, color:'#e0bd79', shape:'district', tags:['home','people'], effects:{ population:240, health:2 }, capacity:{ housing:240 }, solid:true },
    { id:'apartments', category:'housing', label:'Apartment district', icon:'▥', description:'High-density housing that concentrates opportunity and demand.', size:{ w:74, h:86 }, color:'#f0a86f', shape:'tower', tags:['home','density'], effects:{ population:510, jobs:26, health:-1 }, capacity:{ housing:510 }, solid:true },
    { id:'mixeduse', category:'housing', label:'Mixed-use district', icon:'⌘', description:'Homes, shops and workspaces in one compact urban block.', size:{ w:88, h:72 }, color:'#d8b676', shape:'mixed', tags:['home','jobs'], effects:{ population:340, jobs:70, health:3 }, capacity:{ housing:340 }, solid:true },
    { id:'farm', category:'food', label:'Regenerative farm', icon:'▧', description:'Productive cropland designed to replenish the soil.', size:{ w:116, h:84 }, color:'#b6d274', shape:'farm', tags:['food','green'], effects:{ food:48, jobs:18, green:7, pollution:-2 }, capacity:{ food:120 }, solid:true },
    { id:'greenhouse', category:'food', label:'Vertical greenhouse', icon:'⌇', description:'Protected growing space that keeps food production steady.', size:{ w:66, h:72 }, color:'#90e0a0', shape:'greenhouse', tags:['food','urban'], effects:{ food:31, jobs:13, green:3 }, capacity:{ food:65 }, solid:true },
    { id:'granary', category:'food', label:'Food granary', icon:'◍', description:'Strategic storage that turns a good harvest into resilience.', size:{ w:58, h:62 }, color:'#dbb96b', shape:'granary', tags:['food','reserve'], effects:{ food:20, resilience:12, jobs:5 }, capacity:{ food:42 }, solid:true },
    { id:'cleanfactory', category:'industry', label:'Clean factory', icon:'⚙', description:'Employment and manufacturing without the full environmental cost.', size:{ w:92, h:72 }, color:'#c4a5ff', shape:'factory', tags:['jobs','industry'], effects:{ jobs:160, economy:18, pollution:7 }, capacity:{ jobs:160 }, solid:true },
    { id:'heavyfactory', category:'industry', label:'Heavy industry', icon:'⌁', description:'High-output industry that creates jobs and serious pressure.', size:{ w:116, h:86 }, color:'#f08b83', shape:'factory', tags:['jobs','risk'], effects:{ jobs:250, economy:28, pollution:25, resilience:-5 }, capacity:{ jobs:250 }, solid:true },
    { id:'research', category:'industry', label:'Research campus', icon:'◇', description:'Knowledge infrastructure that improves long-run adaptation.', size:{ w:92, h:74 }, color:'#a7b9ff', shape:'campus', tags:['jobs','future'], effects:{ jobs:115, economy:21, resilience:14, education:10 }, capacity:{ jobs:115 }, solid:true },
    { id:'solar', category:'energy', label:'Solar field', icon:'☼', description:'Quiet renewable generation with a broad land footprint.', size:{ w:112, h:64 }, color:'#f1cb74', shape:'solar', tags:['energy','clean'], effects:{ energy:42, jobs:9, pollution:-7, green:-2 }, capacity:{ energy:125 }, solid:true },
    { id:'wind', category:'energy', label:'Wind farm', icon:'Y', description:'Distributed renewable power that diversifies the grid.', size:{ w:95, h:95 }, color:'#9ce5ee', shape:'wind', tags:['energy','resilience'], effects:{ energy:36, jobs:8, pollution:-6, resilience:9 }, capacity:{ energy:100 }, solid:true },
    { id:'power', category:'energy', label:'Power station', icon:'⚡', description:'Reliable baseline power with a visible emissions cost.', size:{ w:75, h:82 }, color:'#ffae70', shape:'power', tags:['energy','grid'], effects:{ energy:82, jobs:24, pollution:18, resilience:4 }, capacity:{ energy:210 }, solid:true },
    { id:'government', category:'civic', label:'Government center', icon:'▤', description:'A coordination hub for services, policy and trust.', size:{ w:78, h:70 }, color:'#75d5e0', shape:'civic', tags:['civic','services'], effects:{ governance:25, jobs:24, resilience:12 }, capacity:{ governance:100 }, solid:true },
    { id:'hospital', category:'civic', label:'Hospital', icon:'✚', description:'Healthcare coverage that protects the population from shocks.', size:{ w:72, h:68 }, color:'#f49a9a', shape:'hospital', tags:['health','services'], effects:{ health:36, jobs:45, resilience:7 }, capacity:{ health:260 }, solid:true },
    { id:'school', category:'civic', label:'School', icon:'▣', description:'Foundational education for human capital and stability.', size:{ w:68, h:60 }, color:'#e6c778', shape:'school', tags:['education','services'], effects:{ education:27, jobs:24, resilience:5 }, capacity:{ education:220 }, solid:true },
    { id:'university', category:'civic', label:'University', icon:'Δ', description:'Advanced learning that compounds innovation over time.', size:{ w:92, h:72 }, color:'#c8b2ff', shape:'university', tags:['education','future'], effects:{ education:44, jobs:58, economy:15, resilience:12 }, capacity:{ education:370 }, solid:true },
    { id:'emergency', category:'civic', label:'Police / fire complex', icon:'✦', description:'Emergency response that reduces the cost of bad days.', size:{ w:68, h:63 }, color:'#ff9f76', shape:'emergency', tags:['safety','services'], effects:{ safety:31, jobs:30, resilience:10 }, capacity:{ safety:100 }, solid:true },
    { id:'ngo', category:'civic', label:'NGO hub', icon:'∞', description:'Community networks that make the country more adaptive.', size:{ w:62, h:56 }, color:'#86dcb9', shape:'ngo', tags:['community','resilience'], effects:{ governance:12, health:7, resilience:17, jobs:16 }, capacity:{ governance:45 }, solid:true },
    { id:'road', category:'transport', label:'Road link', icon:'╱', description:'A connection line that makes every nearby system more reachable.', size:{ w:150, h:22 }, color:'#a7b1b9', shape:'road', tags:['transit','link'], effects:{ transport:17, jobs:4 }, capacity:{ transport:80 }, solid:false },
    { id:'rail', category:'transport', label:'Rail link', icon:'═', description:'High-capacity movement with less long-run pollution.', size:{ w:164, h:22 }, color:'#a5d5d8', shape:'rail', tags:['transit','clean'], effects:{ transport:29, pollution:-3, jobs:7, resilience:3 }, capacity:{ transport:140 }, solid:false },
    { id:'station', category:'transport', label:'Rail station', icon:'▣', description:'A transit node that turns links into a network.', size:{ w:66, h:62 }, color:'#d4b875', shape:'station', tags:['transit','city'], effects:{ transport:33, jobs:30, economy:7 }, capacity:{ transport:110 }, solid:true },
    { id:'bus', category:'transport', label:'Bus depot', icon:'▰', description:'Flexible public transit for districts beyond the rail line.', size:{ w:67, h:55 }, color:'#8cc8dd', shape:'bus', tags:['transit','city'], effects:{ transport:21, jobs:25, pollution:2 }, capacity:{ transport:75 }, solid:true },
    { id:'airport', category:'transport', label:'Airport / port', icon:'✈', description:'A global gateway that accelerates trade and exposure.', size:{ w:118, h:70 }, color:'#e2b681', shape:'airport', tags:['trade','risk'], effects:{ transport:40, jobs:80, economy:25, pollution:14, resilience:-2 }, capacity:{ transport:180 }, solid:true },
    { id:'stadium', category:'culture', label:'Stadium', icon:'◉', description:'A civic magnet that builds identity, jobs and demand.', size:{ w:94, h:76 }, color:'#e397c4', shape:'stadium', tags:['culture','jobs'], effects:{ jobs:45, governance:5, pollution:3 }, capacity:{ culture:100 }, solid:true },
    { id:'zoo', category:'culture', label:'Biodiversity zoo', icon:'♢', description:'A public habitat that doubles as conservation education.', size:{ w:94, h:78 }, color:'#93d58e', shape:'zoo', tags:['culture','green'], effects:{ green:12, education:10, jobs:26 }, capacity:{ culture:80 }, solid:true },
    { id:'culture', category:'culture', label:'Cultural center', icon:'✧', description:'A place for memory, art and shared civic imagination.', size:{ w:74, h:65 }, color:'#d8a7dc', shape:'culture', tags:['culture','civic'], effects:{ governance:11, education:12, jobs:16, health:4 }, capacity:{ culture:70 }, solid:true },
    { id:'waterplant', category:'utility', label:'Water plant', icon:'≋', description:'Treats and distributes the water a modern country needs.', size:{ w:76, h:67 }, color:'#67cbdc', shape:'waterplant', tags:['water','utility'], effects:{ water:54, jobs:26, resilience:5, pollution:-4 }, capacity:{ water:190 }, solid:true },
    { id:'waste', category:'utility', label:'Waste treatment', icon:'♻', description:'Closes the loop and stops growth from becoming toxicity.', size:{ w:83, h:65 }, color:'#a5d598', shape:'waste', tags:['utility','clean'], effects:{ pollution:-22, green:7, jobs:28, resilience:8 }, capacity:{ waste:100 }, solid:true },
    { id:'dam', category:'utility', label:'Hydro dam', icon:'▥', description:'Multipurpose infrastructure for water, power and risk.', size:{ w:95, h:54 }, color:'#88c6dc', shape:'dam', tags:['water','energy'], effects:{ water:35, energy:34, resilience:8, pollution:-4 }, capacity:{ water:90, energy:100 }, solid:true }
  ];

  const state = {
    view: 'landing', phase: 'landing', boundary: null, drawingPoints: [], objects: [], selectedTool: null, selectedId: null,
    activeCategory: 'all', search: '', zoom: 1, panX: 0, panY: 0, toolRotation: 0, pointer: { down:false, id:null, last:null, mode:null, moved:false },
    history: [], future: [], seed: Math.floor(Math.random() * 100000), telemetry: null, analysis: null, analysisTimer: null, toastTimer: null,
    pulse: null, reduceMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  const refs = {
    landing: byId('landingView'), game: byId('gameView'), create: byId('createCountryBtn'), canvas: byId('mapCanvas'), mapStage: byId('mapStage'), rotateTool: byId('rotateToolBtn'),
    boundaryHint: byId('boundaryHint'), buildHint: byId('buildHint'), buildHintText: byId('buildHintText'), sampleBoundary: byId('sampleBoundaryBtn'),
    phaseIndex: byId('phaseIndex'), phaseLabel: byId('phaseLabel'), done: byId('doneButton'), restart: byId('restartButton'),
    tabs: byId('categoryTabs'), catalog: byId('catalogScroll'), search: byId('paletteSearch'), coordinate: byId('coordinateReadout'), mode: byId('mapModeLabel'),
    objectCount: byId('objectCount'), mapFootStatus: byId('mapFootStatus'), zoomReadout: byId('zoomReadout'),
    selectedInspector: byId('selectedInspector'), emptyInspector: byId('emptyInspector'), selectedIcon: byId('selectedIcon'), selectedName: byId('selectedName'), selectedDescription: byId('selectedDescription'), selectedEffects: byId('selectedEffects'),
    rotate: byId('rotateSelectedBtn'), duplicate: byId('duplicateSelectedBtn'), remove: byId('deleteSelectedBtn'), planning: byId('planningIndex'), planningBar: byId('planningBar'),
    analysis: byId('analysisOverlay'), analysisProgress: byId('analysisProgressBar'), analysisSteps: [...document.querySelectorAll('.analysis-step')], analysisSubline: byId('analysisSubline'),
    results: byId('resultsOverlay'), scoreRing: byId('scoreRing'), scoreValue: byId('scoreValue'), tier: byId('tierLabel'), survival: byId('survivalYears'), resultsTitle: byId('resultsTitle'), resultsVerdict: byId('resultsVerdict'), reportCode: byId('reportCode'), reportSummary: byId('reportSummary'), categories: byId('categoryScores'), strengths: byId('strengthList'), risks: byId('riskList'), recommendation: byId('recommendationText'),
    closeResults: byId('closeResultsBtn'), closeReport: byId('reportCloseBtn'), reportRestart: byId('reportRestartBtn'), toast: byId('toast'), toastMessage: byId('toastMessage')
  };

  function seededNoise(x, y, seed = state.seed) {
    const value = Math.sin(x * 12.9898 + y * 78.233 + seed * .017) * 43758.5453;
    return value - Math.floor(value);
  }

  function randomBoundary() {
    const cx = WORLD.width / 2, cy = WORLD.height / 2;
    const points = [];
    const count = 13;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * TAU - Math.PI / 2;
      const radius = 268 + seededNoise(i, 4.2) * 92 + Math.sin(i * 2.3) * 15;
      points.push({ x: cx + Math.cos(angle) * radius * 1.28, y: cy + Math.sin(angle) * radius * .83 });
    }
    return points;
  }

  function snapshot() { return JSON.stringify({ boundary: state.boundary, objects: state.objects, seed: state.seed }); }
  function saveHistory() { state.history.push(snapshot()); if (state.history.length > 45) state.history.shift(); state.future = []; }
  function restore(serialized) {
    try { const data = JSON.parse(serialized); state.boundary = data.boundary; state.objects = data.objects || []; state.seed = data.seed || state.seed; state.selectedId = null; state.selectedTool = null; state.toolRotation = 0; updateAll(); } catch (error) { console.warn('Could not restore state', error); }
  }
  function undo() { if (!state.history.length) return notify('Nothing to undo yet.'); state.future.push(snapshot()); restore(state.history.pop()); notify('Last action undone.'); }
  function redo() { if (!state.future.length) return notify('Nothing to redo yet.'); state.history.push(snapshot()); restore(state.future.pop()); notify('Action restored.'); }

  function beginSession() {
    if (state.analysisTimer) window.clearTimeout(state.analysisTimer);
    state.view = 'game'; state.phase = 'boundary'; state.boundary = null; state.drawingPoints = []; state.objects = []; state.selectedId = null; state.selectedTool = null; state.toolRotation = 0; state.activeCategory = 'all'; state.search = ''; state.zoom = 1; state.panX = 0; state.panY = 0; state.history = []; state.future = []; state.seed = Math.floor(Math.random() * 100000); state.telemetry = null; state.analysis = null;
    refs.landing.classList.add('hidden'); refs.game.classList.remove('hidden'); refs.analysis.classList.add('hidden'); refs.results.classList.add('hidden'); refs.search.value = '';
    renderTabs(); renderCatalog(); updateAll(); resizeCanvas(); notify('New territory initialized. Draw a frontier or use the suggested outline.');
  }

  function goHome() {
    if (state.analysisTimer) window.clearTimeout(state.analysisTimer);
    refs.game.classList.add('hidden'); refs.analysis.classList.add('hidden'); refs.results.classList.add('hidden'); refs.landing.classList.remove('hidden'); state.view = 'landing'; state.phase = 'landing';
  }

  function pointInPolygon(point, polygon) {
    if (!polygon || polygon.length < 3) return false;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y, xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / ((yj - yi) || .0001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function polygonArea(points) {
    let area = 0;
    for (let i = 0; i < points.length; i += 1) { const next = points[(i + 1) % points.length]; area += points[i].x * next.y - next.x * points[i].y; }
    return Math.abs(area / 2);
  }

  function getMapMetrics() {
    const rect = refs.canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / WORLD.width, rect.height / WORLD.height) * state.zoom;
    return { rect, scale, originX: rect.width / 2 - (WORLD.width / 2 - state.panX) * scale, originY: rect.height / 2 - (WORLD.height / 2 - state.panY) * scale };
  }
  function worldToScreen(point) { const m = getMapMetrics(); return { x: m.originX + point.x * m.scale, y: m.originY + point.y * m.scale }; }
  function screenToWorld(clientX, clientY) { const m = getMapMetrics(); return { x: (clientX - m.rect.left - m.originX) / m.scale, y: (clientY - m.rect.top - m.originY) / m.scale }; }

  function setPhase(phase) {
    state.phase = phase;
    const labels = { boundary: ['01', 'DRAW FRONTIER'], build: ['02', 'BUILD SYSTEMS'], examining: ['03', 'EXAMINE COUNTRY'], results: ['04', 'SIMULATION REPORT'] };
    const data = labels[phase] || labels.boundary;
    refs.phaseIndex.textContent = data[0]; refs.phaseLabel.textContent = data[1];
    refs.boundaryHint.classList.toggle('hidden', phase !== 'boundary' || state.boundary !== null);
    refs.buildHint.classList.toggle('hidden', phase !== 'build');
    refs.done.disabled = phase !== 'build' || state.objects.length < 2;
    refs.mode.textContent = phase === 'boundary' ? 'FRONTIER MODE' : phase === 'build' ? (state.selectedTool ? `PLACEMENT / ${state.toolRotation}°` : 'BUILD MODE') : 'ANALYSIS MODE';
    refs.rotateTool.classList.toggle('hidden', phase !== 'build' || !state.selectedTool);
    refs.canvas.style.cursor = phase === 'boundary' ? 'crosshair' : state.selectedTool ? 'copy' : 'default';
  }

  function fitBoundary(points) {
    if (!points?.length) return points;
    const bounds = points.reduce((box, point) => ({
      left: Math.min(box.left, point.x), right: Math.max(box.right, point.x), top: Math.min(box.top, point.y), bottom: Math.max(box.bottom, point.y)
    }), { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
    const width = Math.max(1, bounds.right - bounds.left), height = Math.max(1, bounds.bottom - bounds.top);
    const scale = Math.min(1, (WORLD.width * .84) / width, (WORLD.height * .78) / height);
    const sourceCenter = { x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2 };
    const targetCenter = { x: WORLD.width / 2, y: WORLD.height / 2 };
    return points.map((point) => ({ x: targetCenter.x + (point.x - sourceCenter.x) * scale, y: targetCenter.y + (point.y - sourceCenter.y) * scale }));
  }

  function acceptBoundary(points = randomBoundary()) {
    const area = polygonArea(points);
    if (area < 115000) { notify('The frontier needs more room to breathe. Draw a wider territory.'); return; }
    saveHistory(); state.boundary = fitBoundary(points); state.drawingPoints = []; state.panX = 0; state.panY = 0; state.zoom = 1; setPhase('build'); updateAll(); notify('Frontier centered and claimed. Now build a country that can carry its own weight.');
  }

  function renderTabs() {
    refs.tabs.innerHTML = CATEGORIES.map((category) => `<button class="category-tab ${state.activeCategory === category.id ? 'active' : ''}" type="button" role="tab" aria-selected="${state.activeCategory === category.id}" data-category="${category.id}">${category.label}</button>`).join('');
    refs.tabs.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => { state.activeCategory = button.dataset.category; renderTabs(); renderCatalog(); }));
  }

  function renderCatalog() {
    const search = state.search.trim().toLowerCase();
    const filtered = SYSTEMS.filter((system) => (state.activeCategory === 'all' || system.category === state.activeCategory) && (!search || `${system.label} ${system.description} ${system.tags.join(' ')}`.toLowerCase().includes(search)));
    const groups = {};
    filtered.forEach((system) => { (groups[system.category] ||= []).push(system); });
    refs.catalog.innerHTML = filtered.length ? Object.entries(groups).map(([category, systems]) => `<div class="catalog-group-label">${CATEGORIES.find((item) => item.id === category)?.label || category}</div>${systems.map((system) => `<button class="catalog-item ${state.selectedTool === system.id ? 'active' : ''}" type="button" data-system="${system.id}" title="${system.description}"><span class="catalog-icon">${system.icon}</span><span class="catalog-copy"><strong>${system.label}</strong><small>${system.tags.slice(0, 2).join(' · ')}</small></span><span class="catalog-meta">${Math.round(system.size.w / 10)}×${Math.round(system.size.h / 10)}</span></button>`).join('')}`).join('') : `<div class="empty-inspector"><div class="empty-radar"><span></span></div><strong>No system found</strong><p>Try another search or category.</p></div>`;
    refs.catalog.querySelectorAll('[data-system]').forEach((button) => button.addEventListener('click', () => selectTool(button.dataset.system)));
  }

  function selectTool(id) {
    state.selectedTool = state.selectedTool === id ? null : id; state.toolRotation = 0; state.selectedId = null; renderCatalog(); updateInspector(); setPhase('build');
    const system = SYSTEMS.find((item) => item.id === state.selectedTool);
    refs.buildHintText.textContent = system ? `Placing ${system.label}. Tap Rotate for a ${state.toolRotation ? 'vertical' : 'horizontal'} footprint, then tap the territory.` : 'Select a system from the command deck, then place it on your territory.';
    notify(system ? `${system.label} selected. Find it a good home.` : 'Placement mode cleared.');
  }

  function getSystem(id) { return SYSTEMS.find((item) => item.id === id); }
  function getSelectedObject() { return state.objects.find((object) => object.instanceId === state.selectedId) || null; }
  function getObjectBounds(object, def = getSystem(object.type)) {
    const quarterTurn = Math.abs(((object.rotation || 0) % 180 + 180) % 180 - 90) < .01;
    const width = quarterTurn ? def.size.h : def.size.w, height = quarterTurn ? def.size.w : def.size.h;
    return { left: object.x - width / 2, right: object.x + width / 2, top: object.y - height / 2, bottom: object.y + height / 2 };
  }
  function cornersInsideBoundary(object, def) { const bounds = getObjectBounds(object, def); return [[bounds.left,bounds.top],[bounds.right,bounds.top],[bounds.right,bounds.bottom],[bounds.left,bounds.bottom]].every(([x,y]) => pointInPolygon({ x, y }, state.boundary)); }
  function overlaps(object, def, skipId = null) {
    if (!def.solid) return false;
    const a = getObjectBounds(object, def);
    return state.objects.some((other) => {
      if (other.instanceId === skipId) return false;
      const otherDef = getSystem(other.type); if (!otherDef?.solid) return false;
      const b = getObjectBounds(other, otherDef); return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    });
  }
  function isValidPlacement(object, def, skipId = null) { return !!state.boundary && cornersInsideBoundary(object, def) && !overlaps(object, def, skipId); }

  function placeSystem(type, position, rotation = 0) {
    const def = getSystem(type); if (!def) return false;
    const object = { instanceId: `${type}-${Date.now()}-${Math.floor(Math.random() * 9999)}`, type, x: position.x, y: position.y, rotation, pulse: 1 };
    if (!isValidPlacement(object, def)) { notify('That system cannot be placed there. Keep it inside the frontier and clear the overlap.'); return false; }
    saveHistory(); state.objects.push(object); state.selectedId = object.instanceId; state.selectedTool = null; state.toolRotation = 0; state.pulse = { x: object.x, y: object.y, started: performance.now() }; renderCatalog(); updateAll(); notify(`${def.label} anchored to the country grid.`); return true;
  }

  function rotatePlacementTool() {
    if (!state.selectedTool) return notify('Select a system from the command deck first.');
    state.toolRotation = (state.toolRotation + 90) % 360;
    const def = getSystem(state.selectedTool);
    refs.buildHintText.textContent = `Placing ${def.label}. Tap the territory to anchor its ${state.toolRotation ? 'vertical' : 'horizontal'} footprint.`;
    setPhase('build'); draw(); notify(`${def.label} preview rotated ${state.toolRotation}°.`);
  }

  function moveObject(object, position) { const def = getSystem(object.type); if (!isValidPlacement({ ...object, ...position }, def, object.instanceId)) return false; object.x = position.x; object.y = position.y; return true; }
  function rotateSelected() { const object = getSelectedObject(); if (!object) return notify('Select a placed system first.'); const def = getSystem(object.type); if (def.shape === 'river' || def.shape === 'lake' || def.shape === 'forest') return notify('Natural systems cannot be rotated.'); saveHistory(); object.rotation = (object.rotation + 90) % 360; if (!isValidPlacement(object, def, object.instanceId)) { restore(state.history.pop()); return notify('Rotation blocked by the frontier or another system.'); } updateAll(); notify(`${def.label} rotated 90 degrees.`); }
  function duplicateSelected() { const object = getSelectedObject(); if (!object) return notify('Select a placed system first.'); const def = getSystem(object.type); const candidate = { ...object, instanceId: `${object.type}-${Date.now()}-copy`, x: object.x + 24, y: object.y + 24 }; if (!isValidPlacement(candidate, def)) return notify('No room nearby for a duplicate.'); saveHistory(); state.objects.push(candidate); state.selectedId = candidate.instanceId; updateAll(); notify(`${def.label} duplicated.`); }
  function removeSelected() { const index = state.objects.findIndex((object) => object.instanceId === state.selectedId); if (index < 0) return notify('Select a placed system first.'); const label = getSystem(state.objects[index].type).label; saveHistory(); state.objects.splice(index, 1); state.selectedId = null; updateAll(); notify(`${label} removed from the plan.`); }

  function calculateTelemetry() {
    const result = { population:0, jobs:0, food:0, energy:0, water:0, green:0, pollution:0, economy:0, resilience:0, health:0, education:0, transport:0, governance:0, safety:0, culture:0, waste:0, housing:0, systems:state.objects.length };
    state.objects.forEach((object) => { const def = getSystem(object.type); Object.entries(def.effects || {}).forEach(([key, value]) => { result[key] = (result[key] || 0) + value; }); Object.entries(def.capacity || {}).forEach(([key, value]) => { if (key === 'housing') result.housing += value; }); });
    const population = result.population; result.foodIndex = clamp(result.food / Math.max(60, population / 12) * 100, 0, 140); result.energyIndex = clamp(result.energy / Math.max(80, population / 9) * 100, 0, 140); result.waterIndex = clamp(result.water / Math.max(70, population / 8) * 100, 0, 140); result.greenPercent = clamp(result.green + 7, 0, 100); result.jobsIndex = clamp(result.jobs / Math.max(90, population * .36) * 100, 0, 140); result.pollution = Math.max(0, result.pollution); result.planning = state.boundary ? clamp(17 + result.systems * 2.1 + result.transport * .16 + result.governance * .2 + result.green * .24 - result.pollution * .12, 0, 100) : 0;
    return result;
  }

  function updateTelemetry() {
    const t = state.telemetry = calculateTelemetry();
    const population = t.population ? formatNumber(t.population) : '—';
    byId('telemetryPopulation').textContent = population; byId('telemetryHousing').textContent = t.housing ? `${formatNumber(t.housing)} capacity` : 'Awaiting housing';
    byId('telemetryJobs').textContent = t.jobs ? formatNumber(t.jobs) : '—'; byId('telemetryEconomy').textContent = t.jobs ? `${Math.round(t.jobsIndex)}% employment reach` : 'No economy yet';
    byId('telemetryFood').textContent = t.food ? `${Math.round(t.foodIndex)}%` : '—'; byId('telemetryFoodSub').textContent = t.food ? `${formatNumber(t.food)} production units` : 'No farms online';
    byId('telemetryEnergy').textContent = t.energy ? `${Math.round(t.energyIndex)}%` : '—'; byId('telemetryEnergySub').textContent = t.energy ? `${formatNumber(t.energy)} grid output` : 'Grid offline';
    byId('telemetryWater').textContent = t.water ? `${Math.round(t.waterIndex)}%` : '—'; byId('telemetryWaterSub').textContent = t.water ? `${formatNumber(t.water)} access units` : 'No utility network';
    byId('telemetryGreen').textContent = state.boundary ? `${Math.round(t.greenPercent)}%` : '—'; byId('telemetryGreenSub').textContent = state.boundary ? `${Math.round(t.pollution)} pressure index` : 'Map unclaimed';
    refs.planning.textContent = String(Math.round(t.planning)).padStart(2, '0'); refs.planningBar.style.width = `${t.planning}%`; refs.objectCount.textContent = `${state.objects.length} SYSTEM${state.objects.length === 1 ? '' : 'S'} PLACED`;
  }

  function updateInspector() {
    const object = getSelectedObject(); refs.selectedInspector.classList.toggle('hidden', !object); refs.emptyInspector.classList.toggle('hidden', !!object);
    if (!object) return;
    const def = getSystem(object.type); refs.selectedIcon.textContent = def.icon; refs.selectedName.textContent = def.label; refs.selectedDescription.textContent = def.description; byId('selectedStatus').textContent = `${def.category.toUpperCase()} / ONLINE`;
    refs.selectedEffects.innerHTML = Object.entries(def.effects || {}).slice(0, 5).map(([key, value]) => `<span class="effect-chip">${key} <strong>${value > 0 ? '+' : ''}${value}</strong></span>`).join('');
  }
  function updateAll() { setPhase(state.phase); updateTelemetry(); updateInspector(); updateCoordinate(null); draw(); }

  function updateCoordinate(point) { refs.coordinate.textContent = point ? `X ${String(Math.round(point.x)).padStart(4,'0')} / Y ${String(Math.round(point.y)).padStart(4,'0')}` : (state.boundary ? `${state.objects.length} SYSTEMS / FRONTIER LOCKED` : 'AWAITING FRONTIER'); }
  function notify(message) { refs.toastMessage.textContent = message; refs.toast.classList.add('show'); if (state.toastTimer) window.clearTimeout(state.toastTimer); state.toastTimer = window.setTimeout(() => refs.toast.classList.remove('show'), 2600); }

  function resizeCanvas() { const rect = refs.canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); refs.canvas.width = Math.max(1, Math.floor(rect.width * dpr)); refs.canvas.height = Math.max(1, Math.floor(rect.height * dpr)); draw(); }

  function draw() {
    const canvas = refs.canvas, ctx = canvas.getContext('2d'); if (!ctx || !canvas.clientWidth) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2), width = canvas.clientWidth, height = canvas.clientHeight, metrics = getMapMetrics();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#081724'; ctx.fillRect(0, 0, width, height);
    ctx.save(); ctx.translate(metrics.originX, metrics.originY); ctx.scale(metrics.scale, metrics.scale); drawWorld(ctx); ctx.restore();
    if (state.phase === 'boundary' && state.drawingPoints.length > 1) drawScreenPath(ctx, state.drawingPoints.map(worldToScreen), false, '#67e8f9');
  }

  function drawWorld(ctx) {
    const t = performance.now();
    ctx.save();
    ctx.fillStyle = '#0b1b27'; ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    const cell = 58;
    for (let y = 0; y < WORLD.height; y += cell) for (let x = 0; x < WORLD.width; x += cell) {
      const n = seededNoise(x / cell, y / cell); const tone = n > .68 ? '#12352d' : n > .43 ? '#102d2c' : '#0d2630'; ctx.fillStyle = tone; ctx.fillRect(x, y, cell + 1, cell + 1);
      if (n > .76) { ctx.fillStyle = 'rgba(105, 167, 111, .16)'; ctx.beginPath(); ctx.arc(x + 20 + n * 18, y + 28, 14 + n * 9, 0, TAU); ctx.fill(); }
    }
    ctx.strokeStyle = 'rgba(122, 189, 193, .08)'; ctx.lineWidth = 1;
    for (let x = 0; x <= WORLD.width; x += 38) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.height); ctx.stroke(); }
    for (let y = 0; y <= WORLD.height; y += 38) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(126, 181, 147, .13)'; ctx.lineWidth = 2;
    for (let offset = -260; offset < 1400; offset += 48) { ctx.beginPath(); for (let x = -40; x < WORLD.width + 40; x += 16) { const y = offset + Math.sin(x / 115 + offset / 80) * 22 + Math.sin(x / 33) * 4; if (x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
    if (state.boundary) {
      ctx.save(); ctx.beginPath(); state.boundary.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); ctx.clip();
      ctx.fillStyle = 'rgba(105, 173, 108, .13)'; ctx.fillRect(0, 0, WORLD.width, WORLD.height);
      for (let i = 0; i < 25; i += 1) { const x = 70 + seededNoise(i, 12) * 1060, y = 55 + seededNoise(i, 17) * 650; ctx.fillStyle = 'rgba(147, 212, 133, .12)'; ctx.beginPath(); ctx.arc(x, y, 9 + seededNoise(i, 22) * 18, 0, TAU); ctx.fill(); }
      ctx.restore();
      drawBoundary(ctx, state.boundary, '#67e8f9', true);
    } else {
      drawSuggested(ctx, randomBoundary(), false);
      ctx.fillStyle = 'rgba(103,232,249,.08)'; ctx.font = '11px SFMono-Regular, Consolas, monospace'; ctx.fillText('TERRITORY GRID / UNCLAIMED', 33, 42);
    }
    state.objects.filter((object) => ['river','lake','forest','park','road','rail'].includes(getSystem(object.type)?.shape)).forEach((object) => drawSystem(ctx, object, getSystem(object.type), t));
    state.objects.filter((object) => !['river','lake','forest','park','road','rail'].includes(getSystem(object.type)?.shape)).forEach((object) => drawSystem(ctx, object, getSystem(object.type), t));
    const selected = getSelectedObject(); if (selected) drawSelection(ctx, selected);
    if (state.phase === 'build' && state.selectedTool) {
      const point = state.pointer.last ? state.pointer.last.world : null; if (point) drawGhost(ctx, point, getSystem(state.selectedTool));
    }
    if (state.pulse && performance.now() - state.pulse.started < 900) { const elapsed = performance.now() - state.pulse.started, radius = 8 + elapsed / 6; ctx.save(); ctx.globalAlpha = 1 - elapsed / 900; ctx.strokeStyle = '#67e8f9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(state.pulse.x, state.pulse.y, radius, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.restore();
  }

  function drawScreenPath(ctx, points, close, color) { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); points.forEach((p, index) => index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); if (close) ctx.closePath(); ctx.stroke(); ctx.restore(); }
  function drawSuggested(ctx, points, solid) { ctx.save(); ctx.globalAlpha = solid ? 1 : .55; ctx.fillStyle = 'rgba(103,232,249,.045)'; ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(103,232,249,.38)'; ctx.lineWidth = 2; ctx.setLineDash([10, 10]); ctx.stroke(); ctx.restore(); }
  function drawBoundary(ctx, points, color, fill) { ctx.save(); ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.closePath(); if (fill) { ctx.fillStyle = 'rgba(103,232,249,.035)'; ctx.fill(); } ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(205,250,244,.58)'; ctx.lineWidth = 1; ctx.setLineDash([3, 7]); ctx.stroke(); ctx.restore(); }

  function drawSystem(ctx, object, def, time) {
    if (!def) return; const selected = object.instanceId === state.selectedId; ctx.save(); ctx.translate(object.x, object.y); ctx.rotate((object.rotation || 0) * Math.PI / 180); const w = def.size.w, h = def.size.h; ctx.shadowColor = selected ? '#67e8f9' : 'rgba(0,0,0,.42)'; ctx.shadowBlur = selected ? 15 : 8; ctx.shadowOffsetY = selected ? 0 : 5;
    if (def.shape === 'river') { ctx.shadowColor = 'rgba(87,207,225,.4)'; ctx.strokeStyle = 'rgba(65,173,196,.35)'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(-w/2, 2); ctx.bezierCurveTo(-w*.2,-h, w*.1,h, w/2, -3); ctx.stroke(); ctx.strokeStyle = def.color; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w/2, 2); ctx.bezierCurveTo(-w*.2,-h, w*.1,h, w/2, -3); ctx.stroke(); drawSystemLabel(ctx, def, 0, h/2+13); ctx.restore(); return; }
    if (def.shape === 'lake') { ctx.fillStyle = 'rgba(63,169,198,.35)'; ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, w/2, h/2, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(196,247,249,.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-4, 2, w/3, h/3, 0, 0, TAU); ctx.stroke(); drawSystemLabel(ctx, def, 0, h/2+13); ctx.restore(); return; }
    if (def.shape === 'forest') { ctx.fillStyle = 'rgba(90,155,100,.48)'; ctx.strokeStyle = def.color; ctx.lineWidth = 1.5; roundedRect(ctx, -w/2, -h/2, w, h, 18); ctx.fill(); ctx.stroke(); for (let i = 0; i < 13; i += 1) { const tx = -w*.37 + seededNoise(i, object.x) * w*.7, ty = -h*.36 + seededNoise(i, object.y) * h*.7; ctx.fillStyle = i % 2 ? '#84d08a' : '#5da96f'; ctx.beginPath(); ctx.arc(tx, ty, 8 + seededNoise(i, 6) * 5, 0, TAU); ctx.fill(); } drawSystemLabel(ctx, def, 0, h/2+13); ctx.restore(); return; }
    if (def.shape === 'park') { ctx.fillStyle = 'rgba(102,186,115,.35)'; ctx.strokeStyle = def.color; ctx.lineWidth = 2; roundedRect(ctx, -w/2, -h/2, w, h, 14); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(180,240,168,.72)'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); ctx.stroke(); drawSystemLabel(ctx, def, 0, h/2+13); ctx.restore(); return; }
    if (def.shape === 'road' || def.shape === 'rail') { ctx.shadowColor = 'transparent'; ctx.fillStyle = def.shape === 'rail' ? '#667e84' : '#4f646e'; roundedRect(ctx, -w/2, -h/2, w, h, 5); ctx.fill(); ctx.strokeStyle = def.shape === 'rail' ? '#d3f5f0' : '#d5c9a9'; ctx.lineWidth = def.shape === 'rail' ? 2 : 1; ctx.setLineDash(def.shape === 'rail' ? [8, 5] : [13, 8]); ctx.beginPath(); ctx.moveTo(-w/2, 0); ctx.lineTo(w/2, 0); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); return; }
    ctx.shadowOffsetY = 4; ctx.fillStyle = `${def.color}b3`; ctx.strokeStyle = def.color; ctx.lineWidth = selected ? 2 : 1; const shape = def.shape;
    if (shape === 'tower') { roundedRect(ctx, -w/2, -h/2, w, h, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(8,24,35,.34)'; for (let row=-1; row<2; row++) for (let col=-1; col<2; col++) ctx.fillRect(col*19-4, row*20-5, 8, 9); }
    else if (shape === 'solar') { roundedRect(ctx, -w/2, -h/2, w, h, 5); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,247,193,.7)'; ctx.lineWidth = 1; for (let i=-2;i<3;i++){ ctx.beginPath();ctx.moveTo(i*19,-h*.35);ctx.lineTo(i*19,h*.35);ctx.stroke(); } ctx.beginPath();ctx.moveTo(-w*.42,0);ctx.lineTo(w*.42,0);ctx.stroke(); }
    else if (shape === 'wind') { ctx.fillStyle = 'rgba(76,126,141,.45)'; ctx.strokeStyle = def.color; ctx.beginPath();ctx.arc(0,0, w*.4,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle=def.color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,17);ctx.lineTo(0,-18);ctx.stroke();ctx.beginPath();ctx.arc(0,-18,12,0,Math.PI*1.7);ctx.stroke(); }
    else if (shape === 'road' || shape === 'rail') { roundedRect(ctx,-w/2,-h/2,w,h,3);ctx.fill();ctx.stroke(); }
    else { roundedRect(ctx, -w/2, -h/2, w, h, shape === 'stadium' ? 28 : 7); ctx.fill(); ctx.stroke(); if (shape === 'farm') { ctx.strokeStyle='rgba(252,239,172,.65)';ctx.lineWidth=2;for(let i=-2;i<3;i++){ctx.beginPath();ctx.moveTo(i*15,-h*.32);ctx.lineTo(i*15,h*.32);ctx.stroke();} } else if (shape === 'stadium') { ctx.strokeStyle='rgba(255,231,240,.65)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,w*.28,h*.25,0,0,TAU);ctx.stroke(); } else if (shape === 'hospital') { ctx.fillStyle='rgba(255,248,242,.8)';ctx.fillRect(-3,-16,6,32);ctx.fillRect(-16,-3,32,6); } else if (shape === 'waterplant') { ctx.strokeStyle='rgba(203,246,249,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,17,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-17,0);ctx.bezierCurveTo(-8,-10,8,10,17,0);ctx.stroke(); } else if (shape === 'waste') { ctx.strokeStyle='rgba(225,255,216,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,14,0,TAU*.72);ctx.stroke();ctx.beginPath();ctx.moveTo(13,-7);ctx.lineTo(17,-1);ctx.lineTo(9,0);ctx.stroke(); } }
    ctx.shadowBlur = 0; drawSystemBadge(ctx, def, 0, 0); drawSystemLabel(ctx, def, 0, h/2+13); ctx.restore();
  }
  function roundedRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function drawSystemBadge(ctx, def, x, y){ ctx.save(); ctx.fillStyle='rgba(5,17,27,.66)'; ctx.strokeStyle='rgba(216,247,243,.42)'; ctx.lineWidth=1; ctx.beginPath();ctx.arc(x,y,12,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#f1fbf3';ctx.font='bold 11px SFMono-Regular,Consolas,monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(def.icon,x,y+1);ctx.restore(); }
  function drawSystemLabel(ctx, def, x, y){ const text=def.label.toUpperCase(); ctx.save();ctx.font='8px SFMono-Regular,Consolas,monospace';const width=ctx.measureText(text).width+10;ctx.fillStyle='rgba(4,14,23,.82)';ctx.fillRect(x-width/2,y-5,width,12);ctx.fillStyle='rgba(214,242,238,.78)';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x,y+1);ctx.restore(); }
  function drawSelection(ctx, object) { const def = getSystem(object.type); const bounds = getObjectBounds(object, def); ctx.save(); ctx.translate(object.x, object.y); ctx.rotate((object.rotation||0)*Math.PI/180); ctx.strokeStyle='#67e8f9';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.strokeRect(-def.size.w/2-7,-def.size.h/2-7,def.size.w+14,def.size.h+14);ctx.setLineDash([]);ctx.fillStyle='#67e8f9';for(const [x,y] of [[-def.size.w/2-9,-def.size.h/2-9],[def.size.w/2+9,-def.size.h/2-9],[def.size.w/2+9,def.size.h/2+9],[-def.size.w/2-9,def.size.h/2+9]])ctx.fillRect(x-2,y-2,4,4);ctx.restore(); void bounds; }
  function drawGhost(ctx, point, def) { if (!def) return; const ghost={type:def.id,x:point.x,y:point.y,rotation:state.toolRotation}; const valid=isValidPlacement(ghost,def); ctx.save(); ctx.globalAlpha=.45; ctx.translate(point.x,point.y); ctx.rotate(state.toolRotation * Math.PI / 180); ctx.fillStyle=valid?def.color:'#ff8b78'; ctx.strokeStyle=valid?'#b6f6fb':'#ff8b78'; ctx.setLineDash([5,4]); ctx.lineWidth=2; roundedRect(ctx,-def.size.w/2,-def.size.h/2,def.size.w,def.size.h,7); ctx.fill(); ctx.stroke(); ctx.restore(); }

  function handlePointerDown(event) {
    if (state.phase === 'examining' || state.phase === 'results') return;
    refs.canvas.setPointerCapture?.(event.pointerId); const world = screenToWorld(event.clientX, event.clientY); state.pointer = { down:true, id:event.pointerId, last:{world, clientX:event.clientX, clientY:event.clientY}, mode:null, moved:false }; updateCoordinate(world);
    if (state.phase === 'boundary') { state.drawingPoints = [world]; state.pointer.mode = 'drawing'; return; }
    const selected = getSelectedObject();
    if (state.selectedTool) { state.pointer.mode = 'placement'; return; }
    const hit = [...state.objects].reverse().find((object) => { const def=getSystem(object.type), b=getObjectBounds(object,def); return world.x>=b.left&&world.x<=b.right&&world.y>=b.top&&world.y<=b.bottom; });
    if (hit) { state.selectedId = hit.instanceId; state.pointer.mode = 'drag'; state.pointer.offset = { x: world.x - hit.x, y: world.y - hit.y }; state.pointer.origin = { x: hit.x, y: hit.y }; state.pointer.historySnapshot = snapshot(); updateInspector(); draw(); return; }
    state.pointer.mode = 'pan'; state.pointer.startPan = { x:state.panX, y:state.panY };
  }
  function handlePointerMove(event) {
    if (state.phase === 'examining' || state.phase === 'results') return; const world=screenToWorld(event.clientX,event.clientY); const previous=state.pointer.last; state.pointer.last={world,clientX:event.clientX,clientY:event.clientY}; updateCoordinate(world); if (!state.pointer.down) { draw(); return; } state.pointer.moved=true;
    if (state.pointer.mode==='drawing') { const last=state.drawingPoints[state.drawingPoints.length-1]; if (!last || Math.hypot(world.x-last.x,world.y-last.y)>10) state.drawingPoints.push(world); }
    else if (state.pointer.mode==='drag') { const object=getSelectedObject(); if (object) { object.x=world.x-state.pointer.offset.x; object.y=world.y-state.pointer.offset.y; } }
    else if (state.pointer.mode==='pan') { const m=getMapMetrics(); state.panX += (event.clientX-previous.clientX)/m.scale; state.panY += (event.clientY-previous.clientY)/m.scale; }
    draw();
  }
  function handlePointerUp(event) {
    if (!state.pointer.down) return; const world=screenToWorld(event.clientX,event.clientY); const mode=state.pointer.mode; state.pointer.down=false; refs.canvas.releasePointerCapture?.(event.pointerId);
    if (mode==='drawing') { if (state.drawingPoints.length>2) { const first=state.drawingPoints[0]; const last=state.drawingPoints[state.drawingPoints.length-1]; if (Math.hypot(last.x-first.x,last.y-first.y)<45) state.drawingPoints.pop(); } if (state.drawingPoints.length>=6 && polygonArea(state.drawingPoints)>115000) acceptBoundary(state.drawingPoints); else { state.drawingPoints=[]; notify('Frontier too small. Draw a wider territory or use the suggested outline.'); } }
    else if (mode==='placement') { placeSystem(state.selectedTool,world,state.toolRotation); }
    else if (mode==='drag') { const object=getSelectedObject(); if (object) { const def=getSystem(object.type); if (!isValidPlacement(object,def,object.instanceId)) { object.x=state.pointer.origin.x; object.y=state.pointer.origin.y; notify('Move blocked: return the system inside the frontier.'); } else if (state.pointer.moved && state.pointer.historySnapshot) { state.history.push(state.pointer.historySnapshot); if (state.history.length>45) state.history.shift(); state.future=[]; state.pulse={x:object.x,y:object.y,started:performance.now()}; notify(`${def.label} repositioned.`); } } updateAll(); }
    state.pointer.mode=null; draw();
  }

  function zoomMap(delta) { state.zoom=clamp(state.zoom+delta,.72,1.55); refs.zoomReadout.textContent=`${Math.round(state.zoom*100)}%`; draw(); }
  function centerMap() { state.zoom=1;state.panX=0;state.panY=0;refs.zoomReadout.textContent='100%';draw();notify('Map centered on your territory.'); }

  function examineCountry() {
    if (state.phase !== 'build' || state.objects.length < 2) return notify('Place at least two systems before examination.');
    state.phase='examining'; setPhase('examining'); refs.analysis.classList.remove('hidden'); refs.analysisProgress.style.width='8%'; refs.analysisSteps.forEach((step,i)=>{step.classList.toggle('active',i===0);step.classList.remove('done');step.querySelector('i').textContent=i===0?'scanning':'queued';});
    const sublines=['Reading terrain, edges and access.','Tracing food, energy and water loops.','Applying pressure to the country’s weak links.','Projecting resilience across the next generations.']; let step=0;
    const advance=()=>{ step+=1; const progress=Math.min(100,step*25+8); refs.analysisProgress.style.width=`${progress}%`; refs.analysisSubline.textContent=sublines[Math.min(step,3)]; refs.analysisSteps.forEach((item,index)=>{item.classList.toggle('active',index===step);item.classList.toggle('done',index<step);item.querySelector('i').textContent=index<step?'complete':index===step?'scanning':'queued';}); if(step<4) state.analysisTimer=window.setTimeout(advance,state.reduceMotion?320:720); else { state.analysisTimer=window.setTimeout(()=>{refs.analysis.classList.add('hidden'); state.analysis=runSimulation(); setPhase('results'); renderResults(state.analysis); refs.results.classList.remove('hidden');},state.reduceMotion?260:640); } };
    state.analysisTimer=window.setTimeout(advance,state.reduceMotion?240:720);
  }

  function runSimulation() {
    const t=calculateTelemetry(), objects=state.objects, count=(id)=>objects.filter(o=>o.type===id).length, has=(id)=>count(id)>0, boundaryArea=Math.max(1,polygonArea(state.boundary||[]));
    const waterAccess=clamp(t.waterIndex*.66+(has('river')||has('lake')?24:0)+(has('waterplant')?18:0),0,100);
    const foodSecurity=clamp(t.foodIndex*.62+(has('granary')?14:0)+(has('farm')?10:0)+(has('greenhouse')?7:0),0,100);
    const energySecurity=clamp(t.energyIndex*.58+(has('solar')?10:0)+(has('wind')?10:0)+(has('power')?13:0)+(has('dam')?9:0),0,100);
    const housing=clamp(t.population?Math.min(100,t.housing/Math.max(1,t.population)*100):0,0,100);
    const services=clamp((t.health*.7+t.education*.52+t.governance*.8+t.safety*.58),0,100);
    const economy=clamp(t.jobsIndex*.42+t.economy*1.05+(has('research')?12:0)+(has('airport')?8:0),0,100);
    const transport=clamp(t.transport*1.25+(has('station')?16:0)+(has('road')?9:0)+(has('rail')?12:0),0,100);
    const environment=clamp(55+t.greenPercent*.48-t.pollution*1.35+(has('waste')?18:0)+(has('forest')?8:0),0,100);
    const resilience=clamp(31+t.resilience*.94+(has('government')?7:0)+(has('ngo')?6:0)+(has('granary')?6:0)-Math.max(0,objects.length-18)*1.2,0,100);
    const densityPenalty=t.population && boundaryArea<140000 ? 9 : 0;
    const riskPenalty=Math.max(0,t.pollution-18)*.58+(has('heavyfactory')&&!has('waste')?12:0)+(has('airport')&&!has('emergency')?5:0)+densityPenalty;
    const categories=[{name:'Food security',score:foodSecurity},{name:'Energy resilience',score:energySecurity},{name:'Water access',score:waterAccess},{name:'Housing fit',score:housing},{name:'Civic services',score:services},{name:'Economic engine',score:economy},{name:'Mobility network',score:transport},{name:'Living environment',score:environment},{name:'Shock resilience',score:resilience}];
    const score=clamp(Math.round(average(categories.map(c=>c.score))-(riskPenalty*.54)),0,100);
    let tier='CRITICAL', title='Your country is under pressure.', verdict='The model needs more balance before it can promise a long future.';

    if (score >= 86) { tier='FLOURISHING'; title='Your country found its rhythm.'; verdict='The model sees a resilient nation with enough balance to absorb pressure and keep growing.'; }
    else if (score >= 70) { tier='STABLE'; title='Your country can hold.'; verdict='The model sees a strong foundation with a few systems that need deliberate care before the next shock.'; }
    else if (score >= 52) { tier='STRAINED'; title='Your country is making compromises.'; verdict='The model sees a workable country, but its future depends on fixing the systems that currently carry too much weight.'; }
    else if (score >= 32) { tier='FRAGILE'; title='Your country is one shock away.'; verdict='The model sees ambition without enough redundancy. A bad season, outage or social strain could change the story quickly.'; }

    const strengths=[]; const risks=[];
    if (foodSecurity >= 68) strengths.push('Food production has a credible local base.'); else risks.push('The food loop is too thin for a sustained population.');
    if (energySecurity >= 68) strengths.push('The energy grid has enough generation to keep the lights on.'); else risks.push('Energy generation is not yet resilient enough for demand.');
    if (environment >= 68) strengths.push('Green systems are absorbing a meaningful share of the country’s pressure.'); else risks.push('Environmental pressure is compounding faster than the land can absorb it.');
    if (transport >= 62) strengths.push('Transport links are turning separate districts into one economy.'); else risks.push('Too many systems are isolated from the network.');
    if (services >= 62) strengths.push('Civic services give people a path through ordinary and difficult years.'); else risks.push('Healthcare, education or emergency coverage is too sparse.');
    if (resilience >= 62) strengths.push('There is evidence of redundancy rather than a single point of failure.'); else risks.push('The plan has too few buffers when something goes wrong.');
    if (!strengths.length) strengths.push('The frontier itself is a beginning. Every system can still change the trajectory.');
    if (!risks.length) risks.push('Growth will eventually test your water and waste capacity.');
    const recommendation = score >= 75 ? 'Protect your strongest loops, then add redundancy: the next leap is not more buildings, but more graceful failure.' : score >= 52 ? 'Add the missing basics before chasing spectacle—food, water, energy, health and a network that connects them.' : 'Start with the survival spine: water, food, housing, energy and one connected civic center. Build outward only when the core can breathe.';
    const survival = clamp(Math.round(8 + score * 1.48 + resilience * .23 - riskPenalty * 1.2 + (has('granary') ? 7 : 0) + (has('waste') ? 6 : 0)), 4, 240);
    return { score, tier, title, verdict, survival, categories, strengths, risks, recommendation, summary:`${objects.length} systems · ${formatNumber(t.population)} projected residents · ${Math.round(t.pollution)} pressure`, code:`${String(Math.floor(score * 17 + objects.length * 31) % 999).padStart(3,'0')}`, telemetry:t };
  }

  function renderResults(report) {
    refs.reportCode.textContent = report.code; refs.resultsTitle.textContent = report.title; refs.resultsVerdict.textContent = report.verdict; refs.tier.textContent = report.tier; refs.survival.textContent = report.survival; refs.reportSummary.textContent = report.summary; refs.recommendation.textContent = report.recommendation;
    const degrees = report.score * 3.6; const scoreColor = report.score >= 70 ? 'var(--cyan)' : report.score >= 45 ? 'var(--amber)' : 'var(--coral)'; refs.scoreRing.style.background = `conic-gradient(${scoreColor} 0deg ${degrees}deg, rgba(103,232,249,.1) ${degrees}deg 360deg)`;
    refs.scoreValue.textContent = '00';
    window.setTimeout(() => { const start=performance.now(); const duration=900; const tick=(now)=>{ const progress=clamp((now-start)/duration,0,1); const eased=1-Math.pow(1-progress,3); refs.scoreValue.textContent=String(Math.round(report.score*eased)).padStart(2,'0'); if(progress<1) window.requestAnimationFrame(tick); }; window.requestAnimationFrame(tick); }, state.reduceMotion ? 0 : 260);
    refs.categories.innerHTML = report.categories.map((category) => `<div class="category-row"><span>${category.name}</span><div class="category-track"><i style="width:${Math.round(category.score)}%;background:${category.score >= 70 ? 'var(--cyan)' : category.score >= 45 ? 'var(--amber)' : 'var(--coral)'}"></i></div><strong>${Math.round(category.score)}</strong></div>`).join('');
    refs.strengths.innerHTML = report.strengths.slice(0,4).map((item)=>`<div class="report-item">${item}</div>`).join(''); refs.risks.innerHTML = report.risks.slice(0,4).map((item)=>`<div class="report-item">${item}</div>`).join('');
  }

  function bindEvents() {
    refs.create.addEventListener('click', beginSession); refs.sampleBoundary.addEventListener('click', () => acceptBoundary()); refs.restart.addEventListener('click', beginSession); byId('brandHome').addEventListener('click', (event)=>{event.preventDefault();goHome();}); byId('gameBrandHome').addEventListener('click', (event)=>{event.preventDefault();goHome();});
    refs.done.addEventListener('click', examineCountry); refs.closeResults.addEventListener('click', ()=>{refs.results.classList.add('hidden'); if(state.phase==='results'){state.phase='build';setPhase('build');}}); refs.closeReport.addEventListener('click', ()=>{refs.results.classList.add('hidden');state.phase='build';setPhase('build');notify('Report closed. Your country remains on the map.');}); refs.reportRestart.addEventListener('click', beginSession);
    refs.rotate.addEventListener('click', rotateSelected); refs.duplicate.addEventListener('click', duplicateSelected); refs.remove.addEventListener('click', removeSelected); refs.rotateTool.addEventListener('click', rotatePlacementTool);
    refs.search.addEventListener('input', (event)=>{state.search=event.target.value;renderCatalog();}); byId('zoomInBtn').addEventListener('click',()=>zoomMap(.1)); byId('zoomOutBtn').addEventListener('click',()=>zoomMap(-.1)); byId('centerMapBtn').addEventListener('click',centerMap);
    refs.canvas.addEventListener('pointerdown',handlePointerDown); refs.canvas.addEventListener('pointermove',handlePointerMove); refs.canvas.addEventListener('pointerup',handlePointerUp); refs.canvas.addEventListener('pointercancel',handlePointerUp); refs.canvas.addEventListener('wheel',(event)=>{event.preventDefault();zoomMap(event.deltaY>0?-.06:.06);},{passive:false});
    byId('buildCollapse').addEventListener('click',()=>{byId('buildPanel').classList.toggle('collapsed');});
    window.addEventListener('resize',resizeCanvas);
    document.addEventListener('keydown',(event)=>{
      const tag=(event.target?.tagName||'').toLowerCase(); const typing=tag==='input'||tag==='textarea';
      if ((event.metaKey||event.ctrlKey) && event.key.toLowerCase()==='z') { event.preventDefault(); event.shiftKey?redo():undo(); return; }
      if (typing && event.key !== 'Escape') return;
      if (event.key==='Escape') { state.selectedTool=null; state.toolRotation=0; state.selectedId=null; renderCatalog(); updateInspector(); setPhase(state.phase==='boundary'?'boundary':'build'); return; }
      if (event.key.toLowerCase()==='r') { event.preventDefault(); state.selectedTool ? rotatePlacementTool() : rotateSelected(); } if (event.key==='Delete' || event.key==='Backspace') removeSelected(); if (event.key.toLowerCase()==='b') refs.search.focus(); if (event.key==='/') { event.preventDefault(); refs.search.focus(); }
    });
  }

  function loop() { draw(); window.requestAnimationFrame(loop); }
  function init() { bindEvents(); renderTabs(); renderCatalog(); resizeCanvas(); setPhase('landing'); loop(); }
  init();
})();
