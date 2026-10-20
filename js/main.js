(function(){
  "use strict";

  /* ============ HEADER HEIGHT (для мобильного меню) ============ */
  var header = document.querySelector('.site-header');
  function setHeaderH(){
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  setHeaderH();
  window.addEventListener('resize', setHeaderH);

  /* ============ MOBILE NAV ============ */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  function closeNav(){
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Открыть меню');
  }
  function openNav(){
    nav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Закрыть меню');
  }

  navToggle.addEventListener('click', function(){
    if (nav.classList.contains('is-open')) closeNav(); else openNav();
  });

  // клик по пункту меню — закрываем
  nav.addEventListener('click', function(e){
    if (e.target.tagName === 'A') closeNav();
  });

  // клик вне меню — закрываем
  document.addEventListener('click', function(e){
    if (!nav.classList.contains('is-open')) return;
    if (nav.contains(e.target) || navToggle.contains(e.target)) return;
    closeNav();
  });

  // Esc — закрываем
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeNav();
  });

  /* ============ ACTIVE SECTION (IntersectionObserver) ============ */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav a[href^="#"]');

  if ('IntersectionObserver' in window && sections.length){
    var navObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          var id = entry.target.id;
          navLinks.forEach(function(link){
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function(s){ navObs.observe(s); });
  }

  /* ============ TO TOP ============ */
  var toTop = document.querySelector('.to-top');
  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      toTop.hidden = window.scrollY < 800;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============ TRACK → FORM ============ */
  document.querySelectorAll('[data-track]').forEach(function(el){
    el.addEventListener('click', function(){
      var t = el.getAttribute('data-track');
      var sel = document.getElementById('track');
      if (!sel || !t) return;
      var match = Array.prototype.find.call(sel.options, function(o){ return o.text === t; });
      if (match) sel.value = match.value || match.text;
    });
  });

  /* ============ PRIVACY MODAL ============ */
  var privacyDialog = document.getElementById('privacy-modal');
  document.querySelectorAll('[data-open-privacy]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      if (privacyDialog && typeof privacyDialog.showModal === 'function'){
        privacyDialog.showModal();
      } else {
        alert('Политика конфиденциальности доступна по запросу: hello@algoarena.ru');
      }
    });
  });

  /* ============ FORM ============ */
  var form = document.getElementById('contact-form');
  var feedback = form.querySelector('.form__feedback');
  var submitBtn = form.querySelector('button[type="submit"]');

  function setFeedback(kind, text){
    feedback.className = 'form__feedback form__feedback--' + kind;
    feedback.textContent = text;
    feedback.hidden = false;
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();

    // проверка
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    var firstInvalid = null;
    fields.forEach(function(f){
      if (!f.checkValidity()){
        f.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = f;
      } else {
        f.removeAttribute('aria-invalid');
      }
    });

    if (firstInvalid){
      setFeedback('error', 'Проверьте выделенные поля: ' + (firstInvalid.labels && firstInvalid.labels[0] ? firstInvalid.labels[0].textContent.trim() : firstInvalid.name));
      firstInvalid.focus();
      return;
    }

    // имитация отправки (замените на fetch к вашему бэкенду)
    submitBtn.disabled = true;
    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправляем…';
    setFeedback('success', 'Отправляем заявку…');

    setTimeout(function(){
      // TODO: fetch('/api/lead', { method:'POST', body:new FormData(form) })
      form.querySelectorAll('.field, .check, button[type="submit"], .form__note').forEach(function(el){
        el.hidden = true;
      });
      setFeedback('success', 'Спасибо! Заявка отправлена. Координатор свяжется в течение двух часов в рабочее время.');
    }, 900);
  });

  // сброс aria-invalid при вводе
  form.addEventListener('input', function(e){
    if (e.target.hasAttribute && e.target.hasAttribute('aria-invalid')){
      if (e.target.checkValidity()) e.target.removeAttribute('aria-invalid');
    }
  });

})();

/* ===================================================================
   MICRO-INTERACTIONS — независимый IIFE, старая логика выше не тронута.
   Все эффекты отключаются при prefers-reduced-motion и на тач-устройствах
   там, где это уместно.
   =================================================================== */
