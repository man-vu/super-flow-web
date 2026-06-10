/* Super Flow — hero demo loop: F9 → listen → polish → typed text */
(function () {
  var reduced = document.documentElement.dataset.motion === 'reduced';

  var compose = document.getElementById('composeField');
  var pill = document.getElementById('overlayPill');
  var ovLabel = document.getElementById('ovLabel');
  var wave = document.getElementById('wave');
  var saidCap = document.getElementById('saidCap');
  var saidText = document.getElementById('saidText');
  if (!compose || !pill) return;

  var HEARD = "so basically um can you send me the the report by friday and uh thanks";
  var CLEAN = "Can you send me the report by Friday? Thanks!";
  var IDLE = '<span class="ph">Click here, press </span><kbd>F9</kbd><span class="ph">, and just talk…</span>';

  // build waveform bars
  var BARS = 16, bars = [];
  for (var i = 0; i < BARS; i++) {
    var b = document.createElement('i');
    wave.appendChild(b);
    bars.push(b);
  }
  var waveTimer = null;
  function startWave() {
    stopWave();
    waveTimer = setInterval(function () {
      for (var i = 0; i < bars.length; i++) {
        bars[i].style.height = (4 + Math.random() * 18).toFixed(0) + 'px';
      }
    }, 110);
  }
  function stopWave(flat) {
    if (waveTimer) { clearInterval(waveTimer); waveTimer = null; }
    if (flat) for (var i = 0; i < bars.length; i++) bars[i].style.height = '4px';
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function setMode(mode, label) {
    pill.setAttribute('data-mode', mode);
    ovLabel.textContent = label;
  }

  // type a string into a target, returns promise
  function typeInto(el, prefixHTML, text, perChar) {
    return new Promise(function (resolve) {
      var i = 0;
      (function step() {
        el.innerHTML = prefixHTML + text.slice(0, i) + '<span class="caret"></span>';
        if (i++ <= text.length) setTimeout(step, perChar);
        else resolve();
      })();
    });
  }

  if (reduced) {
    // show resolved end-state, no animation
    compose.innerHTML = CLEAN + '<span class="caret"></span>';
    pill.classList.remove('show');
    stopWave(true);
    return;
  }

  var running = true;

  async function loop() {
    while (running) {
      // 1. idle
      compose.innerHTML = IDLE;
      pill.classList.remove('show');
      saidCap.classList.remove('show');
      stopWave(true);
      await sleep(2200);

      // 2. F9 → listening
      compose.innerHTML = '<span class="caret"></span>';
      setMode('listen', 'Listening');
      pill.classList.add('show');
      startWave();
      await sleep(500);

      // 3. stream heard text
      saidText.textContent = '';
      saidCap.classList.add('show');
      var words = HEARD.split(' ');
      for (var w = 0; w < words.length; w++) {
        if (!running) return;
        saidText.textContent += (w ? ' ' : '') + words[w];
        await sleep(150);
      }
      await sleep(600);

      // 4. polishing
      setMode('polish', 'Polishing');
      stopWave(true);
      saidCap.classList.remove('show');
      await sleep(900);

      // 5. type clean text in place
      await typeInto(compose, '', CLEAN, 26);
      setMode('done', 'Done');
      await sleep(1100);

      // 6. linger then loop
      pill.classList.remove('show');
      await sleep(1600);
    }
  }

  // start when hero demo near viewport
  var started = false;
  function kickoff() {
    if (started) return; started = true; loop();
  }
  var demo = document.getElementById('demo');
  if ('IntersectionObserver' in window && demo) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { kickoff(); io.disconnect(); } });
    }, { threshold: 0.25 });
    io.observe(demo);
  } else {
    kickoff();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; }
    else if (!running) { running = true; started = false; kickoff(); }
  });
})();
