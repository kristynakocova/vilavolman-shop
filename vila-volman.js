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

  function zalozky() {
    document.querySelectorAll('.shp-tab-link[href="#description"], .js-detail-tab-item[data-content="description"]').forEach(function (a) { a.textContent = 'Popis'; });
  }

  /* ===== MOCKUP 2026: horní pruh, nadpis tipů, recenze na úvodní stránce ===== */
  var REC_HP = [
    { text: 'Rozhodně stojí za návštěvu, nás opravdu nadchla. Krásná stavba, výtečně doplněná komentovanou prohlídkou s mladým průvodcem, který byl rozhodně jeden z nejlepších průvodců, se kterými jsme se kdy setkali.', kdo: 'Otakar L.' },
    { text: 'Dechberoucí vila, dechberoucí průvodkyně. 👌 Doporučuji všem! Naprosto skvostný zážitek.', kdo: 'Věra P.' },
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

  /* ===== USP pruh pod bannerem (úvodní stránka) ===== */
  var USP = [
    { ikona: '<path d="M14.5 21.7a.5.5 0 0 0 .9 0l6.5-19a.5.5 0 0 0-.6-.6l-19 6.5a.5.5 0 0 0 0 .9l7.9 3.2a2 2 0 0 1 1.1 1.1z"/><path d="m21.9 2.1-11 11"/>',
      nadpis: 'E-poukaz ihned e-mailem', text: 'Odesíláme hned po zaplacení' },
    { ikona: '<rect x="3" y="8" width="18" height="4"/><path d="M12 8v13"/><path d="M19 12v9H5v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
      nadpis: 'Tištěný poukaz v dárkové obálce', text: 'Připravený k předání pod stromečkem' },
    { ikona: '<rect x="3" y="4" width="18" height="18"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
      nadpis: 'Platnost do 31. 12. 2027', text: 'Termín návštěvy si obdarovaný vybere sám' }
  ];
  function usp() {
    var nadpis = document.querySelector('.homepage-products-heading-6');
    if (!nadpis || document.querySelector('.vv-usp')) return;
    var html = USP.map(function (u) {
      return '<div class="vv-usp-item"><svg viewBox="0 0 24 24" aria-hidden="true">' + u.ikona + '</svg><div><strong>' + esc(u.nadpis) + '</strong><span>' + esc(u.text) + '</span></div></div>';
    }).join('');
    nadpis.parentNode.insertBefore(el('div', 'vv-usp', html), nadpis);
  }

  /* ===== Promo blok Kolaudace: text vlevo, video vpravo (úvodní stránka) ===== */
  var PROMO = {
    video: 'https://cdn.jsdelivr.net/gh/kristynakocova/vilavolman-shop@ef963ffd71346a496db7407273ff0c3696d6929b/kolaudace.mp4',
    poster: 'https://cdn.jsdelivr.net/gh/kristynakocova/vilavolman-shop@ef963ffd71346a496db7407273ff0c3696d6929b/kolaudace-poster.jpg',
    nadtitulek: 'Divadlo ve Volmanově vile',
    titulek: 'Kolaudace',
    datum: 'Od června 2027',
    text: 'Nová divadelní inscenace uváděná přímo ve vile. Termíny, obsazení a vstupenky najdete na webu představení.',
    tlacitko: 'Více o představení',
    odkaz: 'https://www.nakolaudaci.cz'
  };
  function promo() {
    var tipy = document.querySelector('.homepage-products-6');
    if (!tipy || document.querySelector('.vv-promo')) return;
    var klid = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sec = el('section', 'vv-promo',
      '<div class="vv-promo__text"><p class="vv-promo__kicker">' + esc(PROMO.nadtitulek) + '</p>' +
      '<h2 class="vv-promo__title">' + esc(PROMO.titulek) + '</h2>' +
      '<p class="vv-promo__date">' + esc(PROMO.datum) + '</p>' +
      '<p class="vv-promo__desc">' + esc(PROMO.text) + '</p>' +
      '<a class="vv-promo__btn" href="' + PROMO.odkaz + '" target="_blank" rel="noopener">' + esc(PROMO.tlacitko) + '</a></div>' +
      '<div class="vv-promo__media"><video muted loop playsinline preload="metadata"' + (klid ? '' : ' autoplay') +
      ' poster="' + PROMO.poster + '" aria-label="Upoutávka na představení Kolaudace"><source src="' + PROMO.video + '" type="video/mp4"></video></div>');
    sec.setAttribute('aria-label', PROMO.titulek);
    tipy.parentNode.insertBefore(sec, tipy.nextSibling);
  }

  /* ===== Patička ve stylu webu vily ===== */
  var PATICKA = {
    menu: [
      ['Návštěva vily', 'https://www.vilavolman.cz/prohlidky'],
      ['Vstupenky', 'https://www.vilavolman.cz/vstupenky'],
      ['Dárkové poukazy', '/darkove-poukazy/'],
      ['Kontakty', 'https://www.vilavolman.cz/kontakt']
    ],
    nakup: [
      ['Návštěvní řád', 'https://www.vilavolman.cz/volmanova-vila-navstevni-rad'],
      ['Zásady ochrany osobních údajů', 'https://www.vilavolman.cz/cookie'],
      ['Podmínky čerpání dárkových poukazů', 'https://www.vilavolman.cz/podminky-cerpani-darkovych-poukazu']
    ]
  };
  var IKONY = {
    facebook: '<path d="M13.5 22v-8.2h2.8l.4-3.2h-3.2V8.5c0-.9.3-1.6 1.6-1.6h1.7V4.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.2h2.8V22h3.4z"/>',
    linkedin: '<path d="M6.9 8.9H3.6V20h3.3V8.9zM5.3 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8zM20.4 13.6c0-3-1.6-4.9-4.1-4.9-1.5 0-2.4.8-2.8 1.4V8.9h-3.2V20h3.3v-5.5c0-1.4.3-2.8 2-2.8s1.7 1.6 1.7 2.9V20h3.3l-.2-6.4z"/>',
    instagram: '<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.8a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zm4.9-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 3.6c2.3 0 2.5 0 3.4.1 2.3.1 3.4 1.2 3.5 3.5v6.8c-.1 2.3-1.2 3.4-3.5 3.5H8.6c-2.3-.1-3.4-1.2-3.5-3.5V7.2c.1-2.3 1.2-3.4 3.5-3.5H12zM12 2c-2.3 0-2.6 0-3.5.1C5.4 2.2 3.2 4.4 3.1 7.5 3 8.4 3 8.7 3 12s0 3.6.1 4.5c.1 3.1 2.3 5.3 5.4 5.4.9.1 1.2.1 3.5.1s2.6 0 3.5-.1c3.1-.1 5.3-2.3 5.4-5.4.1-.9.1-1.2.1-4.5s0-3.6-.1-4.5c-.1-3.1-2.3-5.3-5.4-5.4C14.6 2 14.3 2 12 2z"/>'
  };
  function paticka() {
    var ft = document.querySelector('#footer');
    var dole = ft && ft.querySelector('.footer-bottom');
    if (!dole || document.querySelector('.vv-foot')) return;
    var logo = document.querySelector('#header .site-name img');
    var soc = [['facebook', 'https://www.facebook.com/vila.volman', 'Facebook'],
               ['linkedin', 'https://www.linkedin.com/company/vila-volman/', 'LinkedIn'],
               ['instagram', 'https://www.instagram.com/vila_volman/', 'Instagram']];
    var html = '<div class="vv-foot__in">' +
      (logo ? '<a class="vv-foot__logo" href="/"><img src="' + logo.src + '" alt="Vila Volman"></a>' : '') +
      '<div class="vv-foot__social">' + soc.map(function (s) {
        return '<a href="' + s[1] + '" target="_blank" rel="noopener" aria-label="' + s[2] + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + IKONY[s[0]] + '</svg></a>';
      }).join('') + '</div>' +
      '<nav class="vv-foot__nav" aria-label="Vila Volman">' + PATICKA.menu.map(function (m) {
        return '<a href="' + m[1] + '">' + esc(m[0]) + '</a>';
      }).join('<span aria-hidden="true">|</span>') + '</nav>' +
      '<div class="vv-foot__cols"><div><h3>Kontakt</h3>' +
      '<p><a href="mailto:info@vilavolman.cz">info@vilavolman.cz</a><br><a href="tel:+420737870927">+420 737 870 927</a></p>' +
      '<p>Vila Volman<br>Stankovského 1200/46, Čelákovice</p></div>' +
      '<div><h3>Informace</h3><ul>' + PATICKA.nakup.map(function (m) {
        return '<li><a href="' + m[1] + '">' + esc(m[0]) + '</a></li>';
      }).join('') + '</ul></div></div></div>';
    dole.parentNode.insertBefore(el('div', 'vv-foot', html), dole);
  }

  function init() { varianty(); recenze(); texty(); zalozky(); mockup(); usp(); promo(); paticka(); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
