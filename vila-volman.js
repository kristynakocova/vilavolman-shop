/* Vila Volman – vlastní skripty e-shopu. Načítá se ze zápatí.
   Po změně nahrát znovu a v zápatí zvýšit ?v= */
(function () {
  /* ===== NASTAVENÍ ===== */
  var POPISY = { 'Elektronický': 'e-mailem hned po zaplacení', 'Tištěný': 'Zásilkovnou do 5 dnů' };
  var VYCHOZI = 'Elektronický';
  // 2–3 skutečné recenze z Googlu (krátce, max. ~150 znaků):
  var RECENZE = [
    // { text: 'Text recenze…', kdo: 'Jméno P.', kdy: 'září 2026' },
  ];
  var GOOGLE = { hodnoceni: '4,9', pocet: 'přes 370 hodnocení',
    odkaz: 'https://search.google.com/local/reviews?placeid=ChIJ4bhCxlLxC0cR25lr71DjZ_o' };

  /* ===== POMOCNÍCI ===== */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function txt(o) { return o.text.trim(); }

  /* ===== 1) Varianty poukazu jako dvě karty ===== */
  function varianty() {
    var data = (window.shoptet && shoptet.variantsSplit && shoptet.variantsSplit.necessaryVariantData) || {};
    document.querySelectorAll('select[name^="parameterValueId"]').forEach(function (sel) {
      var opts = [].filter.call(sel.options, function (o) { return o.value; });
      var nazvy = opts.map(txt);
      if (sel.dataset.vv || nazvy.indexOf('Elektronický') === -1 || nazvy.indexOf('Tištěný') === -1) return;
      sel.dataset.vv = 1;

      var id = (sel.name.match(/\[(\d+)\]/) || [])[1];
      var wrap = el('div', 'vv-forma');
      wrap.setAttribute('role', 'group');
      wrap.setAttribute('aria-label', 'Forma poukazu');

      function vyber(val) {
        sel.value = val;
        window.jQuery ? jQuery(sel).trigger('change') : sel.dispatchEvent(new Event('change', { bubbles: true }));
        wrap.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.value === val); });
      }

      opts.sort(function (a, b) { return (txt(b) === VYCHOZI) - (txt(a) === VYCHOZI); }).forEach(function (o) {
        var v = data[id + '-' + o.value] || {};
        var b = el('button', '', '<span class="vv-nazev">' + txt(o) + '</span>' +
          (v.price ? '<span class="vv-cena">' + v.price + '</span>' : '') +
          '<span class="vv-info">' + (POPISY[txt(o)] || '') + '</span>');
        b.type = 'button';
        b.dataset.value = o.value;
        b.onclick = function () { vyber(o.value); };
        wrap.appendChild(b);
      });

      var radek = sel.closest('tr') || sel.parentElement;
      var kam = radek.tagName === 'TR' ? radek.closest('table') : radek;
      kam.parentNode.insertBefore(wrap, kam);
      radek.classList.add('vv-skryt');
      vyber(sel.value || opts[0].value);
    });
  }

  /* ===== 2) Google hodnocení pod košíkem (všude), recenze ===== */
  function recenze() {
    var cil = document.querySelector('.p-detail .add-to-cart');
    if (!cil || document.querySelector('.vv-recenze')) return;
    var jePoukaz = [].some.call(document.querySelectorAll('.breadcrumbs a, #navigation-breadcrumbs a'),
      function (a) { return a.textContent.trim() === 'Dárkové poukazy'; });

    var html = '<a class="vv-google" href="' + GOOGLE.odkaz + '" target="_blank" rel="noopener">' +
      '<span class="vv-hvezdy" aria-hidden="true">★★★★★</span> <span class="vv-skore">Volmanova vila · ' + GOOGLE.hodnoceni + ' z 5</span> ' +
      '<span class="vv-pocet"><span class="vv-tecka">· </span>' + GOOGLE.pocet + ' na Googlu</span></a>';
    if (jePoukaz && RECENZE.length) html += '<ul>' + RECENZE.map(function (r) {
      return '<li><q>' + esc(r.text) + '</q><span class="vv-kdo">' + esc(r.kdo) + ' · ' + esc(r.kdy) + '</span></li>';
    }).join('') + '</ul>';
    cil.after(el('div', 'vv-recenze', html));
  }

  /* ===== 3) Úpravy textů (prázdný košík, newsletter) ===== */
  function texty() {
    var h = document.querySelector('.cart-empty .h1.cart-heading');
    if (h) h.textContent = 'Naplňte košík výjimečností!';

    var nl = document.querySelector('.custom-footer__newsletter');
    if (!nl) return;
    var nadpis = nl.querySelector('h3.pageElement__heading span');
    var popis = nl.querySelector('p');
    if (nadpis) nadpis.innerHTML = 'Odebírejte<br>novinky z vily';
    if (popis) popis.textContent = 'Vložte svůj e-mail a my vás budeme informovat o plánovaných koncertech, výstavách a nejčerstvějších novinkách ze zákulisí Volmanovy vily.';
    nl.querySelectorAll('button, input[type="submit"]').forEach(function (b) { b.textContent = b.value = 'PŘIHLÁSIT'; });
  }

  /* ===== MOCKUP 2026: horní pruh, nadpis tipů, recenze na úvodní stránce ===== */
  var REC_HP = [
    { text: 'Dechberoucí vila, dechberoucí průvodkyně. 👌 Doporučuji všem! Naprosto skvostný zážitek.', kdo: 'Věra P.' },
    { text: 'Rozhodně stojí za návštěvu, nás opravdu nadchla. Krásná stavba, výtečně doplněná komentovanou prohlídkou s mladým průvodcem, který byl rozhodně jeden z nejlepších průvodců, se kterými jsme se kdy setkali.', kdo: 'Otakar L.' },
    { text: 'Krásná vila, kdo se zajímá o architekturu, musí být nadšený. My jsme měli skvělou průvodkyni, její výklad byl poutavý a prohlídku jsme si opravdu užili. Při prohlídce máte volnost při prohlížení pokojů a po prohlídce se můžete vrátit ještě na místa, která vás zaujala.', kdo: 'Petra L.' },
    { text: 'Skvělý tip na výlet! Nádherná stavba obklopená anglickým parkem, uvnitř citlivě zrekonstruovaná a plná dechberoucích detailů.', kdo: 'Dita' },
    { text: 'Nádherná a citlivě zrekonstruovaná vila Volman potěší nejedno oko a hlavně duši. Velmi oceňuji, že kromě běžných prohlídek se zde konají i různé další zajímavé akce. Kdybych bydlel blíž, byl bych tu jistě pravidelným návštěvníkem. Velmi doporučuji k návštěvě, klidně i opakované. Já tu naposledy rozhodně nebyl.', kdo: 'Martin K.' }
  ];
  var VSTUPENKY = 'https://www.vilavolman.cz/vstupenky';

  function mockup() {
    var tb = document.querySelector('.top-navigation-bar .container');
    if (tb && !tb.querySelector('.vv-toplinks')) {
      tb.insertAdjacentHTML('beforeend', '<div class="vv-toplinks"><a href="' + VSTUPENKY + '">Vstupenky na prohlídky</a><span aria-hidden="true">·</span><a href="https://www.vilavolman.cz/">VilaVolman.cz</a></div>');
    }
    var nadpis = document.querySelector('.homepage-products-heading-6');
    if (nadpis) nadpis.textContent = 'Naše tipy na dárky';

    var ft = document.querySelector('#footer');
    if (!nadpis || !ft || document.querySelector('.vv-rec') || !REC_HP.length) return;
    var karty = REC_HP.map(function (r) {
      return '<figure><blockquote>' + esc(r.text) + '</blockquote><figcaption>— ' + esc(r.kdo) +
        '<span role="img" aria-label="5 z 5 hvězdiček">★★★★★</span></figcaption></figure>';
    }).join('');
    var sec = el('section', 'vv-rec',
      '<div class="vv-k">Recenze</div><h2 id="vv-rec-h">Návštěvníci o vile</h2>' +
      '<div class="vv-sc"><a href="' + GOOGLE.odkaz + '" target="_blank" rel="noopener"><span class="vv-st" aria-hidden="true">★★★★★</span>' +
      GOOGLE.hodnoceni + ' z 5 · ' + GOOGLE.pocet + ' na Googlu</a></div>' +
      '<div class="vv-grid" role="region" tabindex="0" aria-label="Recenze návštěvníků, posouvejte do strany">' + karty + '</div>' +
      '<div class="vv-nav"><button type="button" class="vv-prev" aria-label="Předchozí recenze">←</button><button type="button" class="vv-next" aria-label="Další recenze">→</button></div>');
    sec.setAttribute('aria-labelledby', 'vv-rec-h');
    ft.parentNode.insertBefore(sec, ft);
    var pas = sec.querySelector('.vv-grid');
    function posun(smer) { var k = pas.querySelector('figure'); pas.scrollBy({ left: smer * (k.offsetWidth + 24), behavior: 'smooth' }); }
    sec.querySelector('.vv-prev').onclick = function () { posun(-1); };
    sec.querySelector('.vv-next').onclick = function () { posun(1); };
  }

  function init() { varianty(); recenze(); texty(); mockup(); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
