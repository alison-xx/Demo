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

  // ===== 4.5 最新成交客户持续滚动 =====
  (function ticker() {
    const list = $('#tickerList');
    if (!list) return;

    const SURNAMES = ['王','李','张','刘','陈','杨','黄','赵','吴','周','徐','孙','马','胡','郭','林','何','高','罗','郑','梁','谢','宋','唐','许','韩','冯','邓','曹','彭'];
    const CITIES = ['北京','上海','深圳','广州','杭州','成都','南京','武汉','西安','苏州','重庆','长沙','青岛','厦门','合肥','天津','宁波','无锡','郑州','佛山'];
    const PRODUCTS = ['H100×8 算力礼包','A100×4 训练套餐','RTX4090 推理集群','大模型微调方案','AIGC 算力包','国产算力体验包','私有化部署咨询','100小时免费试用'];
    const ACTIONS = ['刚刚领取了','成功开通了','预约咨询了','已签约获得','申请试用了'];
    const COLORS = ['#7c3aed','#5b3df5','#e84393','#ff7a3d','#ff5d3d','#3da6ff','#13c2c2','#52c41a','#fa8c16','#eb2f96'];

    const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    const pick = a => a[Math.floor(Math.random() * a.length)];

    function maskedPhone() {
      const prefix = pick(['133','138','139','150','151','152','158','159','176','177','180','181','182','186','187','188','189','199']);
      const tail = String(rand(0, 9999)).padStart(4, '0');
      return `${prefix}****${tail}`;
    }
    function timeAgo() {
      const r = Math.random();
      if (r < 0.45) return `${rand(1, 59)}秒前`;
      if (r < 0.85) return `${rand(1, 30)}分钟前`;
      return `${rand(1, 5)}小时前`;
    }
    function buildRow() {
      const surname = pick(SURNAMES);
      const city = pick(CITIES);
      const action = pick(ACTIONS);
      const product = pick(PRODUCTS);
      const phone = maskedPhone();
      const color = pick(COLORS);
      const t = timeAgo();
      const li = document.createElement('li');
      li.className = 'ticker__item';
      li.innerHTML = `
        <span class="ticker__avatar" style="background:${color}">${surname}</span>
        <span class="ticker__phone">${phone}</span>
        <span class="ticker__action">(${city}) ${action}</span>
        <span class="ticker__product">${product}</span>
        <span class="ticker__time">${t}</span>
      `;
      return li;
    }

    // 生成基础数据，并复制一份用于无缝循环
    const BASE_COUNT = 12;
    const base = [];
    for (let i = 0; i < BASE_COUNT; i++) base.push(buildRow());
    base.forEach(li => list.appendChild(li));
    base.forEach(li => list.appendChild(li.cloneNode(true)));

    // 根据条目数动态调整滚动时长（约每条 2s）
    list.style.animationDuration = (BASE_COUNT * 2) + 's';

    // 每隔一段时间替换一条最早的条目，让内容看起来"实时"更新
    setInterval(() => {
      const fresh = buildRow();
      const firstSet = list.querySelectorAll('.ticker__item');
      if (firstSet.length < BASE_COUNT * 2) return;
      // 替换前半段第一条 + 后半段对应条，保持循环连贯
      list.replaceChild(fresh, firstSet[0]);
      list.replaceChild(fresh.cloneNode(true), firstSet[BASE_COUNT]);
    }, 5000);

    // 触摸时暂停，松开继续
    list.addEventListener('touchstart', () => list.classList.add('paused'), { passive: true });
    list.addEventListener('touchend', () => list.classList.remove('paused'));
    list.addEventListener('touchcancel', () => list.classList.remove('paused'));
  })();

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
