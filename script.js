(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // ===== 1. 轮播图 =====
  (function carousel() {
    const track = $('#carouselTrack');
    const dotsWrap = $('#carouselDots');
    if (!track || !dotsWrap) return;
    const slides = $$('.carousel__slide', track);
    const dots = $$('.dot', dotsWrap);
    if (slides.length < 2) return;

    let idx = 0;
    let timer = null;

    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('active', k === idx));
    }
    function next() { go(idx + 1); }
    function play() { stop(); timer = setInterval(next, 3500); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); play(); }));

    // 手指滑动
    let sx = 0, dx = 0, dragging = false;
    track.addEventListener('touchstart', e => {
      stop();
      sx = e.touches[0].clientX;
      dx = 0;
      dragging = true;
    }, { passive: true });
    track.addEventListener('touchmove', e => {
      if (!dragging) return;
      dx = e.touches[0].clientX - sx;
    }, { passive: true });
    track.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      play();
    });

    play();
  })();

  // ===== 2. 名额倒计时（让活动更真实） =====
  const leftEl = $('#leftCount');
  if (leftEl) {
    let n = parseInt(leftEl.textContent, 10) || 37;
    setInterval(() => {
      if (n > 8 && Math.random() < 0.35) {
        n -= 1;
        leftEl.textContent = n;
      }
    }, 8000);
  }

  // ===== 3. Toast =====
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ===== 4. 表单（两份表单共用一套逻辑） =====
  $$('.lead-form').forEach(form => {
    const phone = form.querySelector('input[name=phone]');
    if (phone) {
      phone.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 11);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const tel = (data.get('phone') || '').toString().trim();
      const agree = form.querySelector('input[type=checkbox]');
      const position = form.dataset.position || 'top';

      if (!name) return toast('请输入您的姓名');
      if (!/^1[3-9]\d{9}$/.test(tel)) return toast('请输入正确的11位手机号');
      if (agree && !agree.checked) return toast('请先勾选同意用户协议');

      const btn = form.querySelector('.lead-form__btn');
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>提交中...</span>';

      // 模拟提交（实际接入抖音转化API / 后端）
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = original;
        toast('🎉 提交成功！专属顾问 5 分钟内联系您');
        form.reset();
        if (agree) agree.checked = true;

        // 抖音/巨量引擎转化埋点（示例）
        try {
          if (window._tt_ad_track) window._tt_ad_track('form_submit', { position });
        } catch (err) {}
      }, 800);
    });
  });

  // ===== 5. 锚点平滑滚动 =====
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== 6. 滚动到底部表单时隐藏悬浮 CTA，避免遮挡 =====
  const floatCta = $('.float-cta');
  const formBottom = $('#formBottom');
  if (floatCta && formBottom && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        floatCta.style.opacity = en.isIntersecting ? '0' : '1';
        floatCta.style.pointerEvents = en.isIntersecting ? 'none' : 'auto';
      });
    }, { threshold: 0.25 });
    io.observe(formBottom);
  }
})();
