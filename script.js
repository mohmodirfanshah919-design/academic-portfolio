/* Zuha Kanji — site behaviour.
   A classic deferred script (not a module), so the page works even when opened from disk.
   Three.js is loaded on demand through the import map in index.html. */
(function () {
  'use strict';

  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  function onMediaChange(mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); }

  /* Toast -------------------------------------------------------------- */
  var toastTimer;
  function announce(message) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { toast.textContent = ''; }, 300);
    }, 2400);
  }

  /* Theme -------------------------------------------------------------- */
  function initTheme() {
    var btn = $('#themeToggle');
    if (!btn) return;
    var root = document.documentElement;
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    var current = function () { return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light'); };
    var sync = function () { btn.setAttribute('aria-pressed', String(current() === 'dark')); };
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('zk-theme', next);
      sync();
    });
    onMediaChange(systemDark, sync);
    sync();
  }

  /* Navigation: mobile menu, active section, borehole-log rail ---------- */
  function initNavigation() {
    var header = $('.site-header');
    var nav = $('#siteNav');
    var toggle = $('#menuToggle');
    var desktop = window.matchMedia('(min-width: 900px)');

    function isOpen() { return toggle && toggle.getAttribute('aria-expanded') === 'true'; }
    function setOpen(open, returnFocus) {
      if (!nav || !toggle) return;
      nav.setAttribute('data-open', String(open));
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) { var first = $('a', nav); if (first) first.focus(); }
      else if (returnFocus) toggle.focus();
    }
    if (nav && toggle) {
      toggle.addEventListener('click', function () { setOpen(!isOpen()); });
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) setOpen(false, true); });
      document.addEventListener('click', function (e) { if (isOpen() && !e.target.closest('#siteNav, #menuToggle')) setOpen(false); });
      onMediaChange(desktop, function () { if (desktop.matches) setOpen(false); });
    }

    var links = $$('a[data-section]');
    var ids = [];
    links.forEach(function (a) { if (ids.indexOf(a.dataset.section) < 0) ids.push(a.dataset.section); });
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var rail = $('.log-rail');
    var railItems = rail ? $$('.log-strata li', rail) : [];
    var marker = rail ? $('.log-marker', rail) : null;
    var activeId = null;

    function sizeRail() {
      if (!rail || !railItems.length || getComputedStyle(rail).display === 'none') return;
      sections.forEach(function (sec, i) {
        if (railItems[i]) railItems[i].style.setProperty('--grow', Math.max(sec.offsetHeight, 1) / 100);
      });
    }

    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      links.forEach(function (a) {
        if (a.dataset.section === id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    var ticking = false;
    function update() {
      ticking = false;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
      if (!sections.length) return;
      var readLine = window.scrollY + window.innerHeight * 0.35;
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      var current = null;
      sections.forEach(function (sec) { if (sec.getBoundingClientRect().top + window.scrollY <= readLine) current = sec.id; });
      if (atBottom) current = sections[sections.length - 1].id;
      setActive(current);

      if (marker && rail.offsetHeight) {
        var first = sections[0].getBoundingClientRect().top + window.scrollY;
        var last = sections[sections.length - 1];
        var end = last.getBoundingClientRect().top + window.scrollY + last.offsetHeight;
        var progress = atBottom ? 1 : Math.min(Math.max((readLine - first) / (end - first), 0), 1);
        marker.style.setProperty('--marker-y', (progress * (rail.offsetHeight - 3)).toFixed(1) + 'px');
      }
    }
    function requestUpdate() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', function () { sizeRail(); requestUpdate(); });
    window.addEventListener('load', function () { sizeRail(); requestUpdate(); });
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () { sizeRail(); requestUpdate(); });
      sections.forEach(function (s) { ro.observe(s); });
    }
    sizeRail();
    update();
  }

  /* Copy buttons (citations, email) ------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(area);
      if (ok) resolve(); else reject(new Error('Copy command unavailable'));
    });
  }
  function initCopyButtons() {
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        copyText(btn.dataset.copy).then(function () {
          announce(btn.dataset.copied || 'Copied');
        }, function () {
          announce('Copying is blocked in this browser. Select the text and copy it manually.');
        });
      });
    });
  }

  /* Publications: search + type filter --------------------------------- */
  function initPublications() {
    var list = $('#pubList');
    if (!list) return;
    var items = $$('.pub', list);
    var input = $('#pubSearch');
    var status = $('#pubStatus');
    var empty = $('#pubEmpty');
    var clear = $('#pubClear');
    var filterBtns = $$('[data-filter]');
    var filter = 'all';

    var normalise = function (s) {
      return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2010-\u2015-]/g, ' ');
    };
    var haystacks = items.map(function (el) { return normalise((el.dataset.keywords || '') + ' ' + el.textContent); });
    var noun = function (n) { return n === 1 ? 'publication' : 'publications'; };

    function apply() {
      var terms = normalise(input ? input.value : '').split(/\s+/).filter(Boolean);
      var shown = 0;
      items.forEach(function (el, i) {
        var typeOk = filter === 'all' || el.dataset.type === filter;
        var textOk = terms.every(function (t) { return haystacks[i].indexOf(t) >= 0; });
        el.hidden = !(typeOk && textOk);
        if (!el.hidden) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (status) {
        status.textContent = shown === items.length
          ? items.length + ' ' + noun(items.length)
          : 'Showing ' + shown + ' of ' + items.length + ' ' + noun(items.length);
      }
    }
    function setFilter(value) {
      filter = value;
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === value)); });
      apply();
    }

    filterBtns.forEach(function (b) { b.addEventListener('click', function () { setFilter(b.dataset.filter); }); });
    if (input) input.addEventListener('input', apply);
    if (clear) clear.addEventListener('click', function () { if (input) input.value = ''; setFilter('all'); if (input) input.focus(); });
    apply();
  }

  /* 3D concept model ---------------------------------------------------- */
  var VIEWS = {
    footing: {
      title: 'Footing system',
      text: 'The footing and column sit on the ground surface, with the geocell layer visible through the translucent upper stratum.',
      cam: [6.9, 5.2, 8.2], target: [0, -0.35, 0]
    },
    geocell: {
      title: 'Geocell layer',
      text: 'The footing is lifted clear and the upper stratum faded so the honeycomb reinforcement beneath it can be seen. Geometry is illustrative, not a construction detail.',
      cam: [4.3, 4.6, 5.4], target: [0, -0.2, 0]
    },
    section: {
      title: 'Soil section',
      text: 'A cut through the soil mass shows the three strata and where the geocell sits beneath the footing. Real stratigraphy depends on site-specific investigation.',
      cam: [2.3, 2.1, 10.2], target: [0, -0.75, 0]
    }
  };
  var DEPTH_LABELS = ['Very shallow', 'Shallow', 'Moderate', 'Deep', 'Very deep'];
  var LOAD_LABELS = ['Very low', 'Low', 'Medium', 'High', 'Very high'];

  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }

  function initLab() {
    var stage = $('#modelStage');
    if (!stage) return;
    var ui = {
      status: $('#modelStatus'), loading: $('#modelLoading'), fallback: $('#modelFallback'),
      fallbackMsg: $('#fallbackMessage'), reload: $('#modelReload'),
      tools: $$('#modelToolbar .tool'), spin: $('#spinToggle'),
      title: $('#modelTitle'), desc: $('#modelDescription'),
      depth: $('#depthControl'), depthOut: $('#depthValue'),
      load: $('#loadControl'), loadOut: $('#loadValue'),
      views: $$('[data-view]')
    };
    var state = { view: 'footing', depth: 3, load: 3, spinning: !reducedMotion.matches };
    var engine = null;
    var started = false;

    function setStatus(text) { if (ui.status) ui.status.textContent = text; }
    function renderText() {
      var v = VIEWS[state.view];
      if (ui.title) ui.title.textContent = v.title;
      if (ui.desc) ui.desc.textContent = v.text;
      if (ui.depthOut) ui.depthOut.textContent = DEPTH_LABELS[state.depth - 1];
      if (ui.depth) ui.depth.setAttribute('aria-valuetext', DEPTH_LABELS[state.depth - 1]);
      if (ui.loadOut) ui.loadOut.textContent = LOAD_LABELS[state.load - 1];
      if (ui.load) ui.load.setAttribute('aria-valuetext', LOAD_LABELS[state.load - 1]);
      ui.views.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === state.view)); });
      if (ui.spin) ui.spin.setAttribute('aria-pressed', String(state.spinning));
    }

    ui.views.forEach(function (b) {
      b.addEventListener('click', function () {
        state.view = b.dataset.view;
        renderText();
        if (engine) engine.setView(state.view, true);
      });
    });
    if (ui.depth) ui.depth.addEventListener('input', function () { state.depth = +ui.depth.value; renderText(); if (engine) engine.setDepth(state.depth); });
    if (ui.load) ui.load.addEventListener('input', function () { state.load = +ui.load.value; renderText(); if (engine) engine.setLoad(state.load); });
    ui.tools.forEach(function (b) {
      b.addEventListener('click', function () {
        if (!engine) return;
        var a = b.dataset.action;
        if (a === 'left') engine.orbit(-Math.PI / 6);
        else if (a === 'right') engine.orbit(Math.PI / 6);
        else if (a === 'in') engine.zoom(0.82);
        else if (a === 'out') engine.zoom(1.22);
        else if (a === 'reset') engine.setView(state.view, true);
        else if (a === 'spin') { state.spinning = !state.spinning; engine.setSpin(state.spinning); renderText(); }
      });
    });
    if (ui.reload) ui.reload.addEventListener('click', function () { window.location.reload(); });

    function fail(message, canRetry) {
      if (ui.loading) ui.loading.hidden = true;
      if (ui.fallback) ui.fallback.hidden = false;
      if (ui.fallbackMsg) ui.fallbackMsg.textContent = message;
      if (ui.reload) ui.reload.hidden = !canRetry;
      $('#modelToolbar').hidden = true;
      var hint = $('.viewer-hint'); if (hint) hint.hidden = true;
      setStatus('Static cross-section');
    }

    function start() {
      if (started) return;
      started = true;
      if (!hasWebGL()) {
        fail('3D graphics (WebGL) are turned off or unsupported on this device, so a static cross-section is shown instead.', false);
        return;
      }
      if (ui.loading) ui.loading.hidden = false;
      setStatus('Loading 3D model');
      var timeout = new Promise(function (_, reject) { setTimeout(function () { reject(new Error('Timed out loading Three.js')); }, 15000); });
      Promise.race([Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')]), timeout])
        .then(function (mods) {
          engine = createEngine(mods[0], mods[1].OrbitControls, stage, state, function (spinning) { state.spinning = spinning; renderText(); });
          if (ui.loading) ui.loading.hidden = true;
          ui.tools.forEach(function (b) { b.disabled = false; });
          setStatus('Interactive 3D view');
        })
        .catch(function (err) {
          console.warn('3D model unavailable, showing static cross-section.', err);
          engine = null;
          var canvas = $('canvas', stage); if (canvas) canvas.remove();
          fail('The 3D library could not be loaded (check the connection or any content blocker), so a static cross-section is shown instead.', true);
        });
    }

    renderText();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
      }, { rootMargin: '400px 0px' });
      io.observe(stage);
    } else {
      start();
    }
  }

  /* Builds the Three.js scene. Geometry is created once; controls only move,
     show or hide existing objects, so nothing is rebuilt on slider input. */
  function createEngine(T, OrbitControls, stage, state, onSpinChange) {
    var W = 6, D = 4.5, B = 1.5;
    var STRATA = [
      { top: 0, bottom: -1.1, color: 0xC4A477 },
      { top: -1.1, bottom: -2.1, color: 0x9A7752 },
      { top: -2.1, bottom: -3.0, color: 0x6F5641 }
    ];
    var DEPTHS = [0.05, 0.18, 0.32, 0.5, 0.7];   // illustrative offsets, scene units
    var CELL_R = 0.2, CELL_T = 0.024, CELL_H = 0.3;

    var disposables = [];
    function keep(o) { disposables.push(o); return o; }

    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    var canvas = renderer.domElement;
    canvas.setAttribute('role', 'img');
    stage.prepend(canvas);

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(36, 1, 0.1, 80);

    // Let normal page scrolling win over the canvas: wheel zoom only with Ctrl/⌘ (trackpad pinch sends Ctrl).
    // Registered before OrbitControls so it can stop the event reaching them.
    canvas.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.metaKey) e.stopImmediatePropagation(); }, { capture: true });

    var controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4.5;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.autoRotateSpeed = 0.55;
    canvas.style.touchAction = 'pan-y';   // vertical swipes still scroll the page on touch screens

    // Lighting
    scene.add(new T.HemisphereLight(0xE4E9FF, 0x3A2C1E, 1.5));
    var sun = new T.DirectionalLight(0xFFF2DA, 2.3);
    sun.position.set(5, 9, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -5; sun.shadow.camera.right = 5; sun.shadow.camera.top = 5; sun.shadow.camera.bottom = -5;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 25;
    sun.shadow.bias = -0.0006;
    scene.add(sun);
    var rim = new T.DirectionalLight(0x9AAEFF, 0.9);
    rim.position.set(-6, 4, -6);
    scene.add(rim);

    // Soil: one full-width and one half-depth (cut) box per stratum
    var layers = STRATA.map(function (s, i) {
      var h = s.top - s.bottom;
      var mat = keep(new T.MeshStandardMaterial({ color: s.color, roughness: 0.95, metalness: 0, transparent: true, opacity: 1 }));
      var full = new T.Mesh(keep(new T.BoxGeometry(W, h, D)), mat);
      full.position.y = (s.top + s.bottom) / 2;
      full.receiveShadow = true;
      var half = new T.Mesh(keep(new T.BoxGeometry(W, h, D / 2)), mat);
      half.position.set(0, (s.top + s.bottom) / 2, -D / 4);
      half.receiveShadow = true;
      scene.add(full, half);
      return { full: full, half: half, mat: mat, index: i };
    });
    var edgeMat = keep(new T.LineBasicMaterial({ color: 0xF3F5FC, transparent: true, opacity: 0.35 }));
    var outlineFull = new T.LineSegments(keep(new T.EdgesGeometry(new T.BoxGeometry(W, 3, D))), edgeMat);
    outlineFull.position.y = -1.5;
    var outlineHalf = new T.LineSegments(keep(new T.EdgesGeometry(new T.BoxGeometry(W, 3, D / 2))), edgeMat);
    outlineHalf.position.set(0, -1.5, -D / 4);
    scene.add(outlineFull, outlineHalf);

    // Geocell: a honeycomb of hexagonal rings, drawn as two instanced meshes (front and back halves)
    function hexPath(path, r) {
      for (var k = 0; k < 6; k++) {
        var a = Math.PI / 6 + k * Math.PI / 3;
        if (k === 0) path.moveTo(r * Math.cos(a), r * Math.sin(a)); else path.lineTo(r * Math.cos(a), r * Math.sin(a));
      }
      path.closePath();
      return path;
    }
    var ring = hexPath(new T.Shape(), CELL_R);
    ring.holes.push(hexPath(new T.Path(), CELL_R - CELL_T));
    var cellGeo = keep(new T.ExtrudeGeometry(ring, { depth: CELL_H, bevelEnabled: false, curveSegments: 1 }));
    cellGeo.rotateX(-Math.PI / 2);
    var cellMat = keep(new T.MeshStandardMaterial({ color: 0xF2B33D, roughness: 0.5, metalness: 0.1 }));
    var front = [], back = [];
    var dx = Math.sqrt(3) * CELL_R, dz = 1.5 * CELL_R;
    for (var r = -8; r <= 8; r++) {
      var z = r * dz;
      if (Math.abs(z) > 1.65) continue;
      var off = (Math.abs(r) % 2) * dx / 2;
      for (var c = -10; c <= 10; c++) {
        var x = c * dx + off;
        if (Math.abs(x) > 2.15) continue;
        (z > 0.01 ? front : back).push([x, z]);
      }
    }
    function cells(points) {
      var mesh = new T.InstancedMesh(cellGeo, cellMat, points.length);
      var m = new T.Matrix4();
      points.forEach(function (p, i) { m.makeTranslation(p[0], 0, p[1]); mesh.setMatrixAt(i, m); });
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }
    var geocell = new T.Group();
    var cellsFront = cells(front), cellsBack = cells(back);
    geocell.add(cellsFront, cellsBack);
    scene.add(geocell);

    // Footing, column and load arrow move together
    var structure = new T.Group();
    var footing = new T.Mesh(keep(new T.BoxGeometry(B, 0.35, B)), keep(new T.MeshStandardMaterial({ color: 0xE3E7F2, roughness: 0.7 })));
    footing.position.y = 0.175;
    var column = new T.Mesh(keep(new T.BoxGeometry(0.48, 1.3, 0.48)), keep(new T.MeshStandardMaterial({ color: 0xC3CADB, roughness: 0.65 })));
    column.position.y = 0.35 + 0.65;
    footing.castShadow = column.castShadow = true;
    footing.receiveShadow = true;
    var arrowMat = keep(new T.MeshStandardMaterial({ color: 0xF2B33D, emissive: 0xF2B33D, emissiveIntensity: 0.35, roughness: 0.4 }));
    var shaft = new T.Mesh(keep(new T.CylinderGeometry(0.05, 0.05, 1, 16)), arrowMat);
    var head = new T.Mesh(keep(new T.ConeGeometry(0.15, 0.32, 24)), arrowMat);
    head.rotation.x = Math.PI;
    var arrow = new T.Group();
    arrow.add(shaft, head);
    structure.add(footing, column, arrow);
    scene.add(structure);

    var grid = new T.GridHelper(14, 28, 0x4A5DA8, 0x2A3A82);
    grid.position.y = -3.02;
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    keep(grid.geometry); keep(grid.material);
    scene.add(grid);

    // State application ------------------------------------------------
    var anim = null;              // active camera/structure transition
    var structureTargetY = 0;

    function setDepth(level) {
      geocell.position.y = -DEPTHS[level - 1] - CELL_H;
      requestRender();
    }
    function setLoad(level) {
      var len = 0.3 + level * 0.15;
      shaft.scale.y = len;
      shaft.position.y = 1.65 + 0.32 + 0.06 + len / 2;
      head.position.y = 1.65 + 0.16 + 0.06;
      var colour = level >= 4 ? 0xE9705C : 0xF2B33D;
      arrowMat.color.setHex(colour);
      arrowMat.emissive.setHex(colour);
      requestRender();
    }
    function applyVisibility(view) {
      var section = view === 'section';
      layers.forEach(function (l) {
        l.full.visible = !section;
        l.half.visible = section;
        var faded = !section && l.index === 0;
        l.mat.opacity = faded ? (view === 'geocell' ? 0.1 : 0.42) : 1;
        l.mat.depthWrite = !faded;
        l.mat.needsUpdate = true;
      });
      outlineFull.visible = !section;
      outlineHalf.visible = section;
      cellsFront.visible = !section;
      structureTargetY = view === 'geocell' ? 1.25 : 0;
      canvas.setAttribute('aria-label', 'Conceptual 3D model, ' + VIEWS[view].title.toLowerCase() + ' view: ' + VIEWS[view].text);
    }

    // Camera framing that adapts to the canvas aspect ratio
    function framedPosition(view) {
      var v = VIEWS[view];
      var target = new T.Vector3().fromArray(v.target);
      var dir = new T.Vector3().fromArray(v.cam).sub(target);
      var aspect = camera.aspect || 1.45;
      var scale = aspect < 1.45 ? Math.pow(1.45 / aspect, 0.8) : 1;
      return { pos: target.clone().add(dir.multiplyScalar(scale)), target: target };
    }
    function tweenTo(pos, target, animate) {
      if (!animate || reducedMotion.matches) {
        camera.position.copy(pos); controls.target.copy(target);
        structure.position.y = structureTargetY;
        anim = null; controls.update(); requestRender();
        return;
      }
      anim = {
        t0: performance.now(), dur: 750,
        fromPos: camera.position.clone(), toPos: pos,
        fromTarget: controls.target.clone(), toTarget: target,
        fromY: structure.position.y, toY: structureTargetY
      };
      requestRender();
    }
    function setView(view, animate) {
      applyVisibility(view);
      var f = framedPosition(view);
      tweenTo(f.pos, f.target, animate);
    }
    function orbit(angle) {
      var offset = camera.position.clone().sub(controls.target);
      var sph = new T.Spherical().setFromVector3(offset);
      sph.theta += angle;
      tweenTo(controls.target.clone().add(new T.Vector3().setFromSpherical(sph)), controls.target.clone(), true);
    }
    function zoom(factor) {
      var offset = camera.position.clone().sub(controls.target);
      var dist = Math.min(Math.max(offset.length() * factor, controls.minDistance), controls.maxDistance);
      tweenTo(controls.target.clone().add(offset.setLength(dist)), controls.target.clone(), true);
    }
    function setSpin(on) { controls.autoRotate = on; requestRender(); }

    // Stop auto-rotation once the visitor takes control
    controls.addEventListener('start', function () {
      anim = null;
      if (controls.autoRotate) { controls.autoRotate = false; onSpinChange(false); }
    });
    controls.addEventListener('change', requestRender);

    // Render loop: runs only while visible and something is moving
    var visible = true, running = false, idleFrames = 0;
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function frame(now) {
      if (anim) {
        var k = Math.min((now - anim.t0) / anim.dur, 1), e = ease(k);
        camera.position.lerpVectors(anim.fromPos, anim.toPos, e);
        controls.target.lerpVectors(anim.fromTarget, anim.toTarget, e);
        structure.position.y = anim.fromY + (anim.toY - anim.fromY) * e;
        if (k >= 1) anim = null;
        idleFrames = 0;
      }
      var moved = controls.update();
      renderer.render(scene, camera);
      if (moved || anim || controls.autoRotate) idleFrames = 0; else idleFrames++;
      if (idleFrames > 30 || !visible || document.hidden) { renderer.setAnimationLoop(null); running = false; }
    }
    function requestRender() {
      idleFrames = 0;
      if (!running && visible && !document.hidden) { running = true; renderer.setAnimationLoop(frame); }
    }

    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      requestRender();
    }

    var ro = new ResizeObserver(resize);
    ro.observe(stage);
    var io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; if (visible) requestRender(); });
    io.observe(stage);
    var onVisibility = function () { if (!document.hidden) requestRender(); };
    document.addEventListener('visibilitychange', onVisibility);

    window.addEventListener('pagehide', function (e) {
      if (e.persisted) return;   // keep the scene if the page goes into the back/forward cache
      renderer.setAnimationLoop(null);
      ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      controls.dispose();
      disposables.forEach(function (d) { if (d && d.dispose) d.dispose(); });
      renderer.dispose();
    });

    // Initial state
    resize();
    setDepth(state.depth);
    setLoad(state.load);
    controls.autoRotate = state.spinning;
    setView(state.view, false);

    return { setView: setView, setDepth: setDepth, setLoad: setLoad, orbit: orbit, zoom: zoom, setSpin: setSpin };
  }

  /* Boot ---------------------------------------------------------------- */
  function boot() {
    initTheme();
    initNavigation();
    initCopyButtons();
    initPublications();
    initLab();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
