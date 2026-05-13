(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

  // ===== 名额倒计时（轻量动效，让活动更真实） =====
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

  // ===== Toast =====
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ===== 表单校验与提交 =====
  const form = $('#leadForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const phone = (data.get('phone') || '').toString().trim();
      const interest = (data.get('interest') || '').toString().trim();
      const agreed = $('#agree').checked;

      if (!name) return toast('请输入您的称呼');
      if (!/^1[3-9]\d{9}$/.test(phone)) return toast('请输入正确的11位手机号');
      if (!interest) return toast('请选择感兴趣方向');
      if (!agreed) return toast('请先勾选同意用户协议');

      const btn = form.querySelector('.form__btn');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = '提交中...';

      // 模拟提交（实际接入抖音转化API / 后端）
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = original;
        toast('🎉 提交成功！专属顾问 5 分钟内联系您');
        form.reset();
        $('#agree').checked = true;

        // 抖音/巨量引擎转化埋点（示例）
        try {
          if (window._tt_ad_track) window._tt_ad_track('form_submit');
        } catch (err) {}
      }, 900);
    });

    // 手机号只允许数字
    const phoneInput = form.querySelector('input[name=phone]');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 11);
      });
    }
  }

  // ===== 锚点平滑滚动 =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
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

  // ===== 滚动时浮动 CTA 在表单区域隐藏，避免遮挡按钮 =====
  const floatCta = $('.float-cta');
  const formSection = $('#form');
  if (floatCta && formSection && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        floatCta.style.opacity = en.isIntersecting ? '0' : '1';
        floatCta.style.pointerEvents = en.isIntersecting ? 'none' : 'auto';
      });
    }, { threshold: 0.25 });
    io.observe(formSection);
  }
})();
