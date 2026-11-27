// Interactive Game — ek oyunlar: Oyuncak Yarış, Gazlı Motor, Boks Ringi, Dans Pisti, Kır Geç.
// Hepsi index.html'deki ortak motoru (O) kullanır: aynı çizici, aynı oyuncak karakterler, aynı hareket algılama.
// Her oyun: kur (bir kez), ac (sıfırla+göster), kapat, guncelle(dt), bekle(dt), poz(P, dt), onizle (ana ekran resmi).
import yarisIkili from "./ikili.js";
export default function oyunlariKur(O) {
  const { Z, THREE, sahne, R, CANLI, PI, p, birlestir, kure, sil, koni, simit, yKutu, kupEkle, mPlastik, rast, sinirla, yaklas, D } = O;
  const ag = (parcalar, golge = true) => { const a = new THREE.Mesh(birlestir(parcalar), mPlastik); a.castShadow = golge; a.receiveShadow = true; return a; };
  const us = (dt, k) => 1 - Math.exp(-dt * k);
  const olu = (v, e) => Math.abs(v) < e ? 0 : (v - Math.sign(v) * e) / (1 - e);
  const kalp = n => "❤️".repeat(Math.max(0, n));
  const sar = a => a > PI ? a - 2 * PI : a < -PI ? a + 2 * PI : a;
  // Ortak elmas listesinde gezer: kosul 1 dönerse toplanır, 2 dönerse silinir
  function elmasTopla(kosul) {
    const l = O.elmasListe(); let n = 0;
    for (let i = l.length - 1; i >= 0; i--) {
      const s = kosul(l[i]);
      if (s) { if (s === 1) { n++; O.parAt(l[i].x, l[i].y, l[i].z, 5, 0x9defff, 3.2, 0.09); } l[i] = l[l.length - 1]; l.pop(); }
    }
    if (n) O.cal("elmas", 0.6);
    return n;
  }
  // Karakterin ellerine takılan boks eldiveni (boks rakibi ve kırma oyunu kullanır)
  const kucukEldiven = birlestir([p(kure(12), R.kirmizi, 0, 0, 0, 0, 0, 0, 0.15, 0.17, 0.15), p(sil(10), R.beyaz, 0, 0.16, 0, 0, 0, 0, 0.1, 0.1, 0.1)]);
  function eldivenTak(k, olcek = 1) {
    if (!k.eldiven) k.eldiven = [k.solDirsek, k.sagDirsek].map(d => { const m = new THREE.Mesh(kucukEldiven, mPlastik); m.castShadow = true; m.position.y = -0.27; d.add(m); return m; });
    k.eldiven.forEach(m => { m.visible = true; m.scale.setScalar(olcek); });
  }
  const buyukEldiven = renk => birlestir([p(kure(14), renk, 0, 0, 0, 0, 0, 0, 0.3, 0.34, 0.3), p(kure(10), renk, 0.24, -0.02, -0.08, 0, 0, 0, 0.13, 0.17, 0.13), p(sil(14), R.beyaz, 0, -0.36, 0, 0, 0, 0, 0.21, 0.2, 0.21)]);
  const bombaGeo = () => birlestir([p(kure(16), 0x2a2233, 0, 0, 0, 0, 0, 0, 0.5), p(sil(10), 0x555a66, 0, 0.5, 0, 0, 0, 0, 0.13, 0.14, 0.13),
    p(sil(6), 0xc9a36a, 0.06, 0.68, 0, 0, 0, -0.4, 0.03, 0.26, 0.03), p(kure(8), 0xff7b1c, 0.13, 0.82, 0, 0, 0, 0, 0.09), p(kure(8), 0xffffff, -0.18, 0.2, 0.4, 0, 0, 0, 0.1, 0.14, 0.05)]);

  // Yolda toplanan can kalbi (araba oyunu): iki top + aşağı bakan koni
  const kalpGeo = () => birlestir([p(kure(14), R.kirmizi, -0.23, 0.2, 0, 0, 0, 0, 0.36), p(kure(14), R.kirmizi, 0.23, 0.2, 0, 0, 0, 0, 0.36), p(koni(14), R.kirmizi, 0, -0.18, 0, 0, 0, PI, 0.55, 0.78, 0.36), p(kure(8), R.beyaz, -0.3, 0.32, 0.26, 0, 0, 0, 0.07)]);
  const KALP_ARALIK = 500, KALP_MAKS = 5;

  // ===================================================================================================
  //  OYUNCAK YARIŞ ve GAZLI MOTOR — karşıya giden yol; direksiyon yumuşak (şerit atlamalı değil)
  // ===================================================================================================
  function arabaGeo(renk, ustu) {
    const l = [p(yKutu(1.7, 0.44, 3.3, 0.16), renk, 0, 0.52, 0), p(yKutu(1.74, 0.13, 0.2, 0.05), R.gri, 0, 0.36, -1.66), p(yKutu(1.74, 0.13, 0.2, 0.05), R.gri, 0, 0.36, 1.66)];
    for (const s of [-1, 1]) {
      l.push(p(kure(10), 0xfff6c8, s * 0.55, 0.58, -1.64, 0, 0, 0, 0.17, 0.13, 0.06), p(kure(10), 0xff2a3a, s * 0.6, 0.6, 1.65, 0, 0, 0, 0.16, 0.1, 0.05));
      for (const z of [-1.05, 1.05]) l.push(p(sil(16), R.siyah, s * 0.86, 0.34, z, 0, 0, PI / 2, 0.34, 0.3, 0.34), p(sil(12), R.beyaz, s * 1.0, 0.34, z, 0, 0, PI / 2, 0.17, 0.06, 0.17));
    }
    if (ustu) l.push(p(yKutu(1.5, 0.5, 1.6, 0.2), renk, 0, 0.96, 0.15), p(yKutu(1.53, 0.28, 1.0, 0.08), 0x9fdcff, 0, 1.0, 0.15), p(yKutu(1.25, 0.28, 1.63, 0.08), 0x9fdcff, 0, 1.0, 0.15));
    else l.push(p(yKutu(1.45, 0.42, 0.06, 0.02), 0x9fdcff, 0, 0.93, -0.55, -0.35, 0, 0), p(yKutu(1.35, 0.5, 0.2, 0.08), R.siyah, 0, 0.88, 0.8),
      p(yKutu(1.66, 0.06, 0.42, 0.03), renk, 0, 1.0, 1.5), p(yKutu(0.08, 0.26, 0.08, 0.02), renk, -0.6, 0.86, 1.5), p(yKutu(0.08, 0.26, 0.08, 0.02), renk, 0.6, 0.86, 1.5),
      p(simit(0.2, 0.035), R.siyah, 0, 0.9, -0.28, -0.5, 0, 0), p(yKutu(0.5, 0.05, 2.6, 0.02), R.beyaz, 0, 0.745, -0.2));
    return birlestir(l);
  }
  function motorGeo(renk) {
    const teker = z => [p(simit(0.42, 0.14, PI * 2, 20), R.siyah, 0, 0.56, z, 0, PI / 2, 0), p(sil(12), R.gri, 0, 0.56, z, 0, 0, PI / 2, 0.26, 0.1, 0.26)];
    return birlestir([...teker(-1.05), ...teker(1.0), p(yKutu(0.34, 0.4, 1.5, 0.12), renk, 0, 0.8, 0), p(kure(12), renk, 0, 1.08, -0.3, 0, 0, 0, 0.26, 0.2, 0.42),
      p(yKutu(0.32, 0.12, 0.8, 0.05), R.siyah, 0, 1.06, 0.5), p(yKutu(0.1, 0.8, 0.1, 0.03), R.gri, 0, 0.95, -0.95, 0.45, 0, 0),
      p(sil(8), R.gri, 0, 1.36, -0.72, 0, 0, PI / 2, 0.035, 1.0, 0.035), p(kure(8), R.siyah, -0.5, 1.36, -0.72, 0, 0, 0, 0.07), p(kure(8), R.siyah, 0.5, 1.36, -0.72, 0, 0, 0, 0.07),
      p(kure(10), 0xfff6c8, 0, 1.16, -1.0, 0, 0, 0, 0.15, 0.15, 0.08), p(kure(8), 0xff2a3a, 0, 0.98, 1.02, 0, 0, 0, 0.1, 0.07, 0.05),
      p(sil(10), R.gri, 0.24, 0.5, 0.55, PI / 2, 0, 0, 0.07, 1.0, 0.07), p(yKutu(0.36, 0.06, 0.5, 0.02), renk, 0, 1.02, 1.05, 0.2, 0, 0)]);
  }
  const oyuncakKamyonGeo = () => birlestir([p(yKutu(1.5, 1.1, 1.3, 0.12), R.turuncu, 0, 0.95, -0.8), p(yKutu(1.35, 0.5, 0.9, 0.08), 0x9fdcff, 0, 1.15, -1.1),
    p(yKutu(1.6, 1.3, 2.0, 0.12), R.sari, 0, 1.05, 0.9), p(yKutu(1.62, 0.12, 2.02, 0.04), R.kirmizi, 0, 1.6, 0.9),
    ...[-1, 1].flatMap(sx => [-0.85, 1.25].map(z => p(sil(16), R.siyah, sx * 0.72, 0.34, z, 0, 0, PI / 2, 0.34, 0.26, 0.34)))]);
  const trafikKoniGeo = () => birlestir([p(yKutu(0.8, 0.08, 0.8, 0.03), R.turuncu, 0, 0.04, 0), p(koni(14), R.turuncu, 0, 0.62, 0, 0, 0, 0, 0.3, 1.1, 0.3), p(sil(14), R.beyaz, 0, 0.55, 0, 0, 0, 0, 0.19, 0.16, 0.19)]);

  // Yarış ve motorun ortak dış mekânı: çizgili çim zemin + yol kenarı süsleri (ağaç, ev, lamba, lastik, tabela)
  let yolOrtak = null;
  function yolOrtakKur() {
    if (yolOrtak) return;
    const cim = O.dokuYap(256, 256, (c, w, h) => {
      c.fillStyle = "#7fd162"; c.fillRect(0, 0, w, h); c.fillStyle = "#73c657"; c.fillRect(0, 0, w, h / 2);      // biçilmiş çim şeritleri (hız hissi)
      for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${Math.random() > 0.5 ? "190,240,150" : "40,120,50"},${0.1 + Math.random() * 0.18})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 3 + Math.random() * 4); }
    }, O.ZEMIN_EN / 16, O.ZEMIN_BOY / 16);
    const govde = (h, r = 0.26) => p(sil(10), R.koyuAhsap, 0, h / 2, 0, 0, 0, 0, r, h, r);
    const cam = birlestir([govde(1.2), p(koni(12), 0x3fae5a, 0, 2.0, 0, 0, 0, 0, 1.6, 2.2, 1.6), p(koni(12), 0x4cc06a, 0, 3.2, 0, 0, 0, 0, 1.25, 2.0, 1.25), p(koni(12), 0x5fd07c, 0, 4.3, 0, 0, 0, 0, 0.85, 1.7, 0.85)]);
    const agac = birlestir([govde(2.0, 0.3), p(kure(14), 0x57c66b, 0, 3.1, 0, 0, 0, 0, 1.5), p(kure(12), 0x6ad57c, 0.9, 2.6, 0.3, 0, 0, 0, 1.05), p(kure(12), 0x48b860, -0.9, 2.7, -0.2, 0, 0, 0, 1.1), p(kure(8), R.kirmizi, 0.5, 3.4, 1.2, 0, 0, 0, 0.16), p(kure(8), R.kirmizi, -0.6, 2.7, 1.1, 0, 0, 0, 0.16)]);
    const lamba = birlestir([p(sil(10), R.gri, 0, 2.6, 0, 0, 0, 0, 0.1, 5.2, 0.1), p(sil(10), R.gri, 0, 0.12, 0, 0, 0, 0, 0.32, 0.24, 0.32), p(yKutu(1.2, 0.1, 0.1, 0.03), R.gri, 0.55, 5.15, 0), p(kure(12), 0xfff0a8, 1.1, 4.95, 0, 0, 0, 0, 0.32)]);
    const lastik = birlestir([0, 1, 2].map(i => p(simit(0.62, 0.3, PI * 2, 20), [R.siyah, R.beyaz, R.kirmizi][i], 0, 0.3 + i * 0.58, 0, PI / 2, 0, 0)));
    const ev = birlestir([p(yKutu(3.0, 2.2, 2.6, 0.12), [0xfff0d2, 0xffd6e4, 0xd6ecff][rast(3)], 0, 1.1, 0), p(koni(4), R.kirmizi, 0, 3.1, 0, 0, PI / 4, 0, 2.6, 1.8, 2.3),
      p(yKutu(0.7, 1.2, 0.08, 0.03), R.koyuAhsap, 0, 0.6, 1.31), p(yKutu(0.7, 0.7, 0.08, 0.03), 0x9fdcff, -0.95, 1.35, 1.31), p(yKutu(0.7, 0.7, 0.08, 0.03), 0x9fdcff, 0.95, 1.35, 1.31), p(yKutu(0.4, 1.0, 0.4, 0.05), R.gri, 0.9, 3.3, -0.4)]);
    const tabela = birlestir([p(sil(8), R.gri, -0.9, 0.9, 0, 0, 0, 0, 0.07, 1.8, 0.07), p(sil(8), R.gri, 0.9, 0.9, 0, 0, 0, 0, 0.07, 1.8, 0.07), p(yKutu(2.4, 0.9, 0.1, 0.04), R.beyaz, 0, 1.6, 0),
      ...[-0.75, 0, 0.75].map(q => p(koni(3), R.kirmizi, q, 1.6, 0.07, 0, 0, -PI / 2, 0.3, 0.5, 0.03))]);
    const bayrak = birlestir([p(sil(8), R.beyaz, 0, 2.4, 0, 0, 0, 0, 0.07, 4.8, 0.07), p(kure(8), R.sari, 0, 4.85, 0, 0, 0, 0, 0.14), p(yKutu(1.5, 0.9, 0.05, 0.02), CANLI[rast(8)], 0.8, 4.2, 0)]);
    yolOrtak = { cim, sus: [cam, cam, agac, agac, lamba, lastik, ev, tabela, bayrak] };
  }

  function yolOyunu(tur) {
    const araba = tur === "araba";
    const SERIT = araba ? [-3.6, -1.2, 1.2, 3.6] : [-2.6, 0, 2.6], YARI = araba ? 4.8 : 3.9, H0 = araba ? 15 : 19, H1 = araba ? 32 : 38;
    const TRAFIK = 5;       // trafiğin kendi hızı: hepsi aynı, böylece arkadan gelen dalga öndekine yetişip üç şeridi kapatamaz
    let grup, aracG, yolDoku, geo, trafik = [], x, direksiyon, hedefDir, hiz, sure, mesafe, can, dokunulmaz, sonraki, elmasSay;
    let kalpAg, kalpVar = false, kalpX = 0, kalpZ = 0, sonrakiKalp = KALP_ARALIK;   // sadece araba: her 500 puanda yolda bir kalp
    const havuz = {};
    const al = ad => { const h = havuz[ad] || (havuz[ad] = []); let m = h.pop(); if (!m) { m = new THREE.Mesh(geo[ad], mPlastik); m.castShadow = m.receiveShadow = true; grup.add(m); } m.visible = true; return m; };
    const birak = t => { t.ag.visible = false; havuz[t.ad].push(t.ag); };
    function ekle(ad, sx, z, h) {
      const m = al(ad), kn = ad === "koni"; m.position.set(sx, 0, z);
      trafik.push({ ag: m, ad, x: sx, z, hiz: h, bx: kn ? 1.15 : araba ? 1.55 : 1.1, bz: kn ? 2.2 : araba ? 2.6 : 2.3 });
    }
    function dalga(z) {
      // Her dalgada en az bir şerit (bos) hep açık; kolayda tek araç gelir
      const bos = rast(SERIT.length), n = Z().kolay ? 1 : 1 + (Math.random() < (Z().zor ? 0.55 : 0.45) ? 1 : 0), dolu = new Set();
      while (dolu.size < n) { const s = rast(SERIT.length); if (s !== bos) dolu.add(s); }
      for (const s of dolu) ekle(!araba && Math.random() < 0.4 ? "koni" : "oto" + rast(4), SERIT[s], z, TRAFIK);
      for (let k = 0; k < 5; k++) O.elmasEkle(SERIT[bos], 0.9, z + 10 - k * 2.4);
    }
    const skor = () => Math.floor(mesafe / 2) + elmasSay * 10;
    // Her 500 puanda yola bir kalp çıkar (önceki alınmadıysa o tur atlanır); alınca +1 can, en fazla KALP_MAKS
    function kalpGuncelle(dt, adim) {
      while (skor() >= sonrakiKalp) {
        if (!kalpVar) {
          const bos = SERIT.filter(sx => !trafik.some(t => t.x === sx && Math.abs(t.z + 70) < 12)), kaynak = bos.length ? bos : SERIT;
          kalpX = kaynak[rast(kaynak.length)]; kalpZ = -70; kalpVar = true; kalpAg.visible = true;
        }
        sonrakiKalp += KALP_ARALIK;
      }
      if (!kalpVar) return;
      kalpZ += adim - TRAFIK * dt;
      kalpAg.position.set(kalpX, 1.15 + Math.sin(O.zaman() * 4) * 0.12, kalpZ); kalpAg.rotation.y += dt * 2.6;
      if (Math.abs(kalpZ) < 1.7 && Math.abs(kalpX - x) < 1.5) {
        kalpVar = false; kalpAg.visible = false;
        if (can < KALP_MAKS) { can++; O.sagYaz(kalp(can)); }
        O.cal("elmas", 1.3, 1.5); O.parAt(kalpX, 1.1, kalpZ, 12, 0xff4756, 4, 0.12);
      } else if (kalpZ > 12) { kalpVar = false; kalpAg.visible = false; }
    }
    function yerlestir() {
      const k = O.karakter(), t = O.zaman();
      aracG.position.set(x, Math.sin(t * 30) * 0.012, 0);
      aracG.rotation.set(0, -direksiyon * 0.2, araba ? -direksiyon * 0.04 : -direksiyon * 0.5);
      aracG.visible = dokunulmaz <= 0 || Math.floor(t * 12) % 2 === 0;
      O.durusSifir(D);
      if (araba) { D.lUst = D.rUst = 1.45; D.lAlt = D.rAlt = -1.3; D.lKolX = 1.15 - direksiyon * 0.4; D.rKolX = 1.15 + direksiyon * 0.4; D.lDirX = D.rDirX = 0.35; D.lKolZ = 0.12; D.rKolZ = -0.12; D.basY = -direksiyon * 0.25; }
      else { D.govdeX = -0.5; D.basX = 0.4; D.lUst = D.rUst = 1.0; D.lAlt = D.rAlt = -1.55; D.lKolX = D.rKolX = 1.2; D.lDirX = D.rDirX = 0.2; D.lKolZ = -0.2; D.rKolZ = 0.2; k.solKalca.rotation.z = -0.38; k.sagKalca.rotation.z = 0.38; }
      O.hPoz.set(x * 0.7, araba ? 3.3 : 3.0, araba ? 7.4 : 6.6); O.hBak.set(x * 0.7, 1.0, -8);
    }
    return {
      id: tur, ad: araba ? "Oyuncak Yarış" : "Gazlı Motor", elSerbest: true, elGerek: true,
      ipucu: araba ? "Yumruklarını direksiyon gibi tut ve çevir" : "Gidonu tut, vücudunu sağa-sola yatır",
      kur() {
        yolOrtakKur();
        grup = new THREE.Group(); sahne.add(grup);
        yolDoku = O.dokuYap(256, 256, (c, w, h) => {
          c.fillStyle = "#4f5873"; c.fillRect(0, 0, w, h);
          for (let i = 0; i < 2200; i++) { c.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "20,20,50"},${0.03 + Math.random() * 0.05})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
          c.fillStyle = "#ffd23f"; c.fillRect(6, 0, 6, h); c.fillRect(w - 12, 0, 6, h);
          c.fillStyle = "#f6f6f6"; for (let i = 1; i < SERIT.length; i++) c.fillRect(i / SERIT.length * w - 3, 0, 6, h * 0.5);
        }, 1, O.ZEMIN_BOY / 8);
        const yol = new THREE.Mesh(new THREE.PlaneGeometry(YARI * 2, O.ZEMIN_BOY), new THREE.MeshStandardMaterial({ map: yolDoku, roughness: 0.95, metalness: 0, envMapIntensity: 0.3 }));
        yol.rotation.x = -PI / 2; yol.position.set(0, 0.012, O.zeminZ); yol.receiveShadow = true; grup.add(yol);
        grup.add(ag([p(yKutu(0.24, 0.16, O.ZEMIN_BOY, 0.05), R.beyaz, -YARI - 0.1, 0.08, O.zeminZ), p(yKutu(0.24, 0.16, O.ZEMIN_BOY, 0.05), R.beyaz, YARI + 0.1, 0.08, O.zeminZ)], false));
        geo = { oto0: arabaGeo(R.mavi, true), oto1: arabaGeo(R.yesil, true), oto2: arabaGeo(R.sari, true), oto3: arabaGeo(R.mor, true), koni: oyuncakKamyonGeo() };      // motor: koni yerine yavaş oyuncak kamyon
        aracG = new THREE.Group(); grup.add(aracG);
        const govde = new THREE.Mesh(araba ? arabaGeo(R.kirmizi, false) : motorGeo(R.kirmizi), mPlastik); govde.castShadow = true; aracG.add(govde);
        if (araba) { kalpAg = new THREE.Mesh(kalpGeo(), mPlastik); kalpAg.castShadow = true; kalpAg.visible = false; grup.add(kalpAg); }
      },
      ac() {
        grup.visible = true; O.susGoster(true, yolOrtak.sus); O.zeminHarita(yolOrtak.cim, 0.95);
        for (const t of trafik) birak(t); trafik = []; O.elmasListe().length = 0;
        x = 0; direksiyon = hedefDir = 0; hiz = H0 * Z().hiz; sure = 0; mesafe = 0; can = 3; dokunulmaz = 0; elmasSay = 0; sonraki = 0;
        kalpVar = false; sonrakiKalp = KALP_ARALIK; if (kalpAg) kalpAg.visible = false;
        O.karakterTak(O.karakter(), aracG, 0, araba ? -0.05 : 0.4, araba ? 0.25 : 0.3, araba ? 0.8 : 0.85);
        dalga(-50); dalga(-78);
        O.solYaz("0"); O.sagYaz(kalp(3)); O.fov(60); yerlestir();
      },
      kapat() { grup.visible = false; if (kalpAg) kalpAg.visible = false; O.susGoster(false); O.zeminHarita(null); for (const t of trafik) birak(t); trafik = []; O.elmasListe().length = 0; },
      bekle() { dokunulmaz = 0; yerlestir(); },
      guncelle(dt) {
        const zr = Z(); sure += dt; const zor = Math.min(1, sure * zr.rampa / 480); hiz = (H0 + (H1 - H0) * zor) * zr.hiz;
        const adim = hiz * dt; mesafe += adim;
        if (!O.kameraKontrol()) { hedefDir = (O.tus.ArrowRight ? 1 : 0) - (O.tus.ArrowLeft ? 1 : 0); if (O.isaretci.basili) hedefDir = sinirla((O.isaretci.x - 0.5) * 3, -1, 1); }
        direksiyon += (hedefDir - direksiyon) * us(dt, araba ? 9 : 6);
        x = sinirla(x + direksiyon * (araba ? 7.5 : 8.5) * dt, -YARI + 0.9, YARI - 0.9);
        if (dokunulmaz > 0) dokunulmaz -= dt;
        if (mesafe >= sonraki) { dalga(-94); sonraki = mesafe + hiz * (2.1 - zor * 0.9) / zr.yogun; }
        for (let i = trafik.length - 1; i >= 0; i--) {
          const t = trafik[i]; t.z += (hiz - t.hiz) * dt; t.ag.position.z = t.z;
          let sil_ = t.z > 14;
          if (dokunulmaz <= 0 && Math.abs(t.z) < t.bz && Math.abs(t.x - x) < t.bx) {
            can--; dokunulmaz = 1.6; sil_ = true; O.cal("carp"); O.cal("vur", 0.7); O.sarsinti(0.4); O.flas(); O.parAt(x, 0.9, -1, 14, 0xffe066, 5, 0.13); O.sagYaz(kalp(can));
            if (can <= 0) { O.cal("kaybet"); O.bitir(skor(), { baslik: "Kaza!", satir: "💎 " + elmasSay }); return 0; }
          }
          if (sil_) { birak(t); trafik[i] = trafik[trafik.length - 1]; trafik.pop(); }
        }
        elmasSay += elmasTopla(e => { e.z += adim - TRAFIK * dt; return Math.abs(e.z) < 1.4 && Math.abs(e.x - x) < 1.2 ? 1 : e.z > 10 ? 2 : 0; });
        if (araba) kalpGuncelle(dt, adim);
        yolDoku.offset.y = (yolDoku.offset.y + adim / 8) % 1; yolOrtak.cim.offset.y = (yolOrtak.cim.offset.y + adim / 16) % 1;
        yerlestir(); O.fov(60 + zor * 8); O.solYaz(String(skor()));
        return adim;
      },
      poz(P) {
        const elVar = P.sol.g > 0.4 && P.sag.g > 0.4, has = O.has();
        const direk = elVar ? Math.atan2(P.sag.y - P.sol.y, (P.sag.x - P.sol.x) * P.oran) : 0;   // iki yumruğun çizgisi = direksiyon açısı
        const egri = (v, olum, us_) => { const d = sinirla(olu(v * has, olum), -1, 1); return Math.sign(d) * Math.pow(Math.abs(d), us_); };   // ortada ince, uçta tam
        if (araba) { if (elVar) hedefDir = egri(direk / 0.6, 0.08, 1.25); return; }
        // Motor: omuz eğimi (yatış) ağırlıklı; küçük oynamalar sayılmaz (geniş ölü bölge, yumuşak eğri)
        const egim = Math.atan2(P.sag.sy - P.sol.sy, (P.sag.sx - P.sol.sx) * P.oran), kayma = (P.ox - P.tx) / P.tgen;
        hedefDir = egri(direk / 1.5 + egim / 0.55 + kayma * 0.25, 0.15, 1.5);
      },
      onizle() { this.ac(); dalga(-17); x = SERIT[1]; direksiyon = 0.35; yerlestir(); for (const t of trafik) t.ag.position.z = t.z; }
    };
  }

  // ===================================================================================================
  //  BOKS RINGI — yumruk at (kafa / karın), yüzünü kapatınca kalkan; rakipler giderek güçlenir
  // ===================================================================================================
  function boks() {
    let grup, eller, rakip, olcek = 1.2, r, can, skor, kalkan = false, oncekiKalkan = false;
    const Dr = O.yeniDurus();
    const yeniEl = x => ({ hazir: true, t: 0, bolge: "kafa", tur: "krose", x, y: 1.5, var: false, px: 0, py: 0, vx: 0, vy: 0, ustT: -9 });
    const el = [yeniEl(-0.6), yeniEl(0.6)];
    let ustSira = 0;
    const ara = () => Math.max(1.3, 3.3 - r.seviye * 0.3) * (0.7 + Math.random() * 0.6) / Z().yogun;
    const kafaY = () => 1.72 * olcek, karinY = () => 1.05 * olcek;
    function yeniRakip(seviye) {
      r = { seviye, can: 5 * seviye, maks: 5 * seviye, durum: "gir", t: 0, koruma: "ust", korumaT: 1.5, saldiriT: 0, sersem: 0, sersemBolge: "kafa", el: 0, vurdu: false };
      r.saldiriT = ara() + 0.5; olcek = Math.min(1.7, 1.2 + 0.08 * (seviye - 1));
      O.karakterTak(rakip, grup, 0, 0.14, -5, olcek, PI); eldivenTak(rakip);
      if (seviye > 1) O.durumYaz(O.t("Seviye") + " " + seviye + " — " + r.maks + " " + O.t("vuruş gerek"));
    }
    function yumruk(i, bolge, tur) {
      if (!r || r.durum === "ko" || r.durum === "gir" || el[i].t > 0) return;
      el[i].t = 0.3; el[i].bolge = bolge; el[i].tur = tur || "krose";
      const acik = r.durum !== "bekle" || (r.koruma === "ust") !== (bolge === "kafa"), y = bolge === "kafa" ? kafaY() : karinY();
      if (!acik) { O.cal("blok", 0.6); O.parAt(0, y, 0.6, 5, 0xcfd6e6, 2.5, 0.09); return; }
      r.can--; skor += 10; r.sersem = 0.3; r.sersemBolge = bolge;
      if (r.durum === "hazirlan") { r.durum = "bekle"; r.t = 0; r.saldiriT = ara() * 0.6; }     // yumruk rakibin saldırısını böler
      O.cal("vur", 0.9, bolge === "kafa" ? 1.15 : 0.9); O.parAt(0, y, 0.5, 9, 0xffe066, 4, 0.12);
      if (r.can <= 0) { r.durum = "ko"; r.t = 0; skor += 50 * r.seviye; can = Math.min(100, can + 25); O.cal("carp"); O.durumYaz("Nakavt! Sıradaki rakip geliyor"); }
    }
    function sahne_(dt) {
      // Oyuncunun eldivenleri (birinci şahıs)
      for (let i = 0; i < 2; i++) {
        const e = el[i], m = eller[i]; let tx = e.x, ty = e.y, tz = 2.2;
        if (kalkan) { tx = i ? 0.24 : -0.24; ty = 1.98; tz = 2.75; }
        if (e.t > 0) {       // vuruş: kroşede eldiven yandan kavis çizerek, yukarıdan vuruşta tepeden inerek rakibe gider
          e.t -= dt; const ilerleme = Math.min(1, (0.3 - e.t) / 0.3), k = Math.sin(ilerleme * PI), yay = ilerleme < 0.5 ? Math.sin(ilerleme * 2 * PI) : 0;
          tx = yaklas(tx, i ? 0.14 : -0.14, k) + (e.tur === "krose" ? (i ? 0.75 : -0.75) * yay : 0);
          ty = yaklas(ty, e.bolge === "kafa" ? kafaY() : karinY(), k) + (e.tur === "ust" ? 0.75 * yay : 0); tz = yaklas(tz, 0.85, k);
        }
        const k = us(dt, 24); m.position.x += (tx - m.position.x) * k; m.position.y += (ty - m.position.y) * k; m.position.z += (tz - m.position.z) * k;
      }
      // Rakip
      r.t += dt; O.durusSifir(Dr);
      const ust = r.koruma === "ust"; let ileri = 0;
      Dr.kalcaY = Math.sin(O.zaman() * 5) * 0.03 - 0.04; Dr.lUst = 0.25; Dr.rUst = -0.2; Dr.lAlt = -0.3; Dr.rAlt = -0.25;
      Dr.lKolX = Dr.rKolX = ust ? 1.1 : 0.4; Dr.lDirX = Dr.rDirX = ust ? 1.75 : 1.45; Dr.lKolZ = 0.25; Dr.rKolZ = -0.25;
      const kol = (xv, dv) => { if (r.el) { Dr.rKolX = xv; Dr.rDirX = dv; } else { Dr.lKolX = xv; Dr.lDirX = dv; } };
      if (r.durum === "gir") { rakip.kok.position.z = yaklas(rakip.kok.position.z, 0, us(dt, 4)); if (r.t > 1.1) { r.durum = "bekle"; r.t = 0; } }
      else if (r.durum === "bekle") {
        if ((r.korumaT -= dt) <= 0) { r.koruma = ust ? "alt" : "ust"; r.korumaT = 1.2 + Math.random() * 1.6; }
        if ((r.saldiriT -= dt) <= 0) { r.durum = "hazirlan"; r.t = 0; r.el = rast(2); O.cal("zipla", 0.45, 0.7); }
      } else if (r.durum === "hazirlan") {       // kolunu geri çeker: şimdi kalkan zamanı
        kol(-0.7, 1.9); Dr.govdeY = (r.el ? -1 : 1) * 0.45; Dr.govdeX = 0.15;
        if (r.t > (Z().kolay ? 0.95 : Z().zor ? 0.5 : 0.6)) { r.durum = "vur"; r.t = 0; r.vurdu = false; }      // kolayda kalkan için daha çok zaman
      } else if (r.durum === "vur") {
        const k = Math.min(1, r.t / 0.12); kol(1.5, 0.05); Dr.govdeX = -0.4 * k; ileri = 0.9 * k;
        if (!r.vurdu && r.t > 0.1) {
          r.vurdu = true;
          if (kalkan) { O.cal("blok", 0.8); O.parAt(0, 1.95, 2.6, 8, 0xffffff, 3, 0.1); skor += 5; }
          else { can -= Math.round((8 + 2 * r.seviye) * Z().hasar); O.cal("vur"); O.flas(); O.sarsinti(0.35); }
        }
        if (r.t > 0.38) { r.durum = "bekle"; r.t = 0; r.saldiriT = ara(); }
      } else if (r.durum === "ko") {
        rakip.kok.rotation.x = yaklas(rakip.kok.rotation.x, -1.45, us(dt, 7)); rakip.kok.position.y = yaklas(rakip.kok.position.y, 0.35, us(dt, 7));
        Dr.lKolZ = 1.2; Dr.rKolZ = -1.2; Dr.lKolX = Dr.rKolX = 0; Dr.lDirX = Dr.rDirX = 0.2;
        if (r.t > 1.9) yeniRakip(r.seviye + 1);
      }
      if (r.sersem > 0) { r.sersem -= dt; const k = Math.max(0, r.sersem / 0.3); if (r.sersemBolge === "kafa") { Dr.basX += 0.7 * k; Dr.govdeX += 0.25 * k; } else { Dr.govdeX -= 0.55 * k; Dr.basX -= 0.3 * k; } }
      if (r.durum !== "gir" && r.durum !== "ko") rakip.kok.position.z = ileri;
      O.durusUygula(rakip, Dr);
      O.hPoz.set(0, 2.0, 3.7); O.hBak.set(0, 1.7, 0);
    }
    return {
      id: "boks", ad: "Boks Ringi", elSerbest: true, elGerek: true, ipucu: "Kroşe at: yumruğunu yandan içeri savur. Yukarıdan indir = kafa. Yüzünü kapat = kalkan",
      kur() {
        grup = new THREE.Group(); sahne.add(grup);
        const l = [p(yKutu(10.4, 0.14, 10.4, 0.05), 0x4aa3ff, 0, 0.07, 0), p(yKutu(9.2, 0.02, 9.2, 0.008), 0x7cc0ff, 0, 0.145, 0)];
        for (const [a, b, renk] of [[-1, -1, R.kirmizi], [1, -1, R.mavi], [-1, 1, R.beyaz], [1, 1, R.beyaz]])
          l.push(p(sil(14), renk, a * 4.8, 1.3, b * 4.8, 0, 0, 0, 0.2, 2.6, 0.2), p(kure(12), R.sari, a * 4.8, 2.7, b * 4.8, 0, 0, 0, 0.26));
        for (let i = 0; i < 3; i++) {
          const y = 0.9 + i * 0.65, renk = [R.kirmizi, R.beyaz, R.mavi][i];
          l.push(p(sil(8), renk, 0, y, -4.8, 0, 0, PI / 2, 0.05, 9.6, 0.05), p(sil(8), renk, -4.8, y, 0, PI / 2, 0, 0, 0.05, 9.6, 0.05), p(sil(8), renk, 4.8, y, 0, PI / 2, 0, 0, 0.05, 9.6, 0.05));
        }
        grup.add(ag(l));
        const g = buyukEldiven(R.mavi);
        eller = [0, 1].map(i => { const m = new THREE.Mesh(g, mPlastik); m.rotation.set(-1.15, i ? PI : 0, 0); m.scale.setScalar(0.62); m.castShadow = true; grup.add(m); return m; });
      },
      ac() {
        grup.visible = true; O.karakter().kok.visible = false; rakip = O.diger();
        can = 100; skor = 0; kalkan = oncekiKalkan = false;
        el.forEach((e, i) => { Object.assign(e, yeniEl(i ? 0.6 : -0.6)); eller[i].position.set(e.x, e.y, 2.2); });
        yeniRakip(1); O.fov(56); sahne_(0.001);
      },
      kapat() { grup.visible = false; },
      bekle(dt) { if (r && r.durum !== "ko") { r.saldiriT = 2; sahne_(dt); } },
      guncelle(dt) {
        if (!O.kameraKontrol()) kalkan = !!O.tus.ArrowDown;
        sahne_(dt);
        if (kalkan !== oncekiKalkan) { oncekiKalkan = kalkan; O.durumYaz(kalkan ? "🛡️ KALKAN" : ""); }
        O.solYaz(String(skor)); O.sagYaz("❤️ " + Math.max(0, can) + "   🥊 " + Math.max(0, r.can) + "/" + r.maks);
        if (can <= 0) { O.cal("kaybet"); O.bitir(skor, { baslik: "Nakavt oldun!", satir: O.t("Seviye") + " " + r.seviye }); }
        return 0;
      },
      poz(P, dt) {
        // Hızlar omuz genişliği/saniye cinsinden. İleri yumruk kamerada görünmediği için beklenmez:
        // sol yumruk sağa, sağ yumruk sola savrulursa kroşe; baş üstünden aşağı inerse kafaya vuruş.
        const gen = P.tgen, omuzY = (P.sol.sy + P.sag.sy) / 2, esik = 3.2 / O.has(), simdi = O.zaman(), d = Math.max(dt, 0.02); let yuzde = 0;
        [P.sol, P.sag].forEach((w, i) => {
          const e = el[i];
          if (w.g < 0.4) { e.var = false; return; }
          if (e.var) { e.vx += ((w.x - e.px) / d / gen - e.vx) * 0.6; e.vy += ((w.y - e.py) / d / (gen * P.oran) - e.vy) * 0.6; } else e.vx = e.vy = 0;
          e.var = true; e.px = w.x; e.py = w.y;
          e.x = (w.x - 0.5) * 3.0; e.y = 1.95 + (0.5 - w.y) * 1.4;
          if (w.y < P.by - 0.25 * gen * P.oran) e.ustT = simdi;                    // yumruk başın üstünde
          const iceri = i ? -e.vx : e.vx;
          if (e.hazir) {
            if (e.vy > esik && simdi - e.ustT < 0.6) { e.hazir = false; yumruk(i, "kafa", "ust"); }
            else if (iceri > esik) { e.hazir = false; yumruk(i, w.y < omuzY + 0.02 ? "kafa" : "karin", "krose"); }
          } else if (Math.max(iceri, e.vy) < esik * 0.4) e.hazir = true;
          // Kalkan: iki yumruk da burun hizasında ya da üstünde, yüze yakın ve duruyor
          if (Math.abs(w.x - P.bx) < gen * 0.9 && w.y < P.by + 0.12 * gen * P.oran && w.y > P.by - 1.2 * gen * P.oran && Math.hypot(e.vx, e.vy) < 2.5) yuzde++;
        });
        kalkan = yuzde === 2;
      },
      tus(k) { if (k === "ArrowLeft") yumruk(0, "kafa"); else if (k === "ArrowRight") yumruk(1, "kafa"); else if (k === "a") yumruk(0, "karin"); else if (k === "d") yumruk(1, "karin"); else if (k === "ArrowUp") yumruk(ustSira ^= 1, "kafa", "ust"); },
      dokun(x, y) { yumruk(x < 0.5 ? 0 : 1, y < 0.5 ? "kafa" : "karin"); },
      onizle() { this.ac(); r.durum = "bekle"; rakip.kok.position.z = 0; el[1].t = 0.13; el[1].bolge = "kafa"; sahne_(0.001); eller[1].position.set(0.2, kafaY() - 0.1, 1.2); eller[0].position.set(-0.75, 1.5, 2.2); }
    };
  }

  // ===================================================================================================
  //  DANS PİSTİ — öndeki oyuncak bir duruş gösterir, ritim bitmeden aynısını yap
  // ===================================================================================================
  const POZLAR = [   // açılar: 0 = kol aşağı, ±1,57 = yana, ±3 = yukarı. L = ekranın solu (senin sol kolun)
    { ad: "Eller yukarı", L: [-2.95, 0], R: [2.95, 0] }, { ad: "Kollar yana", L: [-1.57, 0], R: [1.57, 0] }, { ad: "V yap", L: [-2.3, 0], R: [2.3, 0] },
    { ad: "Sol yukarı, sağ yana", L: [-2.95, 0], R: [1.57, 0] }, { ad: "Sağ yukarı, sol yana", L: [-1.57, 0], R: [2.95, 0] },
    { ad: "Pazı göster", L: [-1.57, -1.5], R: [1.57, 1.5] }, { ad: "Eller belde", L: [-0.75, 1.7], R: [0.75, -1.7] },
    { ad: "Disko sol", L: [-2.3, 0], R: [0.7, 0] }, { ad: "Disko sağ", L: [-0.7, 0], R: [2.3, 0] },
    { ad: "Sol el yukarı", L: [-2.95, 0], R: [0.15, 0] }, { ad: "Sağ el yukarı", L: [-0.15, 0], R: [2.95, 0] }];
  const NOTA = [262, 330, 392, 330, 440, 392, 330, 294, 262, 392, 523, 392, 440, 330, 294, 330];
  function dans() {
    let grup, karo, cubuk, ok, lider, hedef, hedefIdx = -1, t, aralik, sure, can, skor, seri, enIyi, vurusNo, sonucT, tusla;
    const Dl = O.yeniDurus(), gos = { L: [0, 0], R: [0, 0] }, oyuncu = { var: false, L: [0, 0], R: [0, 0] }, renk = new THREE.Color();
    function ses(tip, frek) {
      const s = O.ses(); if (!s.ctx) return;
      const c = s.ctx, z = c.currentTime, g = c.createGain(), o = c.createOscillator(); g.connect(s.ana); o.connect(g);
      if (tip === "davul") { o.frequency.setValueAtTime(130, z); o.frequency.exponentialRampToValueAtTime(45, z + 0.12); g.gain.setValueAtTime(0.55, z); g.gain.exponentialRampToValueAtTime(0.001, z + 0.16); }
      else if (tip === "zil") { o.type = "square"; o.frequency.value = 6200; g.gain.setValueAtTime(0.035, z); g.gain.exponentialRampToValueAtTime(0.001, z + 0.04); }
      else { o.type = "triangle"; o.frequency.value = frek; g.gain.setValueAtTime(0.14, z); g.gain.exponentialRampToValueAtTime(0.001, z + 0.24); }
      o.start(z); o.stop(z + 0.26);
    }
    function karoBoya() { for (let i = 0; i < 30; i++) karo.setColorAt(i, renk.set(CANLI[rast(8)]).multiplyScalar(0.55 + Math.random() * 0.45)); karo.instanceColor.needsUpdate = true; }
    function yeniPoz() { let i; do { i = rast(POZLAR.length); } while (i === hedefIdx); hedefIdx = i; hedef = POZLAR[i]; t = 0; enIyi = 9; tusla = false; O.durumYaz(hedef.ad); }
    function hata() {      // oyuncunun kolları ile hedef arasındaki ortalama açı farkı
      if (!oyuncu.var) return 9;
      let e = 0;
      for (const y of ["L", "R"]) e += Math.abs(sar(oyuncu[y][0] - hedef[y][0])) + Math.abs(sar(oyuncu[y][1] - (hedef[y][0] + hedef[y][1])));
      return e / 4;
    }
    function sahne_(dt) {
      const zm = O.zaman(), vurus = aralik / 4, faz = (t % vurus) / vurus, zip = Math.abs(Math.sin(faz * PI));
      // Lider: hedef duruşa yumuşakça geçer, ritimle yaylanır (bize dönük olduğu için kolları aynalı)
      const k = us(dt, 9);
      for (const y of ["L", "R"]) for (let i = 0; i < 2; i++) gos[y][i] += ((hedef ? hedef[y][i] : 0) - gos[y][i]) * k;
      O.durusSifir(Dl);
      Dl.rKolZ = -gos.L[0]; Dl.rDirZ = -gos.L[1]; Dl.lKolZ = -gos.R[0]; Dl.lDirZ = -gos.R[1];
      Dl.kalcaY = -0.07 * zip; Dl.lUst = 0.25 * zip; Dl.rUst = 0.25 * zip; Dl.lAlt = Dl.rAlt = -0.5 * zip; Dl.govdeY = Math.sin(zm * 3) * 0.15; Dl.basZ = Math.sin(zm * 3) * 0.1;
      O.durusUygula(lider, Dl);
      // Oyuncunun oyuncağı: senin kollarını taklit eder
      O.durusSifir(D);
      D.kalcaY = -0.05 * zip; D.lAlt = D.rAlt = -0.35 * zip; D.lUst = D.rUst = 0.18 * zip;
      if (oyuncu.var) { D.rKolZ = -oyuncu.L[0]; D.rDirZ = -sar(oyuncu.L[1] - oyuncu.L[0]); D.lKolZ = -oyuncu.R[0]; D.lDirZ = -sar(oyuncu.R[1] - oyuncu.R[0]); }      // bize dönük: ayna
      else { D.lKolZ = -0.2; D.rKolZ = 0.2; }
      cubuk.scale.x = Z().kolay ? 0.001 : Math.max(0.001, 1 - t / aralik);
      ok.position.y = 4.45 + Math.sin(zm * 4) * 0.12;
      O.hPoz.set(0, 2.75, 8.8); O.hBak.set(0, 1.95, 0);
    }
    return {
      id: "dans", ad: "Dans Pisti", elSerbest: true, elGerek: true, ipucu: "Sağdaki oyuncağın duruşunu taklit et — soldaki sensin",
      kur() {
        grup = new THREE.Group(); sahne.add(grup);
        karo = new THREE.InstancedMesh(yKutu(1.5, 0.1, 1.5, 0.03), new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0, envMapIntensity: 0.9 }), 30);
        const m = new THREE.Matrix4();
        for (let i = 0; i < 30; i++) karo.setMatrixAt(i, m.makeTranslation((i % 6 - 2.5) * 1.55, 0.05, (Math.floor(i / 6) - 2) * 1.55));
        karo.receiveShadow = true; grup.add(karo); karoBoya();
        cubuk = new THREE.Mesh(yKutu(4, 0.22, 0.22, 0.08), new THREE.MeshBasicMaterial({ color: 0xffd23f })); cubuk.position.set(0, 0.24, 3.7); grup.add(cubuk);      // kalan süre çubuğu (pistin önünde)
        ok = ag([p(koni(12), R.sari, 0, 0, 0, 0, 0, PI, 0.3, 0.6, 0.3)], false); ok.position.set(1.8, 4.45, 0); grup.add(ok);      // örnek oyuncağı gösteren ok
        grup.add(ag([p(simit(0.95, 0.07, PI * 2, 28), R.pembe, -1.8, 0.14, 0, PI / 2, 0, 0), p(simit(0.95, 0.07, PI * 2, 28), R.sari, 1.8, 0.14, 0, PI / 2, 0, 0)], false));
      },
      ac() {
        grup.visible = true; lider = O.diger();
        O.karakterTak(lider, grup, 1.8, 0.1, 0, 1.6, PI); O.karakterTak(O.karakter(), grup, -1.8, 0.1, 0, 1.6, PI);
        aralik = 2.7; sure = 0; can = 3; skor = 0; seri = 0; vurusNo = -1; sonucT = 0; hedef = null; hedefIdx = -1; t = 0; enIyi = 9; oyuncu.var = false;
        for (const y of ["L", "R"]) gos[y][0] = gos[y][1] = 0;
        O.solYaz("0"); O.sagYaz(kalp(3)); O.fov(52); sahne_(0.001);
      },
      kapat() { grup.visible = false; },
      bekle(dt) { hedef = null; t = 0; sahne_(dt); },
      guncelle(dt) {
        if (!hedef) yeniPoz();
        const zr = Z(), tol = sinirla(O.has(), 0.5, 2);
        sure += dt; t += dt; aralik = zr.kolay ? 2.7 : Math.max(zr.zor ? 1.4 : 1.6, 2.7 - sure * 0.012 * zr.rampa);
        const vurus = aralik / 4, no = Math.floor(sure / vurus);
        if (no !== vurusNo) { vurusNo = no; ses("davul"); ses("nota", NOTA[no % 16]); karoBoya(); } else if (Math.floor(sure / vurus * 2) % 2 === 1 && Math.floor((sure - dt) / vurus * 2) % 2 === 0) ses("zil");
        if (zr.kolay) {          // kolay: süre yok, doğru duruşu yapana kadar bekler
          if (t > 0.6 && (O.kameraKontrol() ? hata() < 0.85 * tol : tusla)) {
            skor += 20; seri++; O.cal("elmas", 0.7, 1.3); O.solYaz(String(skor));
            yeniPoz(); O.durumYaz(O.t("⭐ Harika!") + "  →  " + O.t(hedef.ad));
          }
          sahne_(dt); return 0;
        }
        if (t > aralik * 0.5) enIyi = Math.min(enIyi, O.kameraKontrol() ? hata() : (tusla ? 0.7 : 9));
        if (t >= aralik) {        // ritim doldu: en iyi andaki benzerliğe bak
          if (enIyi < 0.5 * tol) { skor += 30 + Math.min(seri, 10) * 2; seri++; O.durumYaz("⭐ Harika!"); O.cal("elmas", 0.7, 1.3); if (seri % 6 === 0 && can < 3) can++; }
          else if (enIyi < 0.85 * tol) { skor += 15; seri = 0; O.durumYaz("👍 İyi"); O.cal("elmas", 0.5); }
          else { can--; seri = 0; O.durumYaz("Kaçtı!"); O.cal("blok", 0.7); O.flas(); }
          O.sagYaz(kalp(can)); O.solYaz(String(skor));
          if (can <= 0) { O.cal("kaybet"); O.bitir(skor, { baslik: "Ritim kaçtı!", satir: "" }); return 0; }
          const sonAd = hedef; yeniPoz(); sonucT = 0.6; O.durumYaz(O.t(enIyi < 0.5 * tol ? "⭐ Harika!" : enIyi < 0.85 * tol ? "👍 İyi" : "Kaçtı!") + "  →  " + O.t(hedef.ad));
        }
        sahne_(dt);
        return 0;
      },
      poz(P) {
        const kol = (w, h) => { h[0] = Math.atan2(w.ex - w.sx, (w.ey - w.sy) / P.oran); h[1] = Math.atan2(w.x - w.ex, (w.y - w.ey) / P.oran); };
        oyuncu.var = P.sol.g > 0.3 && P.sag.g > 0.3;
        kol(P.sol, oyuncu.L); kol(P.sag, oyuncu.R);
      },
      tus(k) { if (k === " " || k === "ArrowUp") tusla = true; },
      dokun() { tusla = true; },
      onizle() { this.ac(); hedef = POZLAR[3]; for (const y of ["L", "R"]) { gos[y][0] = hedef[y][0]; gos[y][1] = hedef[y][1]; } oyuncu.var = true; oyuncu.L = [-2.95, -2.95]; oyuncu.R = [1.57, 1.57]; t = aralik * 0.4; sahne_(0.001); hedef = null; }
    };
  }

  // ===================================================================================================
  //  KIR GEÇ — oyuncak ortada, sağında solunda nesneler havaya fırlar; elinle vur kır, bombaya dokunma
  // ===================================================================================================
  function kirma() {
    const OLCEK = 1.8, UZAT = 1.25, OMUZ_X = 0.33 * OLCEK, OMUZ_Y = 0.1 + (0.84 + 0.47) * OLCEK, KOL1 = 0.3 * OLCEK * UZAT, KOL2 = 0.27 * OLCEK * UZAT;
    const MENZIL = 1.9, VURUS = 0.95;                 // nesne omuzdan bu kadar uzakta belirir; eldiven bu kadar yaklaşınca kırılır
    const SAAT = [8, 9, 10, 11, 12, 1, 2, 3, 4];      // 5-6-7 yok: gövdeye/bacaklara denk gelmesin
    const TUR = [{ geo: null, renk: 0xd9763f }, { geo: null, renk: 0xff8fb3 }, { geo: null, renk: 0x5fd6c9 }, { geo: null, renk: 0xffd23f }, { geo: null, renk: 0x8f5bff }];
    let grup, bomba, nesneler = [], can, skor, seri, sure, sayac;
    const havuz = [], dolu = {}, kol = [{ a: -0.2, b: 0, x: 0, y: 0 }, { a: 0.2, b: 0, x: 0, y: 0 }], hedefKol = [{ a: -0.2, b: 0 }, { a: 0.2, b: 0 }];
    function yer(saat) {       // saat konumu → dünyadaki yer: o taraftaki omuzdan MENZIL kadar uzak (kolu iyice uzatmak gerekir)
      const aci = saat % 12 * PI / 6, yon = saat === 12 ? 0 : saat < 6 ? 1 : -1, m = MENZIL * (0.96 + Math.random() * 0.08);
      if (!yon) return { x: 0, y: OMUZ_Y + Math.sqrt(m * m - OMUZ_X * OMUZ_X) };
      return { x: yon * OMUZ_X + Math.sin(aci) * m, y: OMUZ_Y + Math.cos(aci) * m };
    }
    const uzak = q => Math.hypot(q.x - kol[0].x, q.y - kol[0].y) > 1.15 && Math.hypot(q.x - kol[1].x, q.y - kol[1].y) > 1.15;
    function belir() {
      const bos = SAAT.filter(s => !dolu[s]); if (!bos.length) return null;
      let saat = bos[rast(bos.length)], q = yer(saat);
      for (let d = 0; d < 5 && !uzak(q); d++) { saat = bos[rast(bos.length)]; q = yer(saat); }      // elin zaten durduğu yerde belirmesin
      const zr = Z(), zs = sure * zr.rampa, bmb = Math.random() < (zr.kolay ? 0.06 : Math.min(0.3, 0.14 + zs * 0.002)), tur = TUR[rast(TUR.length)];
      const m = havuz.pop() || (() => { const a = new THREE.Mesh(TUR[0].geo, mPlastik); a.castShadow = true; grup.add(a); return a; })();
      m.geometry = bmb ? bomba : tur.geo; m.visible = true; m.position.set(q.x, q.y, 0.6); m.rotation.set(0, 0, 0); m.scale.setScalar(0.01);
      dolu[saat] = true;
      const n = { ag: m, bmb, renk: bmb ? 0x555a66 : tur.renk, x: q.x, y: q.y, saat, t: 0, omur: Math.max(1.3, 2.7 - zs * 0.012) * (zr.kolay ? 1.6 : 1), faz: Math.random() * 6 };
      nesneler.push(n); return n;
    }
    function temizle() { for (const n of nesneler) { n.ag.visible = false; havuz.push(n.ag); } nesneler = []; for (const s of SAAT) dolu[s] = false; }
    function sahne_(dt) {
      const k = us(dt, 20);
      for (let i = 0; i < 2; i++) {
        kol[i].a += sar(hedefKol[i].a - kol[i].a) * k; kol[i].b += (hedefKol[i].b - kol[i].b) * k;
        const yon = i ? 1 : -1, a = kol[i].a, ab = a + kol[i].b;       // eldivenin dünyadaki yeri = oyuncağın gerçek kolu
        kol[i].x = yon * OMUZ_X + KOL1 * Math.sin(a) + KOL2 * Math.sin(ab); kol[i].y = OMUZ_Y - KOL1 * Math.cos(a) - KOL2 * Math.cos(ab);
      }
      O.durusSifir(D);
      D.rKolZ = -kol[0].a; D.rDirZ = -kol[0].b; D.lKolZ = -kol[1].a; D.lDirZ = -kol[1].b;      // bize dönük: ekranın solundaki kol oyuncağın sağ kolu
      D.kalcaY = Math.sin(O.zaman() * 4) * 0.02; D.lUst = 0.12; D.rUst = -0.08;
      O.hPoz.set(0, 3.2, 9.6); O.hBak.set(0, 2.75, 0);
    }
    return {
      id: "kirma", ad: "Kır Geç", elSerbest: true, elGerek: true, ipucu: "Beliren nesneye uzan ve yumrukla kır. Bombaya dokunma!",
      kur() {
        grup = new THREE.Group(); sahne.add(grup);
        const saksi = new THREE.LatheGeometry([[0.001, -0.38], [0.3, -0.38], [0.44, 0.3], [0.5, 0.3], [0.5, 0.42], [0.4, 0.42]].map(a => new THREE.Vector2(a[0], a[1])), 16);
        TUR[0].geo = birlestir([p(saksi, 0xd9763f), p(sil(14), 0x6b4a2f, 0, 0.36, 0, 0, 0, 0, 0.4, 0.06, 0.4), p(kure(8), R.yesil, -0.1, 0.62, 0, 0, 0, 0.3, 0.12, 0.3, 0.06), p(kure(8), R.yesil, 0.12, 0.6, 0, 0, 0, -0.4, 0.12, 0.28, 0.06), p(kure(8), R.pembe, 0, 0.9, 0, 0, 0, 0, 0.13)]);
        TUR[1].geo = birlestir([p(kure(16), 0xff8fb3, 0, 0, 0, 0, 0, 0, 0.56, 0.48, 0.48), p(sil(12), 0xff6f9c, 0.56, 0.02, 0, 0, 0, PI / 2, 0.16, 0.14, 0.16), p(kure(8), 0xff6f9c, 0.3, 0.42, 0.2, 0, 0, 0, 0.12, 0.16, 0.06), p(kure(8), 0xff6f9c, 0.3, 0.42, -0.2, 0, 0, 0, 0.12, 0.16, 0.06),
          p(kure(6), R.siyah, 0.42, 0.18, 0.2, 0, 0, 0, 0.045), p(yKutu(0.26, 0.03, 0.07, 0.01), R.siyah, -0.05, 0.47, 0), ...[[-0.28, 0.22], [-0.28, -0.22], [0.28, 0.22], [0.28, -0.22]].map(q => p(sil(8), 0xff6f9c, q[0], -0.46, q[1], 0, 0, 0, 0.09, 0.2, 0.09))]);
        TUR[2].geo = birlestir([p(sil(16), 0x5fd6c9, 0, 0, 0, 0, 0, 0, 0.4, 0.8, 0.4), p(sil(16), R.sari, 0, 0.46, 0, 0, 0, 0, 0.43, 0.14, 0.43), p(yKutu(0.5, 0.36, 0.03, 0.01), R.krem, 0, 0, 0.395)]);
        const kl = []; kupEkle(kl, 0.85, -0.425, R.sari, R.krem); TUR[3].geo = birlestir(kl);
        TUR[4].geo = birlestir([p(kure(16), 0x8f5bff, 0, 0, 0, 0, 0, 0, 0.5), p(simit(0.5, 0.06, PI * 2, 24), R.sari, 0, 0, 0, PI / 2, 0, 0), p(kure(8), R.sari, 0, 0.5, 0, 0, 0, 0, 0.1)]);
        bomba = bombaGeo();
      },
      ac() {
        grup.visible = true; temizle();
        const k = O.karakter(); O.karakterTak(k, grup, 0, 0.1, 0, OLCEK, PI);
        k.solOmuz.scale.setScalar(UZAT); k.sagOmuz.scale.setScalar(UZAT); eldivenTak(k, 1.5);       // uzun kollar, iri eldivenler
        can = 3; skor = 0; seri = 0; sure = 0; sayac = 1;
        hedefKol[0].a = -0.2; hedefKol[1].a = 0.2; hedefKol[0].b = hedefKol[1].b = 0;
        O.solYaz("0"); O.sagYaz(kalp(3)); O.fov(52); sahne_(1);
      },
      kapat() { grup.visible = false; temizle(); },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        sure += dt; const zm = O.zaman(), vurus = VURUS * sinirla(O.has(), 0.6, 1.6);
        if (!O.kameraKontrol()) {     // işaretçi: o taraftaki kol işaretçiye uzanır
          const yariY = 9.6 * Math.tan(26 * PI / 180), px = (O.isaretci.x - 0.5) * 2 * yariY * O.kamera.aspect, py = 2.85 + (0.5 - O.isaretci.y) * 2 * yariY, i = px < 0 ? 0 : 1, yon = i ? 1 : -1;
          hedefKol[i].a = Math.atan2(px - yon * OMUZ_X, -(py - OMUZ_Y)); hedefKol[i].b = 0; hedefKol[1 - i].a = -yon * 0.2; hedefKol[1 - i].b = 0;
        }
        sahne_(dt);
        if ((sayac -= dt) <= 0) { sayac = Math.max(0.55, 1.45 - sure * Z().rampa * 0.01) / Z().yogun; if (nesneler.length < 4) belir(); }
        for (let i = nesneler.length - 1; i >= 0; i--) {
          const n = nesneler[i]; n.t += dt;
          const kalan = n.omur - n.t, b = Math.min(1, n.t / 0.18) * Math.min(1, Math.max(0, kalan) / 0.18);       // belirirken büyür, süresi dolunca küçülür
          n.ag.scale.setScalar(Math.max(0.01, b) * (1 + Math.sin(zm * 6 + n.faz) * 0.04)); n.ag.rotation.z = Math.sin(zm * 2.5 + n.faz) * 0.25; n.ag.position.y = n.y + Math.sin(zm * 3 + n.faz) * 0.06;
          let bitti = kalan <= 0;
          if (bitti && !n.bmb) seri = 0;
          if (!bitti && n.t > 0.3) for (let e = 0; e < 2 && !bitti; e++) if (Math.hypot(n.x - kol[e].x, n.y - kol[e].y) < vurus) {
            bitti = true;
            if (n.bmb) { can--; seri = 0; O.cal("carp"); O.cal("vur", 0.8, 0.6); O.flas(); O.sarsinti(0.45); O.parAt(n.x, n.y, 0.65, 16, 0xff7b1c, 6, 0.15); O.parAt(n.x, n.y, 0.65, 8, 0x2a2233, 5, 0.13); O.sagYaz(kalp(can)); }
            else { seri++; skor += 10 + Math.min(10, Math.floor(seri / 3)) * 2; O.cal("kir", 0.7, 0.85 + Math.random() * 0.4); O.parAt(n.x, n.y, 0.65, 12, n.renk, 5, 0.14); O.parAt(n.x, n.y, 0.65, 4, 0xffffff, 4, 0.09); }
          }
          if (bitti) { dolu[n.saat] = false; n.ag.visible = false; havuz.push(n.ag); nesneler[i] = nesneler[nesneler.length - 1]; nesneler.pop(); }
        }
        O.solYaz(String(skor));
        if (can <= 0) { O.cal("kaybet"); O.bitir(skor, { baslik: "Bum!", satir: "" }); }
        return 0;
      },
      poz(P) {
        const oku = (w, h) => { const a = Math.atan2(w.ex - w.sx, (w.ey - w.sy) / P.oran); h.a = a; h.b = w.g > 0.3 ? sar(Math.atan2(w.x - w.ex, (w.y - w.ey) / P.oran) - a) : 0; };
        oku(P.sol, hedefKol[0]); oku(P.sag, hedefKol[1]);
      },
      onizle() {
        this.ac(); hedefKol[0].a = -2.1; hedefKol[1].a = 1.2; sahne_(1); sure = 0;
        for (let i = 0; i < 5; i++) { const n = belir(); if (n) { n.ag.scale.setScalar(1); if (i === 4) { n.bmb = true; n.ag.geometry = bomba; } else { n.bmb = false; n.ag.geometry = TUR[i].geo; } } }
      }
    };
  }

  // ===================================================================================================
  //  2 KİŞİLİK: OYUNCAK YARIŞ ve GAZLI MOTOR — geniş yolda iki araç, aynı trafik; aradaki mesafe açıldıkça kamera yükselir
  // ===================================================================================================
  function yolIkili(tur) {
    const araba = tur === "araba", SERIT = araba ? [-6, -3.6, -1.2, 1.2, 3.6, 6] : [-5.2, -2.6, 0, 2.6, 5.2], YARI = araba ? 7.2 : 6.5, TRAFIK = 5;
    let yolDoku;
    const geo = { oto0: arabaGeo(R.mavi, true), oto1: arabaGeo(R.yesil, true), oto2: arabaGeo(R.sari, true), oto3: arabaGeo(R.mor, true), koni: oyuncakKamyonGeo() };
    const olu_ = (v, e) => Math.abs(v) < e ? 0 : (v - Math.sign(v) * e) / (1 - e);
    const egri = (v, o, u) => { const d = sinirla(olu_(v * O.has(), o), -1, 1); return Math.sign(d) * Math.pow(Math.abs(d), u); };
    return yarisIkili(O, {
      id: tur + "2", esi: tur, ad: araba ? "Oyuncak Yarış" : "Gazlı Motor", elGerek: true, yari: YARI, bitis: araba ? 1400 : 1600, hiz0: araba ? 15 : 19, hiz1: araba ? 30 : 36,
      yanHiz: araba ? 7.5 : 8.5, donusYum: araba ? 9 : 6, kamY: 7.2, kamZ: 9.5, geo,
      ipucu: araba ? "İkiniz de yumruklarınızı direksiyon gibi tutup çevirin" : "İkiniz de gidonu tutup vücudunuzu yatırın",
      kur(g) {
        yolOrtakKur();
        yolDoku = O.dokuYap(256, 256, (c, w, h) => {
          c.fillStyle = "#4f5873"; c.fillRect(0, 0, w, h);
          for (let i = 0; i < 2200; i++) { c.fillStyle = `rgba(${Math.random() > 0.5 ? "255,255,255" : "20,20,50"},${0.03 + Math.random() * 0.05})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
          c.fillStyle = "#ffd23f"; c.fillRect(6, 0, 6, h); c.fillRect(w - 12, 0, 6, h);
          c.fillStyle = "#f6f6f6"; for (let i = 1; i < SERIT.length; i++) c.fillRect(i / SERIT.length * w - 3, 0, 6, h * 0.5);
        }, 1, O.ZEMIN_BOY / 8);
        const yol = new THREE.Mesh(new THREE.PlaneGeometry(YARI * 2, O.ZEMIN_BOY), new THREE.MeshStandardMaterial({ map: yolDoku, roughness: 0.95, metalness: 0, envMapIntensity: 0.3 }));
        yol.rotation.x = -PI / 2; yol.position.set(0, 0.012, O.zeminZ); yol.receiveShadow = true; g.add(yol);
        g.add(ag([p(yKutu(0.24, 0.16, O.ZEMIN_BOY, 0.05), R.beyaz, -YARI - 0.1, 0.08, O.zeminZ), p(yKutu(0.24, 0.16, O.ZEMIN_BOY, 0.05), R.beyaz, YARI + 0.1, 0.08, O.zeminZ)], false));
      },
      ac() { O.susGoster(true, yolOrtak.sus); O.zeminHarita(yolOrtak.cim, 0.95); },
      kapat() { O.susGoster(false); O.zeminHarita(null); },
      kaydir(adim) { yolDoku.offset.y = (yolDoku.offset.y + adim / 8) % 1; yolOrtak.cim.offset.y = (yolOrtak.cim.offset.y + adim / 16) % 1; },
      aracYap(g, i) { const m = new THREE.Mesh(araba ? arabaGeo(i ? R.mavi : R.pembe, false) : motorGeo(i ? R.mavi : R.pembe), mPlastik); m.castShadow = true; g.add(m); },
      karakterBagla(a, k) { O.karakterTak(k, a, 0, araba ? -0.05 : 0.4, araba ? 0.25 : 0.3, araba ? 0.8 : 0.85); },
      aracDurus(a, s, t) { a.position.y = Math.sin(t * 30) * 0.012; a.rotation.set(0, -s.yon * 0.2, araba ? -s.yon * 0.04 : -s.yon * 0.5); },
      durus(Dd, s, k) {
        if (araba) { Dd.lUst = Dd.rUst = 1.45; Dd.lAlt = Dd.rAlt = -1.3; Dd.lKolX = 1.15 - s.yon * 0.4; Dd.rKolX = 1.15 + s.yon * 0.4; Dd.lDirX = Dd.rDirX = 0.35; Dd.lKolZ = 0.12; Dd.rKolZ = -0.12; Dd.basY = -s.yon * 0.25; }
        else { Dd.govdeX = -0.5; Dd.basX = 0.4; Dd.lUst = Dd.rUst = 1.0; Dd.lAlt = Dd.rAlt = -1.55; Dd.lKolX = Dd.rKolX = 1.2; Dd.lDirX = Dd.rDirX = 0.2; Dd.lKolZ = -0.2; Dd.rKolZ = 0.2; k.solKalca.rotation.z = -0.38; k.sagKalca.rotation.z = 0.38; }
      },
      dalga(z, ekle) {      // en az iki şerit hep açık (iki araç da geçebilsin)
        const n = Z().kolay ? 1 : 2, dolu = new Set();
        while (dolu.size < n) dolu.add(rast(SERIT.length));
        for (const s of dolu) { const kn = !araba && Math.random() < 0.4; ekle(kn ? "koni" : "oto" + rast(4), SERIT[s], z, { hiz: TRAFIK, bx: kn ? 1.15 : araba ? 1.55 : 1.1, bz: kn ? 2.2 : araba ? 2.6 : 2.3 }); }
        const bos = SERIT.map((x, i) => i).filter(i => !dolu.has(i));
        for (const b of bos.slice(0, 2)) for (let k = 0; k < 4; k++) O.elmasEkle(SERIT[b], 0.9, z + 10 - k * 2.4);
      },
      girdi(H) {
        const elVar = H.sol.g > 0.4 && H.sag.g > 0.4, direk = elVar ? Math.atan2(H.sag.y - H.sol.y, (H.sag.x - H.sol.x) * H.oran) : 0;
        if (araba) return elVar ? egri(direk / 0.6, 0.08, 1.25) : 0;
        const egim = Math.atan2(H.sag.sy - H.sol.sy, (H.sag.sx - H.sol.sx) * H.oran), kayma = (H.ox - H.tx) / H.tgen;
        return egri(direk / 1.5 + egim / 0.55 + kayma * 0.25, 0.15, 1.5);
      }
    });
  }

  // ===================================================================================================
  //  2 KİŞİLİK: DANS PİSTİ — ortada ayıcık duruş gösterir; solda Ponçik, sağda Zıpır onu taklit eder. Çok tutan kazanır
  // ===================================================================================================
  function dansIkili() {
    const TUR = 20;
    let grup, karo, ayi, ayiKol = {}, hedef = null, hedefIdx = -1, t, aralik, sure, vurusNo, tur_, puan = [0, 0], enIyi = [9, 9], bitti;
    const gos = { L: [0, 0], R: [0, 0] }, oyuncu = [{ var: false, L: [0, 0], R: [0, 0] }, { var: false, L: [0, 0], R: [0, 0] }], renk = new THREE.Color(), D2 = O.yeniDurus();
    function ses(tip, frek) {
      const s = O.ses(); if (!s.ctx) return;
      const c = s.ctx, z = c.currentTime, g = c.createGain(), o = c.createOscillator(); g.connect(s.ana); o.connect(g);
      if (tip === "davul") { o.frequency.setValueAtTime(130, z); o.frequency.exponentialRampToValueAtTime(45, z + 0.12); g.gain.setValueAtTime(0.55, z); g.gain.exponentialRampToValueAtTime(0.001, z + 0.16); }
      else { o.type = "triangle"; o.frequency.value = frek; g.gain.setValueAtTime(0.14, z); g.gain.exponentialRampToValueAtTime(0.001, z + 0.24); }
      o.start(z); o.stop(z + 0.26);
    }
    function yeniPoz() { let i; do { i = rast(POZLAR.length); } while (i === hedefIdx); hedefIdx = i; hedef = POZLAR[i]; t = 0; enIyi = [9, 9]; O.durumYaz("🧸 " + O.t(hedef.ad)); }
    function hata(o) { if (!o.var || !hedef) return 9; let e = 0; for (const y of ["L", "R"]) e += Math.abs(sar(o[y][0] - hedef[y][0])) + Math.abs(sar(o[y][1] - (hedef[y][0] + hedef[y][1]))); return e / 4; }
    function ayiYap() {
      const g = new THREE.Group(), kahve = 0xb07a4a, acik = 0xe8c49a;
      g.add(ag([p(kure(16), kahve, 0, 1.25, 0, 0, 0, 0, 0.75, 0.85, 0.65), p(kure(14), acik, 0, 1.2, 0.42, 0, 0, 0, 0.45, 0.55, 0.3),
        p(kure(16), kahve, 0, 2.35, 0, 0, 0, 0, 0.62, 0.58, 0.58), p(kure(12), acik, 0, 2.22, 0.5, 0, 0, 0, 0.27, 0.2, 0.18), p(kure(8), 0x3a2418, 0, 2.3, 0.66, 0, 0, 0, 0.09, 0.07, 0.06),
        p(kure(10), kahve, -0.5, 2.85, 0, 0, 0, 0, 0.24), p(kure(10), acik, -0.5, 2.85, 0.1, 0, 0, 0, 0.13), p(kure(10), kahve, 0.5, 2.85, 0, 0, 0, 0, 0.24), p(kure(10), acik, 0.5, 2.85, 0.1, 0, 0, 0, 0.13),
        p(kure(8), 0x1d1d26, -0.2, 2.47, 0.5, 0, 0, 0, 0.07), p(kure(8), 0x1d1d26, 0.2, 2.47, 0.5, 0, 0, 0, 0.07), p(simit(0.14, 0.03, PI, 12), 0x3a2418, 0, 2.12, 0.6, 0, 0, PI),
        p(kure(12), kahve, -0.38, 0.35, 0.1, 0, 0, 0, 0.3, 0.4, 0.36), p(kure(12), kahve, 0.38, 0.35, 0.1, 0, 0, 0, 0.3, 0.4, 0.36), p(kure(10), acik, -0.38, 0.2, 0.4, 0, 0, 0, 0.2, 0.2, 0.06), p(kure(10), acik, 0.38, 0.2, 0.4, 0, 0, 0, 0.2, 0.2, 0.06),
        p(koni(4), R.kirmizi, -0.2, 1.85, 0.5, 0, 0, -PI / 2, 0.16, 0.2, 0.08), p(koni(4), R.kirmizi, 0.2, 1.85, 0.5, 0, 0, PI / 2, 0.16, 0.2, 0.08)]));
      for (const y of ["L", "R"]) {
        const s = new THREE.Group(), d = new THREE.Group(), yon = y === "L" ? -1 : 1; s.position.set(yon * 0.68, 1.75, 0); d.position.y = -0.48;
        s.add(ag([p(kure(10), kahve, 0, -0.24, 0, 0, 0, 0, 0.2, 0.32, 0.2)])); d.add(ag([p(kure(10), kahve, 0, -0.22, 0, 0, 0, 0, 0.18, 0.3, 0.18), p(kure(8), acik, 0, -0.45, 0.04, 0, 0, 0, 0.15)]));
        s.add(d); g.add(s); ayiKol[y] = { s, d };
      }
      return g;
    }
    function sahne_(dt) {
      const zm = O.zaman(), vurus = aralik / 4, faz = (t % vurus) / vurus, zip = Math.abs(Math.sin(faz * PI)), k = us(dt, 9);
      for (const y of ["L", "R"]) for (let i = 0; i < 2; i++) gos[y][i] += ((hedef ? hedef[y][i] : 0) - gos[y][i]) * k;
      // ayıcık bize dönük: ekranın solundaki kol (L) onun sağ koludur
      ayiKol.L.s.rotation.z = gos.L[0]; ayiKol.L.d.rotation.z = gos.L[1]; ayiKol.R.s.rotation.z = gos.R[0]; ayiKol.R.d.rotation.z = gos.R[1];
      ayi.position.y = 0.1 + zip * 0.1; ayi.rotation.y = Math.sin(zm * 2) * 0.08;
      const ks = O.oyuncular();
      [O.D, D2].forEach((Dd, i) => {
        const o = oyuncu[i]; O.durusSifir(Dd); Dd.kalcaY = -0.05 * zip; Dd.lAlt = Dd.rAlt = -0.35 * zip; Dd.lUst = Dd.rUst = 0.18 * zip;
        if (o.var) { Dd.rKolZ = -o.L[0]; Dd.rDirZ = -sar(o.L[1] - o.L[0]); Dd.lKolZ = -o.R[0]; Dd.lDirZ = -sar(o.R[1] - o.R[0]); } else { Dd.lKolZ = -0.2; Dd.rKolZ = 0.2; }
      });
      O.durusUygula(ks[1], D2);
      O.hPoz.set(0, 3.0, 10.5); O.hBak.set(0, 1.9, 0);
    }
    return {
      id: "dans2", esi: "dans", ad: "Dans Pisti", ikiKisi: true, elSerbest: true, elGerek: true, ipucu: "Ortadaki ayıcığın duruşunu ikiniz de taklit edin!",
      kur() {
        grup = new THREE.Group(); grup.visible = false; sahne.add(grup);
        karo = new THREE.InstancedMesh(yKutu(1.5, 0.1, 1.5, 0.03), new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0, envMapIntensity: 0.9 }), 42);
        const m = new THREE.Matrix4(); for (let i = 0; i < 42; i++) karo.setMatrixAt(i, m.makeTranslation((i % 7 - 3) * 1.55, 0.05, (Math.floor(i / 7) - 2.5) * 1.55));
        karo.receiveShadow = true; grup.add(karo);
        ayi = ayiYap(); ayi.position.set(0, 0.1, -1.3); ayi.scale.setScalar(1.25); grup.add(ayi);
        grup.add(ag([p(simit(0.95, 0.07, PI * 2, 28), R.pembe, -3.1, 0.14, 0.4, PI / 2, 0, 0), p(simit(0.95, 0.07, PI * 2, 28), R.mavi, 3.1, 0.14, 0.4, PI / 2, 0, 0), p(simit(1.2, 0.08, PI * 2, 28), R.sari, 0, 0.14, -1.3, PI / 2, 0, 0)], false));
      },
      ac() {
        grup.visible = true; const ks = O.oyuncular();
        O.karakterTak(ks[0], grup, -3.1, 0.1, 0.4, 1.5, PI); O.karakterTak(ks[1], grup, 3.1, 0.1, 0.4, 1.5, PI);
        aralik = Z().kolay ? 3.2 : 2.7; sure = 0; vurusNo = -1; tur_ = 0; puan = [0, 0]; hedef = null; hedefIdx = -1; t = 0; bitti = false; oyuncu.forEach(o => { o.var = false; });
        for (const y of ["L", "R"]) gos[y][0] = gos[y][1] = 0;
        for (let i = 0; i < 42; i++) karo.setColorAt(i, renk.set(CANLI[rast(8)])); karo.instanceColor.needsUpdate = true;
        O.solYaz("Ponçik 0"); O.sagYaz("Zıpır 0"); O.fov(54); sahne_(0.001);
      },
      kapat() { grup.visible = false; },
      bekle(dt) { hedef = null; t = 0; sahne_(dt); },
      guncelle(dt) {
        if (bitti) { sahne_(dt); return 0; }
        if (!hedef) yeniPoz();
        const zr = Z(), tol = sinirla(O.has(), 0.5, 2);
        sure += dt; t += dt; aralik = zr.kolay ? 3.2 : Math.max(zr.zor ? 1.6 : 1.9, 2.7 - sure * 0.01 * zr.rampa);
        const vurus = aralik / 4, no = Math.floor(sure / vurus);
        if (no !== vurusNo) { vurusNo = no; ses("davul"); ses("nota", NOTA[no % 16]); if (no % 4 === 0) { for (let i = 0; i < 42; i++) karo.setColorAt(i, renk.set(CANLI[rast(8)]).multiplyScalar(0.55 + Math.random() * 0.45)); karo.instanceColor.needsUpdate = true; } }
        if (t > aralik * 0.45) oyuncu.forEach((o, i) => { enIyi[i] = Math.min(enIyi[i], hata(o)); });
        if (t >= aralik) {
          const sonuc = enIyi.map(e => e < 0.5 * tol ? 30 : e < 0.85 * tol ? 15 : 0);
          puan[0] += sonuc[0]; puan[1] += sonuc[1];
          const isim = ["Ponçik", "Zıpır"], y = sonuc.map((s, i) => isim[i] + (s >= 30 ? " ⭐" : s ? " 👍" : " ✗")).join("   ");
          if (sonuc[0] || sonuc[1]) O.cal("elmas", 0.6, 1.3); else O.cal("blok", 0.5);
          O.solYaz("Ponçik " + puan[0]); O.sagYaz("Zıpır " + puan[1]); tur_++;
          if (tur_ >= TUR) {
            bitti = true; const k = puan[0] === puan[1] ? -1 : puan[0] > puan[1] ? 0 : 1;
            O.cal("elmas", 1, 1.3); O.parAt(0, 3, 0, 40, 0xffe066, 7, 0.15);
            setTimeout(() => { if (grup.visible) O.bitir(Math.max(...puan), { baslik: k < 0 ? "🤝 " + O.t("Berabere!") : "🏆 " + isim[k] + " " + O.t("kazandı!"), satir: "Ponçik " + puan[0] + "  •  Zıpır " + puan[1] }); }, 1500);
            sahne_(dt); return 0;
          }
          yeniPoz(); O.durumYaz(y + "   →   🧸 " + O.t(hedef.ad));
        }
        sahne_(dt); return 0;
      },
      poz(P) {
        const kol = (w, h, Hh) => { h[0] = Math.atan2(w.ex - w.sx, (w.ey - w.sy) / Hh.oran); h[1] = Math.atan2(w.x - w.ex, (w.y - w.ey) / Hh.oran); };
        O.ikiP().forEach((H, i) => { const o = oyuncu[i]; o.var = H.var && H.sol.g > 0.3 && H.sag.g > 0.3; if (o.var) { kol(H.sol, o.L, H); kol(H.sag, o.R, H); } });
      },
      onizle() { this.ac(); hedef = POZLAR[1]; for (const y of ["L", "R"]) { gos[y][0] = hedef[y][0]; gos[y][1] = hedef[y][1]; } oyuncu[0].var = oyuncu[1].var = true; oyuncu[0].L = [-1.5, -1.5]; oyuncu[0].R = [1.6, 1.6]; oyuncu[1].L = [-2.9, -2.9]; oyuncu[1].R = [1.5, 1.5]; sahne_(0.001); }
    };
  }

  return [yolOyunu("araba"), yolOyunu("motor"), boks(), dans(), kirma(), yolIkili("araba"), yolIkili("motor"), dansIkili()];
}
