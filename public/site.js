/* Super Flow — site interactions */
(function () {
  var reduced = document.documentElement.dataset.motion === 'reduced';

  // --- header scrolled + scroll progress ---
  var header = document.getElementById('siteHeader');
  var progress = document.querySelector('.scroll-progress span');
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('scrolled', y > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- duplicate marquee for seamless loop ---
  var track = document.getElementById('marqueeTrack');
  if (track && !reduced) {
    track.innerHTML += track.innerHTML;
  }

  // --- reveal on scroll ---
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // --- count-up stats ---
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-counter'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var dur = 1100, start = null;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  // --- FAQ accordion ---
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // --- populate hub activity heatmap ---
  var heat = document.getElementById('hubHeat');
  if (heat) {
    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var levels = ['var(--bg-tint)',
      'color-mix(in oklab, var(--accent) 22%, var(--bg-tint))',
      'color-mix(in oklab, var(--accent) 45%, var(--bg-tint))',
      'color-mix(in oklab, var(--accent) 68%, var(--bg-tint))',
      'var(--accent)'];
    var html = '';
    for (var d = 0; d < 7; d++) {
      html += '<div class="heat-day">' + days[d] + '</div><div class="heat-row">';
      for (var h = 0; h < 24; h++) {
        // weekday work hours busiest; quiet nights/weekends
        var work = (h >= 9 && h <= 18) ? 1 : (h >= 7 && h <= 21 ? 0.5 : 0.08);
        var wk = d < 5 ? 1 : 0.4;
        var base = work * wk;
        var lvl = Math.min(4, Math.floor(base * 4 * (0.55 + Math.random() * 0.6)));
        html += '<div class="heat-cell" style="background:' + levels[lvl] + '"></div>';
      }
      html += '</div>';
    }
    heat.innerHTML = html;
  }

  // --- subtle tilt on demo window ---
  var win = document.getElementById('demoWindow');
  if (win && !reduced && window.matchMedia('(pointer:fine)').matches) {
    var wrap = win.parentElement;
    wrap.addEventListener('mousemove', function (ev) {
      var r = win.getBoundingClientRect();
      var rx = ((ev.clientY - r.top) / r.height - 0.5) * -3;
      var ry = ((ev.clientX - r.left) / r.width - 0.5) * 3;
      win.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    });
    wrap.addEventListener('mouseleave', function () { win.style.transform = ''; });
    win.style.transition = 'transform .3s ease';
  }
})();
