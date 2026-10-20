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