(function(){
  "use strict";

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var finePointer  = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var hasIO        = 'IntersectionObserver' in window;

  function safe(fn){
    try{ fn(); }
    catch(err){ if(window.console && console.warn) console.warn('[micro-interactions]', err); }
  }

  /* ============ 1. SCROLL REVEAL (fade-in-up через IntersectionObserver) ============ */
  safe(function(){
    if(reduceMotion || !hasIO) return;
    var groups = [
      '.section-head',
      '.about__list li',
      '.grid-4 > .card',
      '.grid-3 > .benefit',
      '.grid-3 > .testimonial',
      '.results__grid > div',
      '.stats > .stat',
      '.plans > .plan',
      '.schedule',
      '.faq > details',
      '.contact-list li',
      '#contacts .form'
    ];
    var els = [];
    groups.forEach(function(sel){
      Array.prototype.forEach.call(document.querySelectorAll(sel), function(el, i){
        el.classList.add('reveal');
        el.style.setProperty('--rd', Math.min(i, 4) * 70 + 'ms');
        els.push(el);
      });
    });
    if(!els.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function(el){ io.observe(el); });
  });

  /* ============ 2. AURORA BORDER GLOW (--mx/--my следят за курсором) ============ */
  safe(function(){
    if(!finePointer) return;
    Array.prototype.forEach.call(
      document.querySelectorAll('.card, .benefit, .plan, .testimonial'),
      function(el){
        var rect = null;
        function paint(e){
          if(!rect) return;
          el.style.setProperty('--mx', (e.clientX - rect.left).toFixed(1) + 'px');
          el.style.setProperty('--my', (e.clientY - rect.top).toFixed(1) + 'px');
        }
        el.addEventListener('pointerenter', function(e){ rect = el.getBoundingClientRect(); paint(e); }, {passive:true});
        el.addEventListener('pointermove', function(e){ if(!rect) rect = el.getBoundingClientRect(); paint(e); }, {passive:true});
        el.addEventListener('pointerleave', function(){ rect = null; }, {passive:true});
      }
    );
  });

  /* ============ 3. MAGNETIC BUTTONS (притяжение CTA к курсору) ============ */
  safe(function(){
    if(reduceMotion || !finePointer) return;
    Array.prototype.forEach.call(
      document.querySelectorAll('.hero__actions .btn, .header__cta'),
      function(btn){
        btn.addEventListener('pointermove', function(e){
          var r = btn.getBoundingClientRect();
          var dx = (e.clientX - r.left - r.width / 2) / (r.width / 2 || 1);
          var dy = (e.clientY - r.top - r.height / 2) / (r.height / 2 || 1);
          btn.style.transform = 'translate(' + (dx * 7).toFixed(1) + 'px,' + (dy * 5).toFixed(1) + 'px)';
        }, {passive:true});
        btn.addEventListener('pointerleave', function(){ btn.style.transform = ''; }, {passive:true});
      }
    );
  });

  /* ============ 4. COUNTERS (цифры плавно накручиваются от 0) ============ */
  safe(function(){
    if(reduceMotion || !hasIO) return;
    var nums = document.querySelectorAll('.hero__stats b, .stats .stat b');
    if(!nums.length) return;

    function animate(el){
      var original = el.textContent;
      var m = original.match(/^(\D*)(\d+(?:[ \u00A0]\d{3})*)(.*)$/);
      if(!m) return;
      var prefix = m[1], suffix = m[3];
      var sepMatch = m[2].match(/[ \u00A0]/);
      var sep = sepMatch ? sepMatch[0] : '';
      var target = parseInt(m[2].replace(/[ \u00A0]/g, ''), 10);
      if(!isFinite(target)) return;

      function format(v){
        var s = String(v);
        if(sep) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
        return prefix + s + suffix;
      }

      var delay = 0;
      if(el.parentNode){
        delay = Math.max(0, Array.prototype.indexOf.call(el.parentNode.children, el)) * 100;
      }
      var startTs = null, dur = 1500;
      function step(ts){
        if(startTs === null) startTs = ts;
        var p = Math.min((ts - startTs) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(Math.round(target * eased));
        if(p < 1) requestAnimationFrame(step);
      }
      setTimeout(function(){ requestAnimationFrame(step); }, delay);
    }

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ io.unobserve(e.target); animate(e.target); }
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(nums, function(el){ io.observe(el); });
  });

  /* ============ 5. SPOTLIGHT (мягкий свет следует за курсором по фону) ============ */
  safe(function(){
    if(reduceMotion || !finePointer) return;
    var spot = document.createElement('div');
    spot.className = 'cursor-spotlight';
    spot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spot);
    var x = -500, y = -500, queued = false;
    function paint(){
      queued = false;
      spot.style.setProperty('--sx', x + 'px');
      spot.style.setProperty('--sy', y + 'px');
      spot.classList.add('is-on');
    }
    document.addEventListener('pointermove', function(e){
      x = e.clientX; y = e.clientY;
      if(!queued){ queued = true; requestAnimationFrame(paint); }
    }, {passive:true});
  });

  /* ============ 6. ЖИВОЙ ТЕРМИНАЛ (печатная машинка, клик = допечатать) ============ */
  safe(function(){
    if(reduceMotion || !hasIO) return;
    var term = document.querySelector('.terminal');
    if(!term) return;
    var lines = Array.prototype.slice.call(term.querySelectorAll('p'));
    if(!lines.length) return;

    /* токенизация: <span class="prompt|out|dim"> сохраняется при печати */
    function parse(html){
      var tokens = [], re = /<span class="([^"]*)">([\s\S]*?)<\/span>/g, last = 0, m;
      while((m = re.exec(html))){
        if(m.index > last) tokens.push({ t: html.slice(last, m.index), c: '' });
        tokens.push({ t: m[2], c: m[1] });
        last = m.index + m[0].length;
      }
      if(last < html.length) tokens.push({ t: html.slice(last), c: '' });
      var chars = [];
      tokens.forEach(function(tk){
        for(var i = 0; i < tk.t.length; i++){ chars.push({ ch: tk.t.charAt(i), c: tk.c }); }
      });
      return chars;
    }
    function esc(ch){
      return ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch;
    }
    function render(el, chars, count){
      var html = '', i = 0;
      while(i < count){
        var cls = chars[i].c, seg = '';
        while(i < count && chars[i].c === cls){ seg += esc(chars[i].ch); i++; }
        html += cls ? '<span class="' + cls + '">' + seg + '</span>' : seg;
      }
      el.innerHTML = html;
    }

    var items = lines.map(function(p){
      return { el: p, orig: p.innerHTML, chars: parse(p.innerHTML) };
    });
    var idx = 0, pos = 0, timer = null, started = false, finished = false;

    function attachCursor(el){
      var cur = term.querySelector('.term-cursor');
      if(!cur){
        cur = document.createElement('span');
        cur.className = 'term-cursor';
        cur.setAttribute('aria-hidden', 'true');
      }
      el.appendChild(cur);
    }

    function finishAll(){
      finished = true;
      if(timer){ clearTimeout(timer); timer = null; }
      items.forEach(function(it){ it.el.innerHTML = it.orig; });
      var c = term.querySelector('.term-cursor');
      if(c && c.parentNode) c.parentNode.removeChild(c);
    }

    function step(){
      if(finished) return;
      if(idx >= items.length){ finished = true; return; }
      var it = items[idx], chars = it.chars;
      if(pos >= chars.length){ idx++; pos = 0; timer = setTimeout(step, 300); return; }
      pos++;
      render(it.el, chars, pos);
      attachCursor(it.el);
      var ch = chars[pos - 1].ch;
      var delay = 16 + Math.random() * 20;
      if(ch === '\u2500') delay = 5;          /* разделители ─ печатаются мгновенно */
      if(ch === '.') delay += 60;
      if(ch === '$') delay += 130;
      timer = setTimeout(step, delay);
    }

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting || started) return;
        started = true;
        io.disconnect();
        items.forEach(function(it){ it.el.innerHTML = ''; });
        step();
      });
    }, { threshold: 0.45 });
    io.observe(term);

    term.addEventListener('click', function(){
      if(started && !finished) finishAll();
    });
  });

})();

