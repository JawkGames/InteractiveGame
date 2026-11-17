// Interactive Game — 11 yeni oyun: Kuş Uçuşu, Uzak Vuruş, Şekil Duvarı, Kaleci, Davulcu, Kayak, Yüzme, Dur-Kalk,
// İp Atlama, Hava Ressamı, Kano. Hepsi index.html'deki ortak motoru (O) kullanır; görseller tamamen kodla çizilir.
// Her oyun: kur (bir kez), ac (sıfırla+göster), kapat, guncelle(dt), bekle(dt), poz(P, dt), onizle, ogretici (adımlar).
import yarisIkili from "./ikili.js";
export default function oyunlar2Kur(O) {
  const { Z, THREE, sahne, R, CANLI, PI, p, birlestir, kure, sil, koni, simit, yKutu, kupEkle, mPlastik, rast, sinirla, yaklas, D } = O;
  const T = s => O.t(s);
  const us = (dt, k) => 1 - Math.exp(-dt * k);
  const kalp = n => "❤️".repeat(Math.max(0, n));
  const sar = a => { while (a > PI) a -= 2 * PI; while (a < -PI) a += 2 * PI; return a; };
  const ag = (parcalar, golge = true) => { const a = new THREE.Mesh(birlestir(parcalar), mPlastik); a.castShadow = golge; a.receiveShadow = true; return a; };
  const grupYap = () => { const g = new THREE.Group(); g.visible = false; sahne.add(g); return g; };
  const olu = (v, e) => Math.abs(v) < e ? 0 : (v - Math.sign(v) * e) / (1 - e);
  const egri = (v, olum, us_) => { const d = sinirla(olu(v, olum), -1, 1); return Math.sign(d) * Math.pow(Math.abs(d), us_); };

  // --- Kol açıları (ekran düzleminde): a = üst kol, ab = ön kolun mutlak açısı. 0 aşağı, - ekranın solu, ± π yukarı ---
  const kolAci = (w, oran, h) => { h.a = Math.atan2(w.ex - w.sx, (w.ey - w.sy) / oran); h.ab = Math.atan2(w.x - w.ex, (w.y - w.ey) / oran); return h; };
  const kolYumusat = (h, hd, k) => { h.a += sar(hd.a - h.a) * k; h.ab += sar(hd.ab - h.ab) * k; };
  function kolYaz(Dd, L, Rr, bize) {        // bize: oyuncak bize dönük (ayna); değilse sırtı bize dönük
    if (bize) { Dd.rKolZ = -L.a; Dd.rDirZ = -sar(L.ab - L.a); Dd.lKolZ = -Rr.a; Dd.lDirZ = -sar(Rr.ab - Rr.a); }
    else { Dd.lKolZ = L.a; Dd.lDirZ = sar(L.ab - L.a); Dd.rKolZ = Rr.a; Dd.rDirZ = sar(Rr.ab - Rr.a); }
  }
  // Elin dünyadaki yeri (oyuncağın gerçek kol boyuyla, ekran düzleminde)
  function elYeri(c, yon, kol, olcek, uzat = 1) {
    const OX = 0.33 * olcek, OY = 0.1 + 1.31 * olcek, K1 = 0.3 * olcek * uzat, K2 = 0.27 * olcek * uzat;
    return { x: c + yon * OX + K1 * Math.sin(kol.a) + K2 * Math.sin(kol.ab), y: OY - K1 * Math.cos(kol.a) - K2 * Math.cos(kol.ab) };
  }
  // Bileğin hızını izler (omuz genişliği / saniye). vy > 0: aşağı iniyor
  const izci = () => ({ var: false, px: 0, py: 0, vx: 0, vy: 0 });
  function izle(h, x, y, gen, oran, dt) {
    const d = Math.max(dt, 0.02);
    if (h.var) { h.vx += ((x - h.px) / d / gen - h.vx) * 0.6; h.vy += ((y - h.py) / d / (gen * oran) - h.vy) * 0.6; } else { h.vx = h.vy = 0; }
    h.var = true; h.px = x; h.py = y;
  }
  // Tek zıplama algılayıcı: omuzlar ölçülen duruştan yükselince bir kez tetikler
  function ziplamaAlgila(st, P) {
    const fark = (P.ty - P.oy) / P.tgovde, esik = 0.11 / O.has(), simdi = performance.now();
    if (st.hazir && fark > esik && simdi > st.bekle) { st.hazir = false; st.bekle = simdi + 600; return true; }
    if (!st.hazir && fark < esik * 0.4) st.hazir = true;
    return false;
  }
  O.ziplaAlgila = ziplamaAlgila;
  // Tutorial pozları (öğretici çizimi için). Açılar oyundaki gibi: lu/ru üst kol, ll/rl ön kol (mutlak)
  const PZ = {
    duz: { lu: -0.15, ll: -0.1, ru: 0.15, rl: 0.1 },
    yukari: { lu: -2.95, ll: -2.95, ru: 2.95, rl: 2.95 },
    yana: { lu: -1.57, ll: -1.57, ru: 1.57, rl: 1.57 },
    yanaAsagi: { lu: -0.7, ll: -0.7, ru: 0.7, rl: 0.7 },
    onde: { lu: -0.6, ll: -1.9, ru: 0.6, rl: 1.9 }
  };
  const Pz = (temel, ek) => Object.assign({}, PZ[temel] || temel, ek || {});

  // Ortak dokular
  const suDoku = () => O.dokuYap(256, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#3fb6ff"); g.addColorStop(1, "#2f9df0"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * w, y = Math.random() * h, l = 14 + Math.random() * 40;
      c.strokeStyle = `rgba(255,255,255,${0.12 + Math.random() * 0.25})`; c.lineWidth = 2 + Math.random() * 3; c.lineCap = "round";
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 6, x + l, y); c.stroke();
    }
  }, 6, 30);
  const cimDoku = () => O.dokuYap(256, 256, (c, w, h) => {
    c.fillStyle = "#7fd162"; c.fillRect(0, 0, w, h); c.fillStyle = "#73c657"; c.fillRect(0, 0, w, h / 2);
    for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(${Math.random() > 0.5 ? "190,240,150" : "40,120,50"},${0.1 + Math.random() * 0.18})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 3 + Math.random() * 4); }
  }, O.ZEMIN_EN / 16, O.ZEMIN_BOY / 16);
  const karDoku = () => O.dokuYap(256, 256, (c, w, h) => {
    c.fillStyle = "#f4f9ff"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) { c.fillStyle = `rgba(${Math.random() > 0.5 ? "200,220,245" : "255,255,255"},${0.3 + Math.random() * 0.5})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    c.strokeStyle = "rgba(170,200,235,.35)"; c.lineWidth = 2; for (let i = 0; i < 8; i++) { c.beginPath(); const x = Math.random() * w; c.moveTo(x, 0); c.bezierCurveTo(x + 20, h / 3, x - 20, h * 2 / 3, x, h); c.stroke(); }
  }, O.ZEMIN_EN / 12, O.ZEMIN_BOY / 12);

  // Ortak modeller
  const cam = () => birlestir([p(sil(10), R.koyuAhsap, 0, 0.6, 0, 0, 0, 0, 0.26, 1.2, 0.26), p(koni(12), 0x3fae5a, 0, 2.0, 0, 0, 0, 0, 1.6, 2.2, 1.6), p(koni(12), 0x4cc06a, 0, 3.2, 0, 0, 0, 0, 1.25, 2.0, 1.25), p(koni(12), 0x5fd07c, 0, 4.3, 0, 0, 0, 0, 0.85, 1.7, 0.85)]);
  const karliCam = () => birlestir([p(sil(10), R.koyuAhsap, 0, 0.6, 0, 0, 0, 0, 0.26, 1.2, 0.26), p(koni(12), 0x2f8f4e, 0, 2.0, 0, 0, 0, 0, 1.6, 2.2, 1.6), p(koni(12), 0xffffff, 0, 2.75, 0, 0, 0, 0, 1.25, 0.6, 1.25),
    p(koni(12), 0x3a9d5a, 0, 3.2, 0, 0, 0, 0, 1.25, 2.0, 1.25), p(koni(12), 0xffffff, 0, 4.0, 0, 0, 0, 0, 0.95, 0.5, 0.95), p(koni(12), 0x46ad66, 0, 4.3, 0, 0, 0, 0, 0.85, 1.7, 0.85), p(koni(12), 0xffffff, 0, 5.0, 0, 0, 0, 0, 0.45, 0.4, 0.45)]);
  const kardanAdam = () => birlestir([p(kure(14), R.beyaz, 0, 0.7, 0, 0, 0, 0, 0.75), p(kure(14), R.beyaz, 0, 1.65, 0, 0, 0, 0, 0.52), p(kure(12), R.beyaz, 0, 2.35, 0, 0, 0, 0, 0.38),
    p(koni(10), R.turuncu, 0, 2.33, 0.48, PI / 2, 0, 0, 0.08, 0.35, 0.08), p(kure(6), R.siyah, -0.13, 2.45, 0.32, 0, 0, 0, 0.05), p(kure(6), R.siyah, 0.13, 2.45, 0.32, 0, 0, 0, 0.05),
    p(sil(14), R.siyah, 0, 2.72, 0, 0, 0, 0, 0.3, 0.06, 0.3), p(sil(14), R.siyah, 0, 2.95, 0, 0, 0, 0, 0.22, 0.45, 0.22), p(simit(0.4, 0.08, PI * 2, 18), R.kirmizi, 0, 1.95, 0, PI / 2, 0, 0)]);
  const kaya = (r = 1) => birlestir([p(new THREE.DodecahedronGeometry(1, 0), 0x9aa3b2, 0, 0.45 * r, 0, 0.3, 0.5, 0, 1.0 * r, 0.7 * r, 0.9 * r), p(new THREE.DodecahedronGeometry(1, 0), 0xb4bccb, 0.55 * r, 0.3 * r, 0.3 * r, 0.6, 0.2, 0, 0.5 * r, 0.4 * r, 0.5 * r)]);
  const agac = () => birlestir([p(sil(10), R.koyuAhsap, 0, 1.0, 0, 0, 0, 0, 0.3, 2.0, 0.3), p(kure(14), 0x57c66b, 0, 3.1, 0, 0, 0, 0, 1.5), p(kure(12), 0x6ad57c, 0.9, 2.6, 0.3, 0, 0, 0, 1.05), p(kure(12), 0x48b860, -0.9, 2.7, -0.2, 0, 0, 0, 1.1)]);
  const topGeo = (r = 0.3) => { const l = [p(kure(16), R.beyaz, 0, 0, 0, 0, 0, 0, r)]; for (let i = 0; i < 12; i++) { const u = i * 2.4, v = Math.acos(1 - 2 * (i + 0.5) / 12); l.push(p(kure(6), R.siyah, Math.sin(v) * Math.cos(u) * r * 0.92, Math.cos(v) * r * 0.92, Math.sin(v) * Math.sin(u) * r * 0.92, 0, 0, 0, r * 0.28, r * 0.28, r * 0.28)); } return birlestir(l); };
  const balonGeo = renk => birlestir([p(kure(14), renk, 0, 0, 0, 0, 0, 0, 0.5, 0.6, 0.5), p(koni(8), renk, 0, -0.62, 0, PI, 0, 0, 0.1, 0.12, 0.1), p(sil(4), 0xffffff, 0, -1.1, 0, 0, 0, 0, 0.01, 0.9, 0.01), p(kure(8), 0xffffff, -0.18, 0.22, 0.38, 0, 0, 0, 0.1, 0.14, 0.05)]);

  // Arka arkaya çalan kısa sentez sesleri (davul, zil, tik)
  function sentez(tur, siddet = 1) {
    const s = O.ses(); if (!s.ctx) return;
    const c = s.ctx, z = c.currentTime, g = c.createGain(); g.connect(s.ana);
    if (tur === "kick" || tur === "tom") {
      const o = c.createOscillator(); o.connect(g); const f = tur === "kick" ? 120 : 220;
      o.frequency.setValueAtTime(f, z); o.frequency.exponentialRampToValueAtTime(f * 0.35, z + 0.15); g.gain.setValueAtTime(0.7 * siddet, z); g.gain.exponentialRampToValueAtTime(0.001, z + 0.2); o.start(z); o.stop(z + 0.22);
    } else {
      const n = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      n.buffer = b; const f = c.createBiquadFilter(); f.type = tur === "zil" ? "highpass" : "bandpass"; f.frequency.value = tur === "zil" ? 6000 : tur === "tik" ? 8000 : 1800;
      n.connect(f); f.connect(g); const sure = tur === "zil" ? 0.35 : tur === "tik" ? 0.03 : 0.12;
      g.gain.setValueAtTime((tur === "tik" ? 0.12 : 0.45) * siddet, z); g.gain.exponentialRampToValueAtTime(0.001, z + sure); n.start(z); n.stop(z + sure + 0.02);
    }
  }

  // ===================================================================================================
  //  1. KUŞ UÇUŞU — oyuncak kuşa dönüşür; kol çırp = yüksel, kollar açık = süzül, yana yatış = dönüş
  // ===================================================================================================
  function kus() {
    let grup, dunya, kusG = {}, aktifKus, bulutDeniz, bulutDoku, ada, iz, izListe = [], nesneler = [], manzara = [];
    const ALT_SINIR = 3.2;
    let by, vy, vx, yon, hedefYon, hiz, sure, mesafe, can, dokunulmaz, elmas, halka, intro, sonraki, kanatT, cirp, suzul, izT;
    const L = izci(), Rr = izci(); let cirpHazir = true;
    const havuzlar = {};
    function kusYap(renk, acik) {
      const g = new THREE.Group();
      g.add(ag([p(kure(16), renk, 0, 0, 0, 0, 0, 0, 0.55, 0.5, 0.8), p(kure(14), acik, 0, -0.12, -0.12, 0, 0, 0, 0.42, 0.36, 0.6), p(kure(16), renk, 0, 0.42, -0.62, 0, 0, 0, 0.42),
        p(koni(10), R.sari, 0, 0.38, -1.08, -PI / 2, 0, 0, 0.13, 0.32, 0.1), p(kure(8), R.beyaz, -0.17, 0.52, -0.95, 0, 0, 0, 0.11), p(kure(8), R.beyaz, 0.17, 0.52, -0.95, 0, 0, 0, 0.11),
        p(kure(6), R.siyah, -0.18, 0.53, -1.03, 0, 0, 0, 0.06), p(kure(6), R.siyah, 0.18, 0.53, -1.03, 0, 0, 0, 0.06), p(kure(8), 0xff9aa8, -0.3, 0.36, -0.88, 0, 0, 0, 0.08, 0.05, 0.03), p(kure(8), 0xff9aa8, 0.3, 0.36, -0.88, 0, 0, 0, 0.08, 0.05, 0.03),
        p(kure(8), acik, 0, 0.86, -0.6, 0.4, 0, 0, 0.08, 0.22, 0.08), p(kure(8), acik, 0.1, 0.82, -0.52, 0.6, 0, -0.4, 0.07, 0.18, 0.07),
        p(koni(4), renk, -0.18, 0.1, 0.95, PI / 2, 0, 0.3, 0.22, 0.6, 0.06), p(koni(4), acik, 0, 0.12, 1.0, PI / 2, 0, 0, 0.22, 0.65, 0.06), p(koni(4), renk, 0.18, 0.1, 0.95, PI / 2, 0, -0.3, 0.22, 0.6, 0.06)]));
      const kanat = yon_ => {
        const k = new THREE.Group(); k.position.set(yon_ * 0.45, 0.12, -0.05);
        const m = ag([p(kure(12), renk, yon_ * 0.7, 0, 0.05, 0, 0, 0, 0.8, 0.09, 0.45), p(kure(10), acik, yon_ * 1.15, -0.02, 0.18, 0, yon_ * 0.3, 0, 0.45, 0.07, 0.3), p(kure(8), acik, yon_ * 1.45, -0.02, 0.28, 0, 0, 0, 0.25, 0.06, 0.2)]);
        k.add(m); g.add(k); return k;
      };
      g.userData.solK = kanat(-1); g.userData.sagK = kanat(1);
      return g;
    }
    const OBJ = {};
    function nesneAl(tur) {
      const h = havuzlar[tur] || (havuzlar[tur] = []); let m = h.pop();
      if (!m) { m = new THREE.Mesh(OBJ[tur], mPlastik); m.castShadow = true; dunya.add(m); }
      m.visible = true; return m;
    }
    function nesneEkle(tur, x, y, z, r) { const m = nesneAl(tur); m.position.set(x, y, z); m.rotation.set(0, Math.random() * 6, 0); nesneler.push({ m, tur, x, y, z, r, alindi: false }); }
    function birak(n) { n.m.visible = false; havuzlar[n.tur].push(n.m); }
    function dalga(z) {
      const zr = Z(), t = Math.random(), cx = (Math.random() - 0.5) * 30, cy = sinirla(by + (Math.random() - 0.5) * 12, 3, 40);
      if (t < 0.35) { for (let k = 0; k < 7; k++) O.elmasEkle(cx + Math.sin(k * 0.7) * 2, cy + Math.cos(k * 0.5), z + k * 2.6); }
      else if (t < 0.55) { nesneEkle("halka", cx, cy, z, 2.0); }
      else if (t < 0.7) { nesneEkle("ruzgar", cx, Math.max(3, cy - 2), z, 2.2); }
      else {
        const n = zr.kolay ? 1 : zr.zor ? 3 : 2;
        for (let k = 0; k < n; k++) nesneEkle(Math.random() < 0.5 ? "firtina" : "balon" + rast(3), (Math.random() - 0.5) * 34, sinirla(by + (Math.random() - 0.5) * 10, 3, 42), z - k * 6, 1.4);
        for (let k = 0; k < 4; k++) O.elmasEkle(cx, cy + k * 1.2, z + 8);
      }
    }
    const skor = () => Math.floor(mesafe / 2) + elmas * 10 + halka * 25;
    function sahne_(dt, oyun) {
      const zm = O.zaman();
      if (aktifKus) {
        aktifKus.position.set(0, by, 0);
        aktifKus.rotation.set(sinirla(-vy * 0.05, -0.5, 0.5), 0, -yon * 0.6);
        kanatT += dt * (cirp > 0 ? 18 : suzul ? 1.5 : 5);
        const kanat = cirp > 0 ? Math.sin(kanatT) * 0.9 : suzul ? 0.08 + Math.sin(kanatT) * 0.05 : -0.2 + Math.sin(kanatT) * 0.25;
        aktifKus.userData.solK.rotation.z = kanat; aktifKus.userData.sagK.rotation.z = -kanat;
        if (cirp > 0) cirp -= dt;
      }
      // ışık izi
      if (oyun && intro <= 0) {
        izT -= dt;
        if (izT <= 0) { izT = 0.035; izListe.push({ x: 0, y: by + 0.1, z: 0.9, t: 1 }); if (izListe.length > 40) izListe.shift(); }
      }
      const m4 = new THREE.Matrix4();
      for (let i = 0; i < 40; i++) {
        const q = izListe[i];
        if (q) { q.t -= dt * 1.4; q.z += hiz * dt * (oyun ? 1 : 0); q.x -= vx * dt * (oyun ? 1 : 0); const s = Math.max(0, q.t) * 0.22; iz.setMatrixAt(i, m4.makeScale(s, s, s).setPosition(q.x, q.y, q.z)); }
        else iz.setMatrixAt(i, m4.makeScale(0, 0, 0));
      }
      iz.instanceMatrix.needsUpdate = true;
      bulutDeniz.position.y = 0; for (const n of nesneler) if (n.tur === "halka" || n.tur === "ruzgar") n.m.rotation.y += dt * (n.tur === "ruzgar" ? 3 : 0.8);
      O.hPoz.set(-yon * 1.2, by + 2.0 + sinirla(vy, -8, 8) * 0.12, 6.0); O.hBak.set(0, by + 0.4 + sinirla(vy, -8, 8) * 0.2, -7);      // düşerken kamera önden takip eder
    }
    return {
      id: "kus", ad: "Kuş Uçuşu", elSerbest: true, elGerek: true, ipucu: "Kollarını çırp: yüksel. Kollar açık: süzül. Yana yatın: dön",
      ogretici: [
        { tr: "Kollarını kanat gibi aşağı çırp", a: Pz("yukari", { lu: -2.4, ru: 2.4, ll: -2.4, rl: 2.4 }), b: Pz("yanaAsagi"), efekt: "🐦⬆️", sonuc: "Kuş yükselir" },
        { tr: "Kollarını yana açık tut", a: Pz("yana"), b: Pz("yana", { y: 0.03 }), efekt: "🐦〰️", sonuc: "Kuş süzülerek yavaşça alçalır" },
        { tr: "Kollar açıkken sağa ya da sola yatın", a: Pz("yana", { egim: -0.3 }), b: Pz("yana", { egim: 0.3 }), efekt: "🐦↔️", sonuc: "Kuş o yöne döner" },
        { tr: "Elmas topla, halkalardan geç, fırtına bulutlarından kaç", a: Pz("yana"), b: Pz("yanaAsagi"), efekt: "💎⭕⛈️", sonuc: "" }
      ],
      kur() {
        grup = grupYap(); dunya = new THREE.Group(); grup.add(dunya);
        bulutDoku = O.dokuYap(256, 256, (c, w, h) => {      // yukarıdan görülen tarlalar, yollar, göletler
          const yesil = ["#7fd36b", "#9ce07e", "#6cc45e", "#b4e68a", "#f1dd7a", "#e9c66a", "#8fd98a"];
          for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { c.fillStyle = yesil[Math.floor(Math.random() * yesil.length)]; c.fillRect(x, y, 32, 32);
            if (Math.random() < 0.5) { c.strokeStyle = "rgba(0,0,0,.06)"; c.lineWidth = 2; for (let k = 4; k < 32; k += 6) { c.beginPath(); c.moveTo(x, y + k); c.lineTo(x + 32, y + k); c.stroke(); } } }
          c.strokeStyle = "#f5e3c0"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 96); c.bezierCurveTo(80, 70, 170, 130, 256, 100); c.stroke(); c.beginPath(); c.moveTo(150, 0); c.bezierCurveTo(130, 90, 190, 170, 160, 256); c.stroke();
          for (let i = 0; i < 3; i++) { c.fillStyle = "#4fc3f7"; c.beginPath(); c.ellipse(30 + i * 90, 190 - i * 60, 18, 11, i, 0, 7); c.fill(); }
          for (let i = 0; i < 70; i++) { const x = Math.random() * w, y = Math.random() * h; c.fillStyle = "rgba(40,120,50,.55)"; c.beginPath(); c.arc(x, y, 3 + Math.random() * 3, 0, 7); c.fill(); }
        }, 7, 7);
        // 3B süsler: ağaçlar, evler, değirmenler — kuşun altından akar
        const tGeo = agac(), eGeo = birlestir([p(yKutu(1.6, 1.2, 1.6, 0.06), R.beyaz, 0, 0.6, 0), p(koni(4), R.kirmizi, 0, 1.65, 0, 0, PI / 4, 0, 1.4, 0.9, 1.4), p(yKutu(0.4, 0.6, 0.05, 0.02), R.ahsap, 0, 0.3, 0.81)]),
          dGeo = birlestir([p(sil(10), R.beyaz, 0, 1.4, 0, 0, 0, 0, 0.5, 2.8, 0.5), p(koni(10), R.mavi, 0, 3.1, 0, 0, 0, 0, 0.6, 0.6, 0.6), ...[0, 1, 2, 3].map(i => p(yKutu(0.18, 1.5, 0.04, 0.02), R.sari, Math.sin(i * PI / 2) * 0.7, 2.6 + Math.cos(i * PI / 2) * 0.7, 0.55, 0, 0, i * PI / 2 + PI / 2))]);
        for (let i = 0; i < 70; i++) { const g = i % 9 === 0 ? dGeo : i % 4 === 0 ? eGeo : tGeo, m = new THREE.Mesh(g, mPlastik); m.castShadow = true; m.scale.setScalar((g === tGeo ? 1.3 + Math.random() * 0.8 : 1.1) * 2); /* çevre kuşa göre 2 kat büyük */ m.rotation.y = Math.random() * 6; dunya.add(m); manzara.push(m); }
        bulutDeniz = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshStandardMaterial({ map: bulutDoku, roughness: 1, metalness: 0, envMapIntensity: 0.3 }));
        bulutDeniz.rotation.x = -PI / 2; bulutDeniz.receiveShadow = true; grup.add(bulutDeniz);
        for (let i = 0; i < 6; i++) { const b_ = ag([p(kure(10), R.beyaz, 0, 0, 0, 0, 0, 0, 3, 1.2, 2), p(kure(10), R.beyaz, 2.2, 0.4, 0.3, 0, 0, 0, 2.2, 1, 1.6), p(kure(10), R.beyaz, -2.1, 0.2, -0.2, 0, 0, 0, 2, 0.9, 1.5)]); b_.position.set((Math.random() - 0.5) * 120, 24 + Math.random() * 20, -40 - i * 25); dunya.add(b_); manzara.push(b_); b_.userData.bulut = true; }
        OBJ.halka = birlestir([p(simit(2.0, 0.22, PI * 2, 36), R.sari, 0, 0, 0), p(simit(2.0, 0.08, PI * 2, 36), R.beyaz, 0, 0, 0.2)]);
        OBJ.ruzgar = birlestir([0, 1, 2, 3].map(i => p(simit(1.2 + i * 0.25, 0.08, PI * 1.4, 24), i % 2 ? 0x9df2c9 : 0xd8fff0, 0, i * 1.1, 0, PI / 2, 0, i)));
        OBJ.firtina = birlestir([p(kure(12), 0x5a6278, 0, 0, 0, 0, 0, 0, 1.2, 0.9, 1.1), p(kure(12), 0x6b738a, 0.9, 0.2, 0.2, 0, 0, 0, 0.9, 0.7, 0.8), p(kure(12), 0x4c546a, -0.9, 0.1, 0, 0, 0, 0, 0.9, 0.7, 0.8),
          p(koni(3), R.sari, 0.2, -1.2, 0.3, 0, 0, 0.3, 0.18, 0.8, 0.06), p(koni(3), R.sari, -0.4, -1.1, 0.2, 0, 0, -0.4, 0.15, 0.6, 0.05)]);
        for (let i = 0; i < 3; i++) OBJ["balon" + i] = birlestir([p(new THREE.SphereGeometry(1, 12, 10), [R.kirmizi, R.mor, R.turuncu][i], 0, 0, 0, 0, 0, 0, 0.7, 0.85, 0.7), p(new THREE.SphereGeometry(1, 12, 10), [R.sari, R.mavi, R.pembe][i], 0.8, 0.3, 0, 0, 0, 0, 0.6, 0.72, 0.6), p(sil(4), R.beyaz, 0.3, -1.3, 0, 0, 0, 0.1, 0.02, 1.2, 0.02)]);
        kusG.kiz = kusYap(0xff7eb6, 0xffd1e6); kusG.erkek = kusYap(0x4aa3ff, 0xcfe8ff);
        grup.add(kusG.kiz, kusG.erkek);
        ada = ag([p(kure(14), R.beyaz, 0, -0.4, 0, 0, 0, 0, 2.2, 0.7, 1.8), p(kure(12), 0xf3f8ff, 1.2, -0.2, 0.4, 0, 0, 0, 1.1, 0.6, 1.0), p(kure(12), 0xf3f8ff, -1.1, -0.25, -0.3, 0, 0, 0, 1.2, 0.6, 1.0)]);
        grup.add(ada);
        iz = new THREE.InstancedMesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.85 }), 40);
        iz.frustumCulled = false; grup.add(iz);
      },
      ac() {
        grup.visible = true; O.zeminGoster(false);
        for (const n of nesneler) birak(n); nesneler = []; O.elmasListe().length = 0; izListe = [];
        for (const m of manzara) { m.position.x = (Math.random() - 0.5) * 120; m.position.z = 14 - Math.random() * 170; if (Math.abs(m.position.x) < 12 && m.position.z > -30) m.position.x += m.position.x < 0 ? -14 : 14; if (!m.userData.bulut) m.position.y = 0; }
        O.kamHiz(10); by = 13; vy = 0; /* ağaçların üstünden başlar */ vx = 0; yon = 0; hedefYon = 0; hiz = 13 * Z().hiz; sure = 0; mesafe = 0; can = Z().kolay ? 5 : 3; dokunulmaz = 0; elmas = 0; halka = 0; intro = 1.6; sonraki = 0; kanatT = 0; cirp = 0; suzul = true; izT = 0;
        const tip = O.karakter().tip; aktifKus = kusG[tip];
        kusG.kiz.visible = kusG.erkek.visible = false;
        const renk = new THREE.Color(tip === "kiz" ? 0xff8fc8 : 0x7fd0ff), renk2 = new THREE.Color(tip === "kiz" ? 0xffe17a : 0xffffff);
        for (let i = 0; i < 40; i++) iz.setColorAt(i, i % 2 ? renk : renk2); iz.instanceColor.needsUpdate = true;
        const k = O.karakter(); O.karakterTak(k, grup, 0, by - 0.3, 0, 1, 0); ada.position.set(0, by - 0.25, 0); ada.visible = true;
        O.durusSifir(D); dalga(-60); dalga(-95);
        O.solYaz("0"); O.sagYaz(kalp(can)); O.fov(62); sahne_(0.001, false);
      },
      kapat() { grup.visible = false; O.zeminGoster(true); for (const n of nesneler) birak(n); nesneler = []; O.elmasListe().length = 0; },
      bekle(dt) { sahne_(dt, false); },
      guncelle(dt) {
        const zr = Z();
        if (intro > 0) {      // dönüşüm: oyuncak zıplar, döner, ışıltıyla kuşa dönüşür
          intro -= dt; const k = O.karakter();
          if (intro > 0.4) { k.kok.position.y = by - 0.3 + Math.abs(Math.sin((1.6 - intro) * 7)) * 0.5; k.kok.rotation.y += dt * (1.6 - intro) * 12; D.lKolZ = -2.6; D.rKolZ = 2.6; }
          else if (k.kok.visible) {
            k.kok.visible = false; aktifKus.visible = true; ada.visible = false;
            O.parAt(0, by, 0, 26, aktifKus === kusG.kiz ? 0xff8fc8 : 0x7fd0ff, 6, 0.16); O.parAt(0, by, 0, 14, 0xffe17a, 5, 0.12); O.cal("elmas", 0.8, 1.4);
          }
          sahne_(dt, true); return 0;
        }
        sure += dt;
        const zor = Math.min(1, sure * zr.rampa / 420); hiz = (13 + 9 * zor) * zr.hiz;
        if (!O.kameraKontrol()) {      // klavye/dokunma: boşluk/yukarı çırp, sağ-sol dön, varsayılan süzül
          hedefYon = (O.tus.ArrowRight ? 1 : 0) - (O.tus.ArrowLeft ? 1 : 0); if (O.isaretci.basili) hedefYon = sinirla((O.isaretci.x - 0.5) * 3, -1, 1);
          suzul = true;
        }
        yon += (hedefYon - yon) * us(dt, 5);
        vx = yon * 13;
        const g = suzul ? 3.2 : 11;
        vy -= g * dt; if (suzul) vy = Math.max(vy, -2.6); vy = Math.min(vy, 10);
        by += vy * dt;
        if (by < ALT_SINIR) {      // ağaçların üstünde yere çarpma
          by = ALT_SINIR;
          if (zr.kolay) vy = Math.max(vy, 4);
          else if (dokunulmaz <= 0) { can--; dokunulmaz = 1.5; vy = 9; O.cal("carp"); O.flas(); O.sagYaz(kalp(can)); if (can <= 0) { O.cal("kaybet"); O.bitir(skor(), { baslik: "Yere düştün!", satir: "💎 " + elmas }); return 0; } }
          else vy = Math.max(vy, 6);
        }
        if (by > 60) { by = 60; vy = Math.min(vy, 0); }
        if (dokunulmaz > 0) dokunulmaz -= dt;
        const adim = hiz * dt; mesafe += adim;
        if (mesafe >= sonraki) { dalga(-110); sonraki = mesafe + hiz * (2.2 - zor * 0.8) / zr.yogun; }
        for (let i = nesneler.length - 1; i >= 0; i--) {
          const n = nesneler[i]; n.z += adim; n.x -= vx * dt; n.m.position.set(n.x, n.y, n.z);
          const dx = n.x, dy = n.y - by, dz = n.z;
          if (!n.alindi && Math.abs(dz) < 1.2) {
            if (n.tur === "halka") { if (Math.hypot(dx, dy) < 1.9) { n.alindi = true; halka++; vy += 3; O.cal("elmas", 0.8, 1.5); O.parAt(n.x, n.y, n.z, 16, 0xffe066, 5, 0.13); } }
            else if (n.tur === "ruzgar") { if (Math.abs(dx) < 2.2 && dy < 1 && dy > -6) { vy = Math.max(vy, 9); n.alindi = true; O.cal("zipla", 0.5, 1.3); } }
            else if (dokunulmaz <= 0 && Math.hypot(dx, dy) < n.r + 0.5) {
              n.alindi = true; can--; dokunulmaz = 1.5; O.cal("carp"); O.cal("vur", 0.7); O.flas(); O.sarsinti(0.35); O.parAt(n.x, n.y, n.z, 14, 0xcfd6e6, 5, 0.13); O.sagYaz(kalp(can)); n.m.visible = false;
              if (can <= 0) { O.cal("kaybet"); O.bitir(skor(), { baslik: "Yere düştün!", satir: "💎 " + elmas }); return 0; }
            }
          }
          if (n.z > 14 || Math.abs(n.x) > 80) { birak(n); nesneler[i] = nesneler[nesneler.length - 1]; nesneler.pop(); }
        }
        const l = O.elmasListe();
        for (let i = l.length - 1; i >= 0; i--) {
          const e = l[i]; e.z += adim; e.x -= vx * dt;
          if (Math.abs(e.z) < 1.2 && Math.hypot(e.x, e.y - by) < 1.3) { elmas++; O.cal("elmas", 0.6, 1 + Math.random() * 0.2); O.parAt(e.x, e.y, e.z, 5, 0x9defff, 3, 0.09); l[i] = l[l.length - 1]; l.pop(); }
          else if (e.z > 10 || Math.abs(e.x) > 80) { l[i] = l[l.length - 1]; l.pop(); }
        }
        for (const m of manzara) {      // ağaca / eve / değirmene çarpma
          if (m.userData.bulut || dokunulmaz > 0 || Math.abs(m.position.z) > 1.2) continue;
          if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
          const bb = m.geometry.boundingBox, sc = m.scale.x;
          if (Math.abs(m.position.x) < Math.max(bb.max.x, bb.max.z) * sc * 0.75 + 0.4 && by < bb.max.y * sc + 0.2) {
            can--; dokunulmaz = 1.5; vy = 9; O.cal("carp"); O.flas(); O.sarsinti(0.3); O.durumYaz("🌳 " + T("Ağaca çarptın!")); O.sagYaz(kalp(can));
            if (can <= 0) { O.cal("kaybet"); O.bitir(skor(), { baslik: "Ağaca çarptın!", satir: Math.floor(mesafe) + " m" }); return 0; }
          }
        }
        for (const m of manzara) { m.position.z += adim; m.position.x -= vx * dt; if (m.position.z > 16) { m.position.z -= 175; m.position.x = (Math.random() - 0.5) * 120; } if (m.position.x > 65) m.position.x -= 130; else if (m.position.x < -65) m.position.x += 130; }
        bulutDoku.offset.y = (bulutDoku.offset.y + adim / 50) % 1; bulutDoku.offset.x = (bulutDoku.offset.x + vx * dt / 50) % 1;
        aktifKus.visible = dokunulmaz <= 0 || Math.floor(O.zaman() * 12) % 2 === 0;
        sahne_(dt, true);
        O.solYaz(String(skor())); O.fov(62 + zor * 6);
        return 0;
      },
      tus(k) { if (k === " " || k === "ArrowUp") { vy = Math.min(vy + 7, 10); cirp = 0.35; O.cal("zipla", 0.35, 1.4); } },
      dokun(x, y) { if (y < 0.5) { vy = Math.min(vy + 7, 10); cirp = 0.35; } },
      poz(P, dt) {
        izle(L, P.sol.x, P.sol.y, P.tgen, P.oran, dt); izle(Rr, P.sag.x, P.sag.y, P.tgen, P.oran, dt);
        const esik = 2.6 / O.has(), ikisi = P.sol.g > 0.35 && P.sag.g > 0.35;
        // Çırpma: iki bilek birlikte hızla aşağı iner (tek çırpma = tek itiş)
        if (ikisi && cirpHazir && Math.min(L.vy, Rr.vy) > esik) { cirpHazir = false; vy = Math.min(Math.max(vy, 0) + 6.5, 10); cirp = 0.35; O.cal("zipla", 0.3, 1.4); }
        else if (!cirpHazir && Math.max(L.vy, Rr.vy) < esik * 0.3) cirpHazir = true;
        // Süzülme: iki kol yana açık (bilekler omuz hizasına yakın ve gövdeden uzak)
        const acik = w => w.g > 0.35 && Math.abs(w.x - w.sx) > P.tgen * 0.9 && w.y < w.sy + P.tgovde * 0.45;
        suzul = ikisi && acik(P.sol) && acik(P.sag);
        // Yön: omuzların eğimi (yatış) + gövdenin yana kayması
        const egim = Math.atan2(P.sag.sy - P.sol.sy, (P.sag.sx - P.sol.sx) * P.oran), kayma = (P.ox - P.tx) / P.tgen;
        hedefYon = egri(egim / 0.4 + kayma * 0.35, 0.1, 1.3);
      },
      onizle() { this.ac(); intro = 0; O.karakter().kok.visible = false; ada.visible = false; aktifKus.visible = true; by = 7; yon = 0.35; cirp = 0.2; kanatT = 1.2;
        for (let i = 0; i < 18; i++) izListe.push({ x: 0.15 * i, y: 7.1 - i * 0.05, z: 0.9 + i * 0.45, t: 1 - i / 20 });
        nesneEkle("halka", -3, 8.5, -16, 2); for (let k = 0; k < 6; k++) O.elmasEkle(2.5, 7.2, -5 - k * 2.4); nesneEkle("balon1", 6, 9, -22, 1.4); sahne_(0.001, false); }
    };
  }

  // ===================================================================================================
  //  2. UZAK VURUŞ — yandan dur, bacağını geri al ve topa savur. Top seke seke uzaklara gider (yandan görünüm)
  // ===================================================================================================
  function vurus() {
    let grup, zeminM, zeminDk, top, isaretler = [], trambolinler = [], balonlar = [], durum_, bx, byy, bvx, bvy, atis, toplam, elmas, sarj, sarjT, enUzak, tekmeT, ayak = { sol: izci(), sag: izci() };
    let geriHazir = false, tetikHazir = true, geriYon = 0, geriT = 0, ezT = 0, yanT = 0, agaclar;
    const TOP_R = 0.32, ATIS = 5;
    function sayiDoku(n) {
      const c = document.createElement("canvas"); c.width = 128; c.height = 64; const x = c.getContext("2d");
      x.fillStyle = "#ffffff"; x.beginPath(); x.roundRect ? x.roundRect(4, 4, 120, 56, 14) : x.rect(4, 4, 120, 56); x.fill();
      x.fillStyle = "#4a2a6b"; x.font = "bold 38px system-ui, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(n + "m", 64, 34);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    }
    const sayiCache = {};
    function isaretGuncelle(camX) {
      const bas = Math.floor((camX - 30) / 25) * 25;
      for (let i = 0; i < isaretler.length; i++) {
        const m = isaretler[i], d = bas + i * 25; if (d < 25) { m.visible = false; continue; }
        m.visible = true; m.position.set(d, 1.4, -2.2);
        if (m.userData.d !== d) { m.userData.d = d; m.material.map = sayiCache[d] || (sayiCache[d] = sayiDoku(d)); m.material.needsUpdate = true; }
      }
    }
    function yeniAtis() {
      durum_ = "hazir"; bx = 0.95; byy = TOP_R; bvx = 0; bvy = 0; sarj = 0; tekmeT = 0; geriHazir = false; tetikHazir = true; geriYon = 0; geriT = 0; ezT = 0; yanT = 0;
      top.position.set(bx, byy, 0);
      // yol boyunca trambolin, balon ve elmaslar
      trambolinler.forEach((m, i) => { m.position.set(30 + i * 34 + Math.random() * 14, 0, 0); });
      balonlar.forEach((m, i) => { m.visible = true; m.position.set(45 + i * 40 + Math.random() * 20, 3 + Math.random() * 6, 0); });
      O.elmasListe().length = 0;
      for (let i = 0; i < 12; i++) { const x = 20 + i * 18 + Math.random() * 8; O.elmasEkle(x, 1 + Math.random() * 6, 0); }
      O.durumYaz(T("Atış") + " " + (atis + 1) + "/" + ATIS);
    }
    function vur(guc) {
      if (durum_ !== "hazir") return;
      const zr = Z(), carpan = zr.kolay ? 1.6 : zr.zor ? 1.0 : 1.25;
      const v = (12 + 26 * guc) * carpan, aci = (34 + Math.random() * 6) * PI / 180;
      bvx = v * Math.cos(aci); bvy = v * Math.sin(aci); durum_ = "ucus"; tekmeT = 0.45; ezT = 0.18; geriHazir = false;
      O.cal("vur", 1, 0.9 + guc * 0.3); O.cal("kir", 0.4, 1.6); O.sarsinti(0.12 + guc * 0.25); O.flas && guc > 0.8 && O.flas();
      O.parAt(bx, byy, 0, 10 + Math.round(guc * 16), 0xffffff, 4 + guc * 4, 0.12); O.parAt(bx, byy, 0, 8, 0xffe066, 5, 0.1);
      O.durumYaz(guc > 0.8 ? "💥 " + T("Süper vuruş!") : guc > 0.5 ? "⚽ " + T("Güzel!") : "⚽");
    }
    function sahne_(dt) {
      const k = O.karakter();
      O.durusSifir(D);
      if (tekmeT > 0) { tekmeT -= dt; const f = 1 - tekmeT / 0.45, s_ = Math.min(1, f * 3); D.rUst = -1.1 + 2.9 * s_ - Math.max(0, f - 0.6) * 1.2; D.rAlt = -0.9 * (1 - s_); D.lKolZ = -1.2; D.rKolZ = 0.9; D.lKolX = 0.6; D.govdeX = -0.25 * s_; D.lAlt = -0.25; }      // tam savuruş + takip
      else if (durum_ === "hazir") { const g_ = geriHazir ? 1 : sarj; D.rUst = -1.1 * g_; D.rAlt = -1.1 * g_; D.govdeX = 0.15 * g_; D.lKolZ = -0.35 - 0.5 * g_; D.rKolZ = 0.35 + 0.4 * g_; D.kalcaY = Math.sin(O.zaman() * 3) * 0.01; }
      if (ezT > 0) { ezT -= dt; const e = ezT / 0.18; top.scale.set(1 - 0.35 * e, 1 + 0.25 * e, 1 + 0.25 * e); } else top.scale.set(1, 1, 1);
      k.kok.position.set(0, 0, 0);
      top.position.set(bx, byy, 0); top.rotation.z -= bvx * dt / TOP_R;
      for (const m of trambolinler) m.children && null;
      const camX = Math.max(3, bx + 2);
      O.hPoz.set(camX, Math.max(2.6, byy * 0.55 + 2.3), 13); O.hBak.set(camX + 3, Math.max(1, byy * 0.5 + 0.8), 0);
      zeminM.position.x = Math.floor(camX / 40) * 40; zeminDk.offset.x = 0;
      isaretGuncelle(camX);
    }
    return {
      id: "vurus", ad: "Uzak Vuruş", elSerbest: true, elGerek: false, ayakGerek: true, ipucu: "Kameraya yan dur. Bacağını iyice geri al, sonra hızla öne savur",
      ogretici: [
        { tr: "Kameraya yan dur, telefon uzakta olsun (bütün vücudun görünsün)", a: Pz("duz", { yan: true }), b: Pz("duz", { yan: true }), efekt: "📱↔️🧍", sonuc: "" },
        { tr: "Bacağını geri al", a: Pz("duz", { yan: true, bacak: 0 }), b: Pz("duz", { yan: true, bacak: -0.9 }), efekt: "🦵", sonuc: "" },
        { tr: "Hızla öne savur: ne kadar hızlı, o kadar uzak", a: Pz("duz", { yan: true, bacak: -0.9 }), b: Pz("duz", { yan: true, bacak: 1.3 }), efekt: "⚽💨", sonuc: "Top uçar, seke seke gider" },
        { tr: "5 atışın toplam mesafesi skorun", a: Pz("yukari"), b: Pz("duz"), efekt: "🏆", sonuc: "" }
      ],
      kur() {
        grup = grupYap();
        zeminDk = cimDoku(); zeminDk.repeat.set(10, 2);
        zeminM = new THREE.Mesh(new THREE.PlaneGeometry(400, 40), new THREE.MeshStandardMaterial({ map: zeminDk, roughness: 0.95, metalness: 0 }));
        zeminM.rotation.x = -PI / 2; zeminM.receiveShadow = true; grup.add(zeminM);
        top = new THREE.Mesh(topGeo(TOP_R), mPlastik); top.castShadow = true; grup.add(top);
        for (let i = 0; i < 6; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ depthWrite: false })); m.scale.set(2.2, 1.1, 1); m.userData.d = -1; grup.add(m); isaretler.push(m); }
        const trGeo = birlestir([p(sil(20), R.mavi, 0, 0.35, 0, 0, 0, 0, 1.3, 0.1, 1.3), p(simit(1.3, 0.12, PI * 2, 24), R.kirmizi, 0, 0.4, 0, PI / 2, 0, 0), ...[0, 1, 2, 3].map(i => p(sil(6), R.gri, Math.cos(i * PI / 2) * 1.1, 0.18, Math.sin(i * PI / 2) * 1.1, 0, 0, 0, 0.06, 0.36, 0.06))]);
        for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(trGeo, mPlastik); m.castShadow = true; grup.add(m); trambolinler.push(m); }
        for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(balonGeo(CANLI[i]), mPlastik); m.castShadow = true; grup.add(m); balonlar.push(m); }
        // arka plan: kale, çit
        grup.add(ag([...Array.from({ length: 40 }, (_, i) => p(yKutu(0.14, 0.9, 0.14, 0.03), R.beyaz, -20 + i * 10, 0.45, -6)), p(yKutu(400, 0.1, 0.1, 0.02), R.beyaz, 180, 0.8, -6)], false));
        agaclar = new THREE.InstancedMesh(agac(), mPlastik, 90); agaclar.castShadow = true;
        const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler();
        for (let i = 0; i < 90; i++) { const sc = 1.2 + Math.random() * 1.2; e3.set(0, Math.random() * 6, 0); q.setFromEuler(e3); m4.compose(new THREE.Vector3(-20 + i * 7 + Math.random() * 4, 0, -9 - Math.random() * 8), q, new THREE.Vector3(sc, sc, sc)); agaclar.setMatrixAt(i, m4); }
        grup.add(agaclar);
        const cl = []; for (let i = 0; i < 30; i++) { const x = -10 + i * 20, c = CANLI[i % 8]; cl.push(p(kure(8), 0x4cc06a, x, 0.35, -4.5, 0, 0, 0, 0.8, 0.45, 0.5), p(kure(6), c, x + 0.4, 0.6, -4.2, 0, 0, 0, 0.12), p(kure(6), CANLI[(i + 3) % 8], x - 0.3, 0.55, -4.1, 0, 0, 0, 0.12)); }
        grup.add(ag(cl, false));
      },
      ac() {
        grup.visible = true; O.zeminGoster(false);
        const k = O.karakter(); O.karakterTak(k, grup, 0, 0, 0, 1, -PI / 2);
        atis = 0; toplam = 0; elmas = 0; enUzak = 0; yeniAtis();
        O.solYaz("0"); O.sagYaz("⚽ 1/" + ATIS); O.fov(50); sahne_(0.001);
      },
      kapat() { grup.visible = false; O.zeminGoster(true); O.elmasListe().length = 0; },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        if (durum_ === "hazir" && !O.kameraKontrol()) {       // klavye: boşluğu basılı tut, bırakınca vur
          const bas = O.tus[" "] || O.tus.ArrowUp || O.isaretci.basili;
          if (bas) sarj = Math.min(1, sarj + dt / 1.1); else if (sarj > 0) { vur(sarj); sarj = 0; }
        }
        if (durum_ === "ucus") {
          bvy -= 14 * dt; bx += bvx * dt; byy += bvy * dt; if (yanT > 0) yanT -= dt;
          if (yanT <= 0 && byy < 1.15 && byy > TOP_R + 0.05) {      // trambolinin yanına çarparsa da sektirir
            const tr = trambolinler.find(m => Math.abs(m.position.x - bx) < 1.6);
            if (tr) { yanT = 0.5; bvy = Math.max(Math.abs(bvy), 9); bvx = Math.max(bvx, 6) * 1.05; O.cal("zipla", 0.8, 1.3); O.parAt(bx, 0.6, 0, 10, 0x9defff, 4, 0.12); }
          }
          if (byy <= TOP_R) {
            byy = TOP_R;
            const tr = trambolinler.find(m => Math.abs(m.position.x - bx) < 1.4);
            if (tr && bvy < -2) { bvy = Math.max(-bvy * 1.05, 11); bvx *= 1.05; O.cal("zipla", 0.8, 1.2); O.parAt(bx, 0.5, 0, 10, 0x9defff, 4, 0.12); }
            else if (bvy < -1.5) { bvy = -bvy * 0.5; bvx *= 0.82; O.cal("adim1", 0.4); }
            else { bvy = 0; bvx *= Math.exp(-dt * 1.6); }
          }
          for (const b of balonlar) if (b.visible && Math.hypot(b.position.x - bx, b.position.y - byy) < 0.9) { b.visible = false; bvx += 4; bvy = Math.max(bvy, 0) + 5; O.cal("kir", 0.7, 1.3); O.parAt(b.position.x, b.position.y, 0, 14, 0xff6fa0, 5, 0.13); }
          const l = O.elmasListe();
          for (let i = l.length - 1; i >= 0; i--) if (Math.hypot(l[i].x - bx, l[i].y - byy) < 1.0) { elmas++; O.cal("elmas", 0.6); O.parAt(l[i].x, l[i].y, 0, 5, 0x9defff, 3, 0.09); l[i] = l[l.length - 1]; l.pop(); }
          if (byy <= TOP_R + 0.01 && Math.abs(bvx) < 0.6) {
            const m = Math.round(bx); toplam += m; enUzak = Math.max(enUzak, m); atis++; durum_ = "bitti";
            O.durumYaz(m + " m!"); O.cal("elmas", 0.8, 1.2);
            setTimeout(() => {
              if (!grup.visible) return;
              if (atis >= ATIS) { O.cal("kaybet", 0.6); O.bitir(toplam + elmas * 10, { baslik: "Vuruşlar bitti!", satir: T("En uzak") + ": " + enUzak + " m" }); }
              else { yeniAtis(); O.sagYaz("⚽ " + (atis + 1) + "/" + ATIS); }
            }, 1500);
          }
          O.solYaz(String(toplam + Math.round(Math.max(0, bx)) + elmas * 10));
        }
        sahne_(dt);
        return 0;
      },
      poz(P, dt) {
        if (durum_ !== "hazir") return;
        // Tam vuruş şart: önce ayak kalçanın bir yanına geri gider (geri alma), sonra hızla diğer yana savrulur
        let enIyi = null, enD = 0;
        for (const [ad, a] of [["sol", P.ayakSol], ["sag", P.ayakSag]]) {
          if (a.g < 0.35) continue; izle(ayak[ad], a.x, a.y, P.tgen, P.oran, dt);
          const d = (a.x - P.kalcaX) * P.oran / P.tgen; if (Math.abs(d) > Math.abs(enD)) { enD = d; enIyi = ad; }
        }
        if (!enIyi) return;
        const h = O.has(), geriEsik = 0.55 / h, ileriEsik = 0.35 / h, hizEsik = 4 / h, v = ayak[enIyi].vx * P.oran;
        if (geriT > 0) geriT -= dt;
        if (Math.abs(enD) > geriEsik && (!geriHazir || Math.sign(enD) === geriYon)) { geriHazir = true; geriYon = Math.sign(enD); geriT = 0.9; sarj = 1; }      // geri alındı
        else if (geriHazir && geriT <= 0) { geriHazir = false; sarj = 0; }
        if (geriHazir && Math.sign(enD) === -geriYon && Math.abs(enD) > ileriEsik && Math.abs(v) > hizEsik && Math.sign(v) === -geriYon) {
          vur(sinirla((Math.abs(v) - hizEsik * 0.5) / (hizEsik * 2.2), 0.2, 1));
        }
      },
      onizle() { this.ac(); durum_ = "ucus"; bx = 9; byy = 3.2; tekmeT = 0.12; sahne_(0.001); O.hPoz.set(5, 2.8, 12); O.hBak.set(7, 1.6, 0); }
    };
  }

  // ===================================================================================================
  //  3. ŞEKİL DUVARI — üstünde poz şeklinde delik olan duvar gelir; o pozu al ve delikten geç
  // ===================================================================================================
  function duvar() {
    const POZLAR = [
      { ad: "Eller yukarı", L: [-2.95, -2.95], R: [2.95, 2.95] }, { ad: "Kollar yana", L: [-1.57, -1.57], R: [1.57, 1.57] }, { ad: "V yap", L: [-2.3, -2.3], R: [2.3, 2.3] },
      { ad: "Sol yukarı, sağ yana", L: [-2.95, -2.95], R: [1.57, 1.57] }, { ad: "Sağ yukarı, sol yana", L: [-1.57, -1.57], R: [2.95, 2.95] },
      { ad: "Pazı göster", L: [-1.57, -3.07], R: [1.57, 3.07] }, { ad: "Disko sol", L: [-2.3, -2.3], R: [0.7, 0.7] }, { ad: "Disko sağ", L: [-0.7, -0.7], R: [2.3, 2.3] },
      { ad: "Sol el yukarı", L: [-2.95, -2.95], R: [0.15, 0.15] }, { ad: "Sağ el yukarı", L: [-0.15, -0.15], R: [2.95, 2.95] },
      { ad: "Kaktüs", L: [-1.57, -3.0], R: [1.57, 3.0] }, { ad: "Uçak", L: [-1.15, -1.15], R: [2.0, 2.0] }, { ad: "Eller belde", L: [-0.8, 0.9], R: [0.8, -0.9] },
      { ad: "Selam", L: [-1.57, -3.0], R: [0.15, 0.15] }, { ad: "Yarım kaktüs", L: [-0.15, -0.15], R: [1.57, 3.0] }, { ad: "Şimşek", L: [-2.6, -1.0], R: [0.9, 2.4] }];
    const OLCEK_D = 1.15;
    let grup, duvarM, arkaM, duvarC, duvarCtx, duvarDk, dz, hiz, hedef, sonIdx = -1, can, skor, seri, sure, gecti, carpT, sonraT, tusla;
    const oy = { a: 0, ab: 0 }, oyR = { a: 0, ab: 0 }, kL = { a: -0.15, ab: -0.15 }, kR = { a: 0.15, ab: 0.15 }, var_ = { v: false };
    function duvarCiz(pz) {
      const c = duvarCtx, w = duvarC.width, h = duvarC.height;
      c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, w, h);
      const renkler = ["#ff5fa2", "#ffd23f", "#2ec4b6", "#8f5bff", "#ff8a2a", "#3a86ff"];
      for (let y = 0; y < 6; y++) for (let x = 0; x < 9; x++) {
        const bx = x * 64 + (y % 2 ? 32 : 0) - 32, byy = y * 64;
        c.fillStyle = renkler[(x + y * 3) % 6]; c.fillRect(bx + 2, byy + 2, 60, 60);
        c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(bx + 6, byy + 6, 52, 8);
      }
      // Delik: oyuncağın gerçek boyunda (dünya ölçüsünde) silüet. Duvar 6,8 x 5,1 birim, alt kenarı yerde.
      const S = OLCEK_D, X = x => (x + 3.4) / 6.8 * w, Y = y => (5.1 - y) / 5.1 * h, U = u => u / 6.8 * w;
      c.globalCompositeOperation = "destination-out"; c.lineCap = "round"; c.lineJoin = "round"; c.strokeStyle = "#000"; c.fillStyle = "#000";
      const omuzY = 1.31 * S, kalcaY = 0.84 * S;
      c.beginPath(); c.arc(X(0), Y(1.98 * S), U(0.46 * S), 0, 7); c.fill();                                   // kafa + saç
      c.lineWidth = U(0.72 * S); c.beginPath(); c.moveTo(X(0), Y(omuzY)); c.lineTo(X(0), Y(kalcaY - 0.1)); c.stroke();      // gövde
      c.beginPath(); c.moveTo(X(-0.5 * S), Y(kalcaY + 0.05)); c.lineTo(X(0.5 * S), Y(kalcaY + 0.05)); c.lineTo(X(0.42 * S), Y(0)); c.lineTo(X(-0.42 * S), Y(0)); c.closePath(); c.fill();      // bacaklar / etek
      c.lineWidth = U(0.26 * S);
      for (const [yon, ac] of [[-1, pz.L], [1, pz.R]]) {      // kollar gövdeden ve kafadan ayrık, ayrı yarık olarak çizilir (net görünür)
        const x0 = yon * 0.8 * S, y0 = omuzY + 0.05 * S, x1 = x0 + Math.sin(ac[0]) * 0.3 * S, y1 = y0 - Math.cos(ac[0]) * 0.3 * S, x2 = x1 + Math.sin(ac[1]) * 0.3 * S, y2 = y1 - Math.cos(ac[1]) * 0.3 * S;
        c.beginPath(); c.moveTo(X(x0), Y(y0)); c.lineTo(X(x1), Y(y1)); c.lineTo(X(x2), Y(y2)); c.stroke(); c.beginPath(); c.arc(X(x2), Y(y2), U(0.17 * S), 0, 7); c.fill();
      }
      c.globalCompositeOperation = "source-over"; duvarDk.needsUpdate = true;
    }
    function yeniDuvar() {
      let i; do { i = rast(POZLAR.length); } while (i === sonIdx); sonIdx = i; hedef = POZLAR[i];
      duvarCiz(hedef); dz = -48; gecti = false; tusla = false; duvarM.visible = arkaM.visible = true; duvarM.rotation.set(0, 0, 0); duvarM.position.y = 2.6;
      O.durumYaz(hedef.ad);
    }
    function hata() {
      if (!var_.v) return 9;
      let e = 0;
      e += Math.abs(sar(oy.a - hedef.L[0])) + Math.abs(sar(oy.ab - hedef.L[1])) + Math.abs(sar(oyR.a - hedef.R[0])) + Math.abs(sar(oyR.ab - hedef.R[1]));
      return e / 4;
    }
    function sahne_(dt) {
      const k = us(dt, 12); kolYumusat(kL, var_.v ? oy : { a: -0.15, ab: -0.15 }, k); kolYumusat(kR, var_.v ? oyR : { a: 0.15, ab: 0.15 }, k);
      O.durusSifir(D); kolYaz(D, kL, kR, false);
      if (carpT > 0) { carpT -= dt; D.govdeX = 0.6 * Math.min(1, carpT * 3); }
      duvarM.position.z = dz; arkaM.position.z = dz - 0.35;
      O.hPoz.set(0, 3.0, 6.4); O.hBak.set(0, 1.9, -8);
    }
    return {
      id: "duvar", ad: "Şekil Duvarı", elSerbest: true, elGerek: true, ipucu: "Duvardaki deliğin şeklini al, delikten geç!",
      ogretici: [
        { tr: "Duvarda bir poz şeklinde delik var", a: Pz("yana"), b: Pz("yana"), efekt: "🧱", sonuc: "Duvar sana doğru gelir" },
        { tr: "Duvar gelmeden aynı pozu al", a: Pz("duz"), b: Pz("yukari"), efekt: "🙆", sonuc: "Oyuncağın senin gibi durur" },
        { tr: "Poz tutarsa delikten geçersin, tutmazsa duvara çarparsın", a: Pz("yana"), b: Pz("yana"), efekt: "✅💥", sonuc: "" }
      ],
      kur() {
        grup = grupYap();
        duvarC = document.createElement("canvas"); duvarC.width = 512; duvarC.height = 384; duvarCtx = duvarC.getContext("2d");
        duvarDk = new THREE.CanvasTexture(duvarC); duvarDk.colorSpace = THREE.SRGBColorSpace; duvarDk.wrapS = duvarDk.wrapT = THREE.ClampToEdgeWrapping;
        duvarM = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 5.1), new THREE.MeshStandardMaterial({ map: duvarDk, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0 }));
        duvarM.castShadow = true; duvarM.position.y = 2.55; grup.add(duvarM);
        arkaM = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 5.1), new THREE.MeshStandardMaterial({ map: duvarDk, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, color: 0x9a8fb0, roughness: 0.8 }));
        arkaM.position.y = 2.55; grup.add(arkaM);
        const l = []; for (const x of [-3.6, 3.6]) { kupEkle(l, 0.9, 0, x < 0 ? R.kirmizi : R.mavi, R.krem, 0.2, x, -2); kupEkle(l, 0.8, 0.9, x < 0 ? R.sari : R.yesil, R.krem, -0.3, x, -2); }
        grup.add(ag(l));
      },
      ac() {
        grup.visible = true; O.susGoster(true); O.karakterTak(O.karakter(), grup, 0, 0, 0, OLCEK_D, 0);
        can = Z().kolay ? 5 : 3; skor = 0; seri = 0; sure = 0; carpT = 0; sonraT = 0; var_.v = false; hiz = 9 * Z().hiz; yeniDuvar();
        O.solYaz("0"); O.sagYaz(kalp(can)); O.fov(56); sahne_(0.001);
      },
      kapat() { grup.visible = false; O.susGoster(false); },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        const zr = Z(); sure += dt; hiz = (9 + Math.min(1, sure * zr.rampa / 300) * 7) * zr.hiz;
        if (sonraT > 0) { sonraT -= dt; if (sonraT <= 0) yeniDuvar(); sahne_(dt); return 0; }
        dz += hiz * dt;
        if (!gecti && dz >= -0.3) {
          gecti = true;
          const tol = (zr.kolay ? 0.8 : zr.zor ? 0.45 : 0.58) * sinirla(O.has(), 0.6, 1.8);      // pozlar daha şekilli istenir
          const iyi = O.kameraKontrol() ? hata() < tol : tusla;
          if (iyi) { seri++; skor += 20 + Math.min(seri, 10) * 3; O.cal("elmas", 0.8, 1.3); O.parAt(0, 2.5, 0.3, 20, 0xffe066, 6, 0.13); O.durumYaz("⭐ Harika!"); }
          else { can--; seri = 0; carpT = 0.5; O.cal("carp"); O.cal("vur", 0.8); O.flas(); O.sarsinti(0.4); O.parAt(0, 2, 0.3, 24, 0xff8fb3, 7, 0.15); O.durumYaz("Kaçtı!"); duvarM.visible = arkaM.visible = false; O.sagYaz(kalp(can));
            if (can <= 0) { O.cal("kaybet"); O.bitir(skor, { baslik: "Duvara çarptın!", satir: "" }); return 0; } }
          O.solYaz(String(skor));
        }
        if (dz > 8) { duvarM.visible = arkaM.visible = false; sonraT = Math.max(0.3, 1.2 - sure * 0.004); }
        sahne_(dt);
        return 0;
      },
      tus(k) { if (k === " " || k === "ArrowUp") tusla = true; },
      dokun() { tusla = true; },
      poz(P) { var_.v = P.sol.g > 0.3 && P.sag.g > 0.3; kolAci(P.sol, P.oran, oy); kolAci(P.sag, P.oran, oyR); },
      onizle() { this.ac(); hedef = POZLAR[2]; duvarCiz(hedef); dz = -9; var_.v = true; oy.a = oy.ab = -2.3; oyR.a = oyR.ab = 2.3; kL.a = kL.ab = -2.3; kR.a = kR.ab = 2.3; sahne_(0.001); }
    };
  }

  // ===================================================================================================
  //  4. KALECİ — toplar kaleye gelir; ellerinle ve gövdenle kurtar, yana kayarak kaleyi koru
  // ===================================================================================================
  function kaleci() {
    const OLCEK = 1.6, UZAT = 1.35, KZ = -12;       // kaleci kalenin önünde, bize dönük; top kamera tarafından kaleye fırlar
    let grup, top, ox, hx, kL, kR, hedefL, hedefR, can, skor, seri, sure, sayac, sut, kurtardiT, golT, tutX, tutY;
    function sutAt() {
      const zr = Z(), zor = Math.min(1, sure * zr.rampa / 300);
      const tx = (Math.random() * 2 - 1) * 2.8, ty = 0.4 + Math.random() * 2.3, T_ = Math.max(0.8, (1.75 - zor * 0.7) / zr.hiz);
      sut = { x0: top.position.x, y0: 0.32, z0: 3.2, tx, ty, t: 0, T: T_, egri: (Math.random() - 0.5) * 2.2 };
      O.cal("vur", 0.8, 0.8); O.parAt(top.position.x, 0.3, 3.2, 8, 0xffffff, 3, 0.1); O.sarsinti(0.08);
    }
    const eller = () => [elYeri(ox, -1, kL, OLCEK, UZAT), elYeri(ox, 1, kR, OLCEK, UZAT)];
    const segUzak = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, t = sinirla(((px - ax) * dx + (py - ay) * dy) / Math.max(1e-6, dx * dx + dy * dy), 0, 1); return Math.hypot(px - ax - dx * t, py - ay - dy * t); };
    function govdeTutar(x, y) {      // geniş vuruş kutusu: kafa + saç, gövde, bacaklar, iki kolun tamamı (top yarıçapı dahil)
      const S = OLCEK, TR = 0.32;
      if (Math.hypot(x - ox, y - (0.1 + 1.98 * S)) < 0.55 * S + TR) return true;                    // kafa ve saç
      if (Math.abs(x - ox) < 0.48 * S + TR && y < 0.1 + 1.55 * S + TR) return true;                  // gövde ve bacaklar
      for (const [yon, k] of [[-1, kL], [1, kR]]) {
        const ax = ox + yon * 0.33 * S, ay = 0.1 + 1.31 * S, K1 = 0.3 * S * UZAT, ex = ax + K1 * Math.sin(k.a), ey = ay - K1 * Math.cos(k.a), h = elYeri(ox, yon, k, OLCEK, UZAT);
        if (segUzak(x, y, ax, ay, ex, ey) < 0.17 * S + TR || segUzak(x, y, ex, ey, h.x, h.y) < 0.17 * S + TR) return true;
      }
      return false;
    }
    function sahne_(dt) {
      const k = us(dt, 18); kolYumusat(kL, hedefL, k); kolYumusat(kR, hedefR, k);
      ox += (hx - ox) * us(dt, 10);
      const kar = O.karakter(); kar.kok.position.set(ox, 0, KZ);
      O.durusSifir(D); kolYaz(D, kL, kR, true); D.lUst = D.rUst = 0.35; D.lAlt = D.rAlt = -0.6; D.kalcaY = -0.12; D.govdeX = 0.1;
      kar.solOmuz.scale.setScalar(UZAT); kar.sagOmuz.scale.setScalar(UZAT);
      if (sut) {
        const f = sut.t / sut.T, x = yaklas(sut.x0, sut.tx, f) + Math.sin(f * PI) * sut.egri, y = yaklas(sut.y0, sut.ty, f) + Math.sin(f * PI) * 1.4, zz = yaklas(sut.z0, KZ + 0.7, f);
        top.position.set(x, y, zz); top.rotation.x -= dt * 14;
      } else if (kurtardiT > 0) {           // kurtarış: top eldivende kısa durur, sonra öne düşer
        kurtardiT -= dt; if (kurtardiT < 0.5) { top.position.z += dt * 5; top.position.y = Math.max(0.3, top.position.y - dt * 4); } else top.position.set(tutX, tutY, KZ + 0.7);
        if (kurtardiT <= 0) top.position.set((Math.random() - 0.5) * 2, 0.32, 3.2);
      } else if (golT > 0) {
        golT -= dt; top.position.z = Math.max(top.position.z - dt * 6, KZ - 2.0); top.position.y = Math.max(0.3, top.position.y - dt * 2);
        if (golT <= 0) top.position.set((Math.random() - 0.5) * 2, 0.32, 3.2);
      }
      O.hPoz.set(0, 2.2, 7.2); O.hBak.set(0, 1.8, KZ);
    }
    return {
      id: "kaleci", ad: "Kaleci", elSerbest: true, elGerek: true, ipucu: "Ellerinle topu kurtar. Yana kayarak kaleyi koru",
      ogretici: [
        { tr: "Top kaleye gelir: elini topun geldiği yere uzat", a: Pz("duz"), b: Pz("yana", { lu: -2.3, ll: -2.3 }), efekt: "🧤⚽", sonuc: "Oyuncağın topu tutar" },
        { tr: "Yana adım at", a: Pz("onde", { x: -0.3 }), b: Pz("onde", { x: 0.3 }), efekt: "↔️🥅", sonuc: "Kaleci yana kayar" },
        { tr: "Kaçırırsan gol olur, can gider", a: Pz("yukari"), b: Pz("yana"), efekt: "❤️", sonuc: "" }
      ],
      kur() {
        grup = grupYap();
        const gz = KZ - 0.8, l = [p(sil(12), R.beyaz, -3.7, 1.5, gz, 0, 0, 0, 0.13, 3.0, 0.13), p(sil(12), R.beyaz, 3.7, 1.5, gz, 0, 0, 0, 0.13, 3.0, 0.13), p(sil(12), R.beyaz, 0, 3.0, gz, 0, 0, PI / 2, 0.13, 7.5, 0.13)];
        for (let i = -6; i <= 6; i++) l.push(p(sil(4), 0xe8eef8, i * 0.6, 1.5, gz - 1.6, 0, 0, 0, 0.02, 3.0, 0.02));
        for (let j = 0; j < 5; j++) l.push(p(sil(4), 0xe8eef8, 0, 0.3 + j * 0.65, gz - 1.6, 0, 0, PI / 2, 0.02, 7.4, 0.02));
        for (const sx of [-3.7, 3.7]) for (let j = 0; j < 5; j++) l.push(p(sil(4), 0xe8eef8, sx, 0.3 + j * 0.65, gz - 0.8, PI / 2, 0, 0, 0.02, 1.6, 0.02));
        l.push(p(yKutu(16, 0.03, 0.12, 0.01), R.beyaz, 0, 0.02, gz), p(yKutu(10, 0.03, 0.12, 0.01), R.beyaz, 0, 0.02, KZ + 5), p(yKutu(0.12, 0.03, 5.8, 0.01), R.beyaz, -5, 0.02, KZ + 2.1), p(yKutu(0.12, 0.03, 5.8, 0.01), R.beyaz, 5, 0.02, KZ + 2.1),
          p(kure(10), R.beyaz, 0, 0.02, 2.2, 0, 0, 0, 0.2, 0.02, 0.2));
        // tribün ve seyirciler, reklam panoları
        for (let sira = 0; sira < 5; sira++) {
          l.push(p(yKutu(34, 0.6, 1.4, 0.05), 0x9fb3cc, 0, 0.3 + sira * 0.7, KZ - 7 - sira * 1.3));
          for (let i = 0; i < 22; i++) l.push(p(kure(6), CANLI[(i * 3 + sira) % 8], -16 + i * 1.5 + (sira % 2) * 0.7, 0.95 + sira * 0.7, KZ - 7 - sira * 1.3, 0, 0, 0, 0.28, 0.36, 0.28));
        }
        for (let i = 0; i < 8; i++) l.push(p(yKutu(3.6, 0.8, 0.12, 0.04), CANLI[i], -14 + i * 4, 0.4, KZ - 4.5));
        grup.add(ag(l, false));
        top = new THREE.Mesh(topGeo(0.32), mPlastik); top.castShadow = true; grup.add(top);
      },
      ac() {
        grup.visible = true; O.zeminHarita(cimDoku(), 0.95);
        const k = O.karakter(); O.karakterTak(k, grup, 0, 0, KZ, OLCEK, PI);
        ox = hx = 0; kL = { a: -0.6, ab: -0.6 }; kR = { a: 0.6, ab: 0.6 }; hedefL = { a: -0.6, ab: -0.6 }; hedefR = { a: 0.6, ab: 0.6 };
        can = Z().kolay ? 6 : 4; skor = 0; seri = 0; sure = 0; sayac = 1.8; sut = null; kurtardiT = golT = 0;
        top.position.set(0, 0.32, 3.2);
        O.solYaz("0"); O.sagYaz(kalp(can)); O.fov(50); sahne_(0.001);
      },
      kapat() { grup.visible = false; O.zeminHarita(null); const k = O.karakter(); k.solOmuz.scale.setScalar(1); k.sagOmuz.scale.setScalar(1); },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        sure += dt;
        if (!O.kameraKontrol()) {      // fare/dokunma: işaretçiye en yakın el uzanır; ok tuşları kaleciyi kaydırır
          hx = sinirla(hx + ((O.tus.ArrowRight ? 1 : 0) - (O.tus.ArrowLeft ? 1 : 0)) * dt * 5, -2.2, 2.2);
          const yariY = (7.2 - KZ) * Math.tan(25 * PI / 180), px = (O.isaretci.x - 0.5) * 2 * yariY * O.kamera.aspect, py = 1.8 + (0.5 - O.isaretci.y) * 2 * yariY;
          const i = px < ox ? 0 : 1, yon = i ? 1 : -1, OX = 0.33 * OLCEK, OY = 0.1 + 1.31 * OLCEK, a = Math.atan2(px - (ox + yon * OX), -(py - OY));
          const h = i ? hedefR : hedefL, d = i ? hedefL : hedefR; h.a = h.ab = a; d.a = d.ab = -yon * 0.6;
        }
        if (!sut && kurtardiT <= 0 && golT <= 0) { sayac -= dt; if (sayac <= 0) sutAt(); }
        if (sut) {
          sut.t += dt;
          if (sut.t >= sut.T) {
            const x = top.position.x, y = top.position.y, [e1, e2] = eller();
            const tuttu = govdeTutar(x, y) || Math.hypot(e1.x - x, e1.y - y) < 0.95 || Math.hypot(e2.x - x, e2.y - y) < 0.95;
            sut = null;
            if (tuttu) { seri++; skor += 10 + Math.min(seri, 10) * 2; kurtardiT = 0.9; tutX = x; tutY = y; O.cal("vur", 0.8, 1.2); O.parAt(x, y, KZ + 0.8, 16, 0xffe066, 5, 0.12); O.durumYaz("🧤 " + T("Kurtarış!")); }
            else { can--; seri = 0; golT = 0.9; O.cal("carp"); O.flas(); O.sarsinti(0.3); O.durumYaz("⚽ " + T("Gol!")); O.sagYaz(kalp(can)); if (can <= 0) { O.cal("kaybet"); O.bitir(skor, { baslik: "Maç bitti!", satir: "" }); return 0; } }
            sayac = Math.max(0.6, 1.6 - sure * Z().rampa * 0.006) / Z().yogun;
            O.solYaz(String(skor));
          }
        }
        sahne_(dt);
        return 0;
      },
      poz(P) { kolAci(P.sol, P.oran, hedefL); kolAci(P.sag, P.oran, hedefR); hx = sinirla((P.ox - P.tx) / P.tgen * 1.3, -2.3, 2.3); },
      onizle() { this.ac(); hedefL.a = hedefL.ab = kL.a = kL.ab = -2.2; sutAt(); sut.t = sut.T * 0.7; sut.tx = -2.4; sut.ty = 2.2; sahne_(0.001); }
    };
  }

  // ===================================================================================================
  //  5. DAVULCU — notalar davullara iner; doğru davula, tam zamanında yumrukla vur
  // ===================================================================================================
  function davulcu() {
    const PED = [{ x: -1.35, y: 1.05, ust: false, ses: "kick", renk: R.kirmizi }, { x: -1.75, y: 2.35, ust: true, ses: "zil", renk: R.sari },
      { x: 1.75, y: 2.35, ust: true, ses: "zil", renk: R.sari }, { x: 1.35, y: 1.05, ust: false, ses: "tom", renk: R.mavi }];
    const DUSUS = 4.0, SARKI = 90;      // nota düşüş süresi (iki kat yavaş), şarkı uzunluğu (sn)
    const GEC = 0.9;      // nota çizgiyi geçtikten sonra bu kadar süre içinde vurulursa kabul
    let geriKalan = 0;
    let grup, notaAg, cubuklar = [], notalar = [], pedM = [], pedT = [0, 0, 0, 0], sure, beatT, bpm, can, skor, seri, kacan, kL, kR, hL, hR;
    const L = izci(), Rr = izci(); let hazirL = true, hazirR = true;
    const m4 = new THREE.Matrix4();
    function vurus(i) {
      pedT[i] = 0.15; sentez(PED[i].ses, 0.9);
      let en = null, enF = 9;
      const pencere = (Z().kolay ? 0.32 : Z().zor ? 0.18 : 0.24) + 0.3;      // +0,3 sn tolerans
      for (const n of notalar) if (n.serit === i && !n.vuruldu && !n.kacti && n.t > DUSUS - pencere && n.t < DUSUS + GEC) { const f = Math.abs(n.t - DUSUS); if (f < enF) { enF = f; en = n; } }
      if (en) {
        const gec = en.t - DUSUS > pencere;      // geçtikten sonra vurdu: kabul edilir, notalar o kadar geri çekilip ritme denk getirilir
        en.vuruldu = true; seri++; const mukemmel = !gec && enF < pencere * 0.45; skor += (mukemmel ? 20 : gec ? 6 : 10) + Math.min(seri, 20);
        if (gec) { geriKalan = en.t - DUSUS; O.durumYaz("⏪ " + T("Geç ama oldu!")); }
        O.parAt(PED[i].x, PED[i].y + 0.3, 1.2, 10, mukemmel ? 0xffe066 : 0x9defff, 4, 0.11); if (!gec) O.durumYaz(mukemmel ? "⭐ Harika!" : "👍 İyi");
        if (seri % 16 === 0 && can < 5) { can++; O.sagYaz(kalp(can)); }
        O.solYaz(String(skor));
      }
    }
    function sahne_(dt) {
      const k = us(dt, 18); kolYumusat(kL, hL, k); kolYumusat(kR, hR, k);
      O.durusSifir(D); kolYaz(D, kL, kR, true); D.kalcaY = -0.05;
      cubuklar.forEach((c, i) => { c.rotation.x = 0.7 + (pedT[i ? 2 : 0] > 0 || pedT[i ? 3 : 1] > 0 ? 0.5 : 0); });
      for (let i = 0; i < 4; i++) { if (pedT[i] > 0) pedT[i] -= dt; const s = 1 + Math.max(0, pedT[i]) * 1.2; pedM[i].scale.set(s, 1 / s, s); }
      let j = 0;
      for (const n of notalar) {
        if (j >= 60) break;
        const pd = PED[n.serit], f = n.t / DUSUS, y = pd.y + 0.35 + (1 - f) * 6.5, s = n.vuruldu ? 0 : 0.42;
        notaAg.setMatrixAt(j, m4.makeScale(s, s * 0.5, s).setPosition(pd.x, y, 1.25)); notaAg.setColorAt(j, new THREE.Color(pd.renk)); j++;
      }
      notaAg.count = j; notaAg.instanceMatrix.needsUpdate = true; if (notaAg.instanceColor) notaAg.instanceColor.needsUpdate = true;
      O.hPoz.set(0, 2.4, 7.4); O.hBak.set(0, 2.1, 0);
    }
    function bolge(w, P, sol) { const ust = w.y < w.sy - P.tgovde * 0.12; return sol ? (ust ? 1 : 0) : (ust ? 2 : 3); }
    return {
      id: "davul", ad: "Davulcu", elSerbest: true, elGerek: true, ipucu: "Notalar davula inince o davula yumrukla vur!",
      ogretici: [
        { tr: "Alçak davullar: yumruğunu aşağıya, beline doğru indir", a: Pz("onde", { lu: -0.9, ll: -2.4 }), b: Pz("onde", { lu: -0.6, ll: -0.9 }), efekt: "🥁", sonuc: "Alttaki davul çalar" },
        { tr: "Ziller: yumruğun omzunun üstündeyken aşağı vur", a: Pz("yana", { lu: -2.4, ll: -2.6 }), b: Pz("yana", { lu: -1.9, ll: -1.6 }), efekt: "🔔", sonuc: "Üstteki zil çalar" },
        { tr: "Sol elin soldaki, sağ elin sağdaki davulları çalar. Nota davula değdiği an vur!", a: Pz("onde"), b: Pz("yanaAsagi"), efekt: "🎵⏱️", sonuc: "" }
      ],
      kur() {
        grup = grupYap();
        PED.forEach((pd, i) => {
          const m = pd.ust ? ag([p(sil(20), 0xffe27a, 0, 0, 0, 0.25, 0, 0, 0.75, 0.04, 0.75), p(sil(8), R.gri, 0, -1.2, 0, 0, 0, 0, 0.04, 2.4, 0.04)])
            : ag([p(sil(20), pd.renk, 0, -0.25, 0, 0.2, 0, 0, 0.62, 0.5, 0.62), p(sil(20), R.beyaz, 0, 0.02, -0.05, 0.2, 0, 0, 0.6, 0.04, 0.6), p(simit(0.62, 0.05, PI * 2, 24), R.gri, 0, 0.01, -0.05, PI / 2 + 0.2, 0, 0), p(sil(8), R.gri, 0, -0.75, 0, 0, 0, 0, 0.04, 0.6, 0.04)]);
          m.position.set(pd.x, pd.y, 1.25); grup.add(m); pedM.push(m);
        });
        const cubukGeo = birlestir([p(sil(8), 0xe8c48a, 0, -0.42, 0, 0, 0, 0, 0.035, 0.85, 0.035), p(kure(8), 0xfff3dc, 0, -0.86, 0, 0, 0, 0, 0.055, 0.075, 0.055)]);
        for (let i = 0; i < 2; i++) { const c = new THREE.Group(), m = new THREE.Mesh(cubukGeo, mPlastik); m.castShadow = true; c.add(m); c.rotation.x = 0.7; cubuklar.push(c); }
        notaAg = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 18), new THREE.MeshStandardMaterial({ roughness: 0.3, emissive: 0x333333 }), 60);
        notaAg.frustumCulled = false; notaAg.count = 0; grup.add(notaAg);
        const l = []; for (let i = 0; i < 6; i++) l.push(p(kure(10), CANLI[i], -6 + i * 2.4, 4.6 + (i % 2) * 0.5, -3, 0, 0, 0, 0.35));
        grup.add(ag([p(yKutu(8, 0.25, 4.5, 0.08), 0x8f5bff, 0, 0.12, 0.3), ...l], false));
      },
      ac() {
        grup.visible = true; O.susGoster(true); const kr = O.karakter(); O.karakterTak(kr, grup, 0, 0.25, 0.6, 1.25, PI);      // davullara yakın: kollar ve çubuklar davulların önüne gelir
        kr.solDirsek.add(cubuklar[0]); kr.sagDirsek.add(cubuklar[1]); cubuklar.forEach(c => c.position.set(0, -0.27, 0));      // çubuklar ellerde: davullara yetişir
        kL = { a: -0.6, ab: -1.8 }; kR = { a: 0.6, ab: 1.8 }; hL = { a: -0.6, ab: -1.8 }; hR = { a: 0.6, ab: 1.8 };
        notalar = []; sure = 0; beatT = 1.2; bpm = Z().kolay ? 72 : Z().zor ? 100 : 86; can = 5; skor = 0; seri = 0; kacan = 0; geriKalan = 0;
        O.solYaz("0"); O.sagYaz("⏱ " + SARKI); O.fov(52); sahne_(0.001);
      },
      kapat() { grup.visible = false; notalar = []; O.susGoster(false); cubuklar.forEach(c => c.removeFromParent()); },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        const zr = Z();
        if (geriKalan > 0) {      // geç vuruştan sonra notalar kısa bir an geri sarılır (ritim yeniden denk gelir)
          const d = Math.min(geriKalan, dt * 3); geriKalan -= d; for (const n of notalar) if (!n.vuruldu && !n.kacti) n.t = Math.max(0, n.t - d);
          sahne_(dt); return 0;
        }
        sure += dt; bpm = Math.min(130, (zr.kolay ? 72 : zr.zor ? 100 : 86) + sure * zr.rampa * 0.08);
        O.sagYaz("⏱ " + Math.max(0, Math.ceil(SARKI - sure)));
        if (sure >= SARKI) { O.cal("elmas", 0.9, 1.3); O.bitir(skor, { baslik: "Şarkı bitti!", satir: "" }); return 0; }
        beatT -= dt;
        if (beatT <= 0) {      // her vuruşta (dörtlükte) nota üret
          beatT += 60 / bpm; sentez("tik", 0.8);
          const olas = zr.kolay ? 0.5 : zr.zor ? 0.85 : 0.7;
          if (Math.random() < olas) { const s = rast(4); notalar.push({ serit: s, t: 0, vuruldu: false }); if (!zr.kolay && Math.random() < 0.18) notalar.push({ serit: s < 2 ? 3 - s : 3 - s, t: 0, vuruldu: false }); }
        }
        for (let i = notalar.length - 1; i >= 0; i--) {
          const n = notalar[i]; n.t += dt;
          const pencere = zr.kolay ? 0.32 : zr.zor ? 0.18 : 0.24;
          if (!n.vuruldu && !n.kacti && n.t > DUSUS + GEC) { n.kacti = true; seri = 0; O.durumYaz(T("Kaçtı!")); }      // can gitmez, sadece seri sıfırlanır
          if ((n.vuruldu || n.kacti) && n.t > DUSUS + 1.2) notalar.splice(i, 1);
        }
        sahne_(dt);
        return 0;
      },
      tus(k) { const i = { a: 0, q: 1, e: 2, d: 3, ArrowLeft: 0, ArrowUp: 1, ArrowRight: 3, ArrowDown: 2 }[k]; if (i !== undefined) vurus(i); },
      dokun(x, y) { vurus(x < 0.5 ? (y < 0.5 ? 1 : 0) : (y < 0.5 ? 2 : 3)); },
      poz(P, dt) {
        kolAci(P.sol, P.oran, hL); kolAci(P.sag, P.oran, hR);
        const esik = 3.0 / O.has();
        if (P.sol.g > 0.35) { izle(L, P.sol.x, P.sol.y, P.tgen, P.oran, dt); if (hazirL && L.vy > esik) { hazirL = false; vurus(bolge(P.sol, P, true)); } else if (!hazirL && L.vy < esik * 0.25) hazirL = true; }
        if (P.sag.g > 0.35) { izle(Rr, P.sag.x, P.sag.y, P.tgen, P.oran, dt); if (hazirR && Rr.vy > esik) { hazirR = false; vurus(bolge(P.sag, P, false)); } else if (!hazirR && Rr.vy < esik * 0.25) hazirR = true; }
      },
      onizle() { this.ac(); notalar = [{ serit: 0, t: 1.7, vuruldu: false }, { serit: 2, t: 1.1, vuruldu: false }, { serit: 3, t: 0.5, vuruldu: false }, { serit: 1, t: 1.9, vuruldu: false }]; hL.a = kL.a = -2.0; hL.ab = kL.ab = -2.4; pedT[0] = 0.1; sahne_(0.001); }
    };
  }

  // ===================================================================================================
  //  6. KAYAK — sağa sola yatarak kay, çömel = hızlan, zıpla = tümsekten uç; ağaçlardan kaç, bayraklardan geç
  // ===================================================================================================
  function kayak() {
    let grup, karT, susListe, kayaklar, sopa = [], nesneler = [], x, yon, hedefYon, hiz, sure, mesafe, can, dokunulmaz, elmas, bayrak, sonraki, py, vy, havada, comel, hedefComel;
    const zip = { hazir: true, bekle: 0 };
    const havuz = {}, GEO = {};
    const al = ad => { const h = havuz[ad] || (havuz[ad] = []); let m = h.pop(); if (!m) { m = new THREE.Mesh(GEO[ad], mPlastik); m.castShadow = m.receiveShadow = true; grup.add(m); } m.visible = true; return m; };
    const birak = n => { n.m.visible = false; havuz[n.ad].push(n.m); };
    function ekle(ad, nx, z, r) { const m = al(ad); m.position.set(nx, 0, z); m.rotation.y = ad === "bayrak" ? 0 : Math.random() * 6; nesneler.push({ m, ad, x: nx, z, r, gecti: false }); }
    function dalga(z) {
      const zr = Z(), t = Math.random();
      if (t < 0.35) { const gx = (Math.random() - 0.5) * 7; ekle("bayrak", gx, z, 0); for (let k = 0; k < 4; k++) O.elmasEkle(gx, 0.9, z + 6 + k * 2.4); }
      else if (t < 0.5) { ekle("rampa", (Math.random() - 0.5) * 6, z, 1.2); }
      else {
        const n = zr.kolay ? 1 : zr.zor ? 3 : 2, bos = (Math.random() - 0.5) * 6;
        for (let k = 0; k < n; k++) { let nx; do { nx = (Math.random() - 0.5) * 11; } while (Math.abs(nx - bos) < 2.6); ekle(Math.random() < 0.55 ? "cam" : Math.random() < 0.5 ? "kardan" : "kaya", nx, z - k * 3, 0.9); }
        for (let k = 0; k < 5; k++) O.elmasEkle(bos, 0.9, z + k * 2.4);
      }
    }
    const skor = () => Math.floor(mesafe / 2) + elmas * 10 + bayrak * 30;
    function sahne_(dt) {
      const k = O.karakter();
      k.kok.position.set(x, py, 0); k.kok.rotation.set(0, -yon * 0.35, -yon * 0.35);
      O.durusSifir(D);
      const cm = comel;
      D.lUst = D.rUst = 0.6 + cm * 0.5; D.lAlt = D.rAlt = -1.0 - cm * 0.6; D.kalcaY = -0.14 - cm * 0.16; D.govdeX = -0.35 - cm * 0.3; D.basX = 0.25 + cm * 0.2;
      D.lKolX = 0.5 + cm * 0.3; D.rKolX = 0.5 + cm * 0.3; D.lKolZ = -0.25; D.rKolZ = 0.25; D.lDirX = D.rDirX = 0.4;
      if (havada) { D.lUst = D.rUst = 1.1; D.lAlt = D.rAlt = -1.5; }
      O.hPoz.set(x * 0.6, 3.6 + py * 0.4, 7.2); O.hBak.set(x * 0.6, 0.8, -8);
    }
    return {
      id: "kayak", ad: "Kayak", elSerbest: true, elGerek: false, ipucu: "Sağa sola yatarak kay. Çömel: hızlan. Zıpla: tümsekten uç",
      ogretici: [
        { tr: "Sağa ya da sola yatın", a: Pz("yanaAsagi", { egim: -0.3 }), b: Pz("yanaAsagi", { egim: 0.3 }), efekt: "⛷️↔️", sonuc: "Kayakçı o yöne kayar" },
        { tr: "Dizlerini bük, çömel", a: Pz("onde"), b: Pz("onde", { cok: 0.8 }), efekt: "⛷️💨", sonuc: "Hızlanırsın" },
        { tr: "Zıpla", a: Pz("duz"), b: Pz("duz", { y: 0.35 }), efekt: "⛷️⤴️", sonuc: "Kayaların üstünden uçarsın" },
        { tr: "Bayrakların arasından geç, ağaçlara çarpma", a: Pz("onde"), b: Pz("onde", { egim: 0.2 }), efekt: "🚩🌲", sonuc: "" }
      ],
      kur() {
        grup = grupYap(); karT = karDoku();
        GEO.cam = karliCam(); GEO.kardan = kardanAdam(); GEO.kaya = kaya(0.8);
        GEO.bayrak = birlestir([p(sil(8), R.beyaz, -1.6, 1.0, 0, 0, 0, 0, 0.05, 2.0, 0.05), p(yKutu(0.7, 0.45, 0.04, 0.02), R.kirmizi, -1.25, 1.75, 0), p(sil(8), R.beyaz, 1.6, 1.0, 0, 0, 0, 0, 0.05, 2.0, 0.05), p(yKutu(0.7, 0.45, 0.04, 0.02), R.mavi, 1.95, 1.75, 0)]);
        GEO.rampa = birlestir([p(new THREE.CylinderGeometry(0.01, 1.4, 0.8, 4, 1), 0xe6f2ff, 0, 0.4, 0, 0, PI / 4, 0, 1, 1, 1.4), p(yKutu(2.0, 0.05, 1.2, 0.02), 0x9fd0ff, 0, 0.42, 0, -0.35, 0, 0)]);
        susListe = [karliCam(), karliCam(), kardanAdam(), kaya(1.2)];
        kayaklar = ag([p(yKutu(0.16, 0.05, 1.5, 0.02), R.kirmizi, -0.17, 0.03, -0.1), p(yKutu(0.16, 0.05, 1.5, 0.02), R.kirmizi, 0.17, 0.03, -0.1), p(yKutu(0.16, 0.1, 0.2, 0.03), R.kirmizi, -0.17, 0.08, -0.82, -0.6, 0, 0), p(yKutu(0.16, 0.1, 0.2, 0.03), R.kirmizi, 0.17, 0.08, -0.82, -0.6, 0, 0)]);
        const sopaGeo = birlestir([p(sil(6), R.gri, 0, -0.55, 0, 0, 0, 0, 0.025, 1.1, 0.025), p(simit(0.08, 0.02, PI * 2, 10), R.siyah, 0, -1.0, 0, PI / 2, 0, 0)]);
        for (let i = 0; i < 2; i++) { const m = new THREE.Mesh(sopaGeo, mPlastik); m.castShadow = true; sopa.push(m); }
      },
      ac() {
        grup.visible = true; O.zeminHarita(karT, 0.9); O.susGoster(true, susListe);
        for (const n of nesneler) birak(n); nesneler = []; O.elmasListe().length = 0;
        const k = O.karakter(); O.karakterTak(k, grup, 0, 0, 0, 1, 0);
        k.kok.add(kayaklar); k.solDirsek.add(sopa[0]); k.sagDirsek.add(sopa[1]); sopa.forEach(s => { s.position.set(0, -0.27, 0); s.rotation.set(0.5, 0, 0); });
        x = 0; yon = hedefYon = 0; hiz = 14 * Z().hiz; sure = 0; mesafe = 0; can = Z().kolay ? 5 : 3; dokunulmaz = 0; elmas = 0; bayrak = 0; sonraki = 0; py = 0; vy = 0; havada = false; comel = hedefComel = 0;
        dalga(-50); dalga(-80);
        O.solYaz("0"); O.sagYaz(kalp(can)); O.fov(60); sahne_(0.001);
      },
      kapat() { grup.visible = false; O.zeminHarita(null); O.susGoster(false); for (const n of nesneler) birak(n); nesneler = []; O.elmasListe().length = 0; kayaklar.removeFromParent(); sopa.forEach(s => s.removeFromParent()); },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        const zr = Z(); sure += dt; const zor = Math.min(1, sure * zr.rampa / 420);
        if (!O.kameraKontrol()) {
          hedefYon = (O.tus.ArrowRight ? 1 : 0) - (O.tus.ArrowLeft ? 1 : 0); if (O.isaretci.basili) hedefYon = sinirla((O.isaretci.x - 0.5) * 3, -1, 1);
          hedefComel = O.tus.ArrowDown ? 1 : 0;
        }
        yon += (hedefYon - yon) * us(dt, 6); comel += (hedefComel - comel) * us(dt, 8);
        hiz = (14 + 12 * zor) * zr.hiz * (1 + comel * 0.3);
        x = sinirla(x + yon * 9 * dt, -6.2, 6.2);
        if (havada) { vy -= 22 * dt; py += vy * dt; if (py <= 0) { py = 0; havada = false; O.cal("adim2", 0.4); O.parAt(x, 0.1, 0.3, 8, 0xffffff, 3, 0.1); } }
        if (dokunulmaz > 0) dokunulmaz -= dt;
        const adim = hiz * dt; mesafe += adim; karT.offset.y = (karT.offset.y + adim / 12) % 1;
        if (mesafe >= sonraki) { dalga(-96); sonraki = mesafe + hiz * (2.0 - zor * 0.8) / zr.yogun; }
        for (let i = nesneler.length - 1; i >= 0; i--) {
          const n = nesneler[i]; n.z += adim; n.m.position.z = n.z;
          if (!n.gecti && n.z > -0.6) {
            n.gecti = true;
            if (n.ad === "bayrak") { if (Math.abs(n.x - x) < 1.5) { bayrak++; O.cal("elmas", 0.8, 1.4); O.parAt(n.x, 1.2, 0, 14, 0xffe066, 5, 0.12); O.durumYaz("🚩 +30"); } }
            else if (n.ad === "rampa") { if (Math.abs(n.x - x) < 1.3 && !havada) { havada = true; vy = 9; O.cal("zipla", 0.6); } }
            else if (Math.abs(n.x - x) < n.r + 0.35 && !(havada && py > 0.9 && n.ad === "kaya") && dokunulmaz <= 0) {
              can--; dokunulmaz = 1.5; O.cal("carp"); O.cal("vur", 0.7); O.flas(); O.sarsinti(0.4); O.parAt(x, 1, 0, 16, 0xffffff, 5, 0.13); O.sagYaz(kalp(can));
              if (can <= 0) { O.cal("kaybet"); O.bitir(skor(), { baslik: "Düştün!", satir: "💎 " + elmas }); return 0; }
            }
          }
          if (n.z > 14) { birak(n); nesneler[i] = nesneler[nesneler.length - 1]; nesneler.pop(); }
        }
        const l = O.elmasListe();
        for (let i = l.length - 1; i >= 0; i--) { const e = l[i]; e.z += adim; if (Math.abs(e.z) < 1.0 && Math.abs(e.x - x) < 1.1) { elmas++; O.cal("elmas", 0.6); O.parAt(e.x, e.y, e.z, 5, 0x9defff, 3, 0.09); l[i] = l[l.length - 1]; l.pop(); } else if (e.z > 10) { l[i] = l[l.length - 1]; l.pop(); } }
        if (Math.random() < comel * 0.6) O.parAt(x + (Math.random() - 0.5) * 0.4, 0.1, 0.8, 1, 0xffffff, 1.5, 0.07);
        O.karakter().kok.visible = dokunulmaz <= 0 || Math.floor(O.zaman() * 12) % 2 === 0;
        sahne_(dt); O.solYaz(String(skor())); O.fov(60 + comel * 6 + zor * 6);
        return adim;
      },
      tus(k) { if ((k === " " || k === "ArrowUp") && !havada) { havada = true; vy = 8; O.cal("zipla", 0.5); } },
      poz(P) {
        const egim = Math.atan2(P.sag.sy - P.sol.sy, (P.sag.sx - P.sol.sx) * P.oran), kayma = (P.ox - P.tx) / P.tgen;
        hedefYon = egri((egim / 0.45 + kayma * 0.6) * O.has(), 0.12, 1.4);
        const fark = (P.ty - P.oy) / P.tgovde;
        hedefComel = fark < -0.25 / O.has() ? 1 : 0;
        if (ziplamaAlgila(zip, P) && !havada) { havada = true; vy = 8; O.cal("zipla", 0.5); }
      },
      onizle() { this.ac(); x = 1.5; yon = 0.5; comel = 0.6; ekle("bayrak", 1.6, -12, 0); ekle("cam", -3.5, -18, 0.9); for (let k = 0; k < 5; k++) O.elmasEkle(1.6, 0.9, -3 - k * 2.4); sahne_(0.001); }
    };
  }

  // ===================================================================================================
  //  7. YÜZME YARIŞI — kollarını sırayla başının üstünden çevirerek kulaç at; ne kadar hızlı, o kadar hızlı yüzersin
  // ===================================================================================================
  function yuzme(iki = false) {
    const BOY = 50, AD = ["Ponçik", "Zıpır"];
    let grup, su, suDk, ordek, rakipler, yuzucu, sure, bitti_;
    const Dr = O.yeniDurus(), D2 = O.yeniDurus();
    const yeniY = (k, x, Dd) => ({ k, x, Dd, z: 0, v: 0, faz: 0, hamle: 1, sonKol: "", sonKulacT: 0, ust: { sol: false, sag: false } });
    function kulac(y, kol) {
      const simdi = performance.now(), ayni = kol === y.sonKol && simdi - y.sonKulacT < 900;
      y.v = Math.min(y.v + (ayni ? 0.5 : 1.25), Z().kolay ? 4.6 : 5.6); y.sonKol = kol; y.sonKulacT = simdi; y.hamle = kol === "sol" ? 1 : -1; y.faz = 0;
      O.parAt(y.x + (kol === "sol" ? -0.5 : 0.5), 0.25, -y.z - 0.8, 6, 0xffffff, 3, 0.1); O.cal("adim" + (1 + rast(3)), 0.3, 1.4);
    }
    function yuzucuDurus(Dd, faz, el) {
      O.durusSifir(Dd);
      Dd.lKolX = faz * (el > 0 ? 1 : 0.5) + PI * (el > 0 ? 0 : 1); Dd.rKolX = faz * (el < 0 ? 1 : 0.5) + PI * (el < 0 ? 0 : 1);
      Dd.lUst = Math.sin(O.zaman() * 10) * 0.3; Dd.rUst = -Math.sin(O.zaman() * 10) * 0.3; Dd.basY = Math.sin(faz) * 0.3;
    }
    function sahne_(dt) {
      for (const y of yuzucu) { y.faz += dt * 7; yuzucuDurus(y.Dd, y.faz, y.hamle); y.k.kok.position.set(y.x, 0.25 + Math.sin(O.zaman() * 6 + y.x) * 0.03, -y.z); if (y.Dd !== D) O.durusUygula(y.k, y.Dd); }
      for (const r of rakipler) {
        r.m.position.z = -r.z;
        if (r.k) { yuzucuDurus(Dr, O.zaman() * 6 + r.faz, Math.sin(O.zaman() * 3 + r.faz) > 0 ? 1 : -1); O.durusUygula(r.k, Dr); }
        else r.m.position.y = 0.15 + Math.sin(O.zaman() * 5 + r.faz) * 0.05;
      }
      suDk.offset.y = (suDk.offset.y + dt * 0.05) % 1;
      if (iki) { const zOn = Math.max(yuzucu[0].z, yuzucu[1].z), zArka = Math.min(yuzucu[0].z, yuzucu[1].z), ara = zOn - zArka; O.hPoz.set(0, 7 + ara * 0.3, -zArka + 7.5 + ara * 0.25); O.hBak.set(0, 0, -zOn - 5); }
      else { const z = yuzucu[0].z; O.hPoz.set(6.5, 5.5, -z + 6.5); O.hBak.set(0, 0, -z - 6); }
    }
    return {
      id: iki ? "yuzme2" : "yuzme", esi: iki ? "yuzme" : undefined, ikiKisi: iki, ad: "Yüzme Yarışı", elSerbest: true, elGerek: true, ipucu: iki ? "İkiniz de kollarınızı sırayla çevirerek kulaç atın!" : "Kollarını sırayla başının üstünden çevirerek kulaç at!",
      ogretici: [
        { tr: "Sol kolunu başının üstünden öne çevir", a: Pz("duz"), b: Pz("duz", { lu: -2.9, ll: -2.9 }), efekt: "🏊", sonuc: "Bir kulaç" },
        { tr: "Sonra sağ kolunu çevir; sırayla devam", a: Pz("duz", { lu: -2.9, ll: -2.9 }), b: Pz("duz", { ru: 2.9, rl: 2.9 }), efekt: "🏊💨", sonuc: "Ne kadar hızlı, o kadar hızlı yüzersin" },
        { tr: "Rakiplerinden önce 50 metreye ulaş!", a: Pz("yukari"), b: Pz("duz"), efekt: "🏁", sonuc: "" }
      ],
      kur() {
        grup = grupYap(); suDk = O.dokuYap(256, 256, (c, w, h) => {
          const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#14a8ff"); g.addColorStop(1, "#0a86f0"); c.fillStyle = g; c.fillRect(0, 0, w, h);
          for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(160,235,255,${0.25 + Math.random() * 0.3})`; c.lineWidth = 2 + Math.random() * 2; c.beginPath(); const y = Math.random() * h; c.moveTo(0, y); for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x / 20 + i) * 6); c.stroke(); }
        }, 4, 12);
        const karo = O.dokuYap(128, 128, (c, w, h) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? "#ffffff" : "#d9f1ff"; c.fillRect(x * 32, y * 32, 32, 32); } c.strokeStyle = "rgba(120,170,210,.4)"; c.lineWidth = 2; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, h); c.moveTo(0, i * 32); c.lineTo(w, i * 32); c.stroke(); } }, 30, 60);
        const zeminK = new THREE.Mesh(new THREE.PlaneGeometry(60, 120), new THREE.MeshStandardMaterial({ map: karo, roughness: 0.6 }));
        zeminK.rotation.x = -PI / 2; zeminK.position.set(0, 0.0, -BOY / 2 + 5); zeminK.receiveShadow = true; grup.add(zeminK);
        // kenarlar: şemsiyeler, şezlonglar, palmiyeler, simitler, flamalar
        const dl = [];
        for (let i = 0; i < 9; i++) for (const yon of [-1, 1]) {
          const zz = 4 - i * 7 - (yon > 0 ? 3 : 0), xx = yon * (10.5 + (i % 3) * 2.2), t = (i + (yon > 0 ? 1 : 0)) % 3;
          if (t === 0) { dl.push(p(sil(8), R.beyaz, xx, 1.2, zz, 0, 0, 0, 0.06, 2.4, 0.06), p(koni(12), CANLI[i % 8], xx, 2.55, zz, 0, 0, 0, 1.5, 0.6, 1.5), p(yKutu(0.9, 0.12, 2.0, 0.05), CANLI[(i + 3) % 8], xx + yon * 1.3, 0.35, zz), p(yKutu(0.9, 0.5, 0.12, 0.04), CANLI[(i + 3) % 8], xx + yon * 1.3, 0.62, zz - 0.95, 0.4, 0, 0)); }
          else if (t === 1) { for (let k = 0; k < 6; k++) dl.push(p(sil(8), 0xb5803f, xx + Math.sin(k * 0.3) * 0.2 * yon, 0.4 + k * 0.7, zz, 0, 0, yon * 0.06 * k, 0.22 - k * 0.015, 0.72, 0.22 - k * 0.015)); for (let k = 0; k < 6; k++) { const a = k / 6 * PI * 2; dl.push(p(kure(8), 0x3fae5a, xx + Math.cos(a) * 1.0 + yon * 0.25, 4.3, zz + Math.sin(a) * 1.0, 0, -a, 0.4, 1.0, 0.12, 0.35)); } }
          else { dl.push(p(simit(0.55, 0.22, PI * 2, 20), CANLI[(i + 5) % 8], xx, 0.22, zz, PI / 2, 0, 0), p(kure(10), R.sari, xx + yon * 1.6, 0.5, zz + 1, 0, 0, 0, 0.5)); }
        }
        for (let i = 0; i < 4; i++) { const zz = -6 - i * 14; dl.push(p(sil(6), R.beyaz, 0, 4.2, zz, 0, 0, PI / 2, 0.02, 15.6, 0.02)); for (let k = 0; k < 16; k++) dl.push(p(koni(3), CANLI[k % 8], -7.4 + k, 3.95, zz, PI, 0, 0, 0.22, 0.45, 0.04)); dl.push(p(sil(8), R.beyaz, -7.8, 2.1, zz, 0, 0, 0, 0.06, 4.2, 0.06), p(sil(8), R.beyaz, 7.8, 2.1, zz, 0, 0, 0, 0.06, 4.2, 0.06)); }
        grup.add(ag(dl));
        su = new THREE.Mesh(new THREE.PlaneGeometry(14, 90), new THREE.MeshStandardMaterial({ map: suDk, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.92, envMapIntensity: 1.2 }));
        su.rotation.x = -PI / 2; su.position.set(0, 0.2, -BOY / 2 + 5); grup.add(su);
        const l = [p(yKutu(14.4, 0.4, 92, 0.1), 0x9fdcff, 0, -0.05, -BOY / 2 + 5), p(yKutu(1.4, 0.5, 92, 0.1), R.beyaz, -7.6, 0.2, -BOY / 2 + 5), p(yKutu(1.4, 0.5, 92, 0.1), R.beyaz, 7.6, 0.2, -BOY / 2 + 5),
          p(yKutu(14, 0.2, 0.4, 0.05), R.kirmizi, 0, 0.26, -BOY), p(yKutu(14, 0.6, 1.2, 0.1), R.beyaz, 0, 0.3, 1.2)];
        for (const lx of [-1.75, 1.75]) for (let i = 0; i < 45; i++) l.push(p(kure(6), i % 2 ? R.kirmizi : R.beyaz, lx, 0.24, 2 - i * 1.2, 0, 0, 0, 0.13));
        for (const lx of [-5.25, 5.25]) for (let i = 0; i < 45; i++) l.push(p(kure(6), i % 2 ? R.sari : R.beyaz, lx, 0.24, 2 - i * 1.2, 0, 0, 0, 0.13));
        grup.add(ag(l, false));
        ordek = ag([p(kure(14), 0xffd60a, 0, 0.3, 0, 0, 0, 0, 0.55, 0.45, 0.7), p(kure(14), 0xffd60a, 0, 0.75, -0.4, 0, 0, 0, 0.35), p(koni(8), R.turuncu, 0, 0.72, -0.78, -PI / 2, 0, 0, 0.14, 0.26, 0.07), p(kure(6), R.siyah, -0.14, 0.86, -0.66, 0, 0, 0, 0.05), p(kure(6), R.siyah, 0.14, 0.86, -0.66, 0, 0, 0, 0.05)]);
        grup.add(ordek);
      },
      ac() {
        grup.visible = true; O.zeminGoster(false);
        const zr = Z(), taban = zr.kolay ? 1.3 : zr.zor ? 2.7 : 2.0;
        if (iki) {      // solda Ponçik, sağda Zıpır; rakip yok
          const ks = O.oyuncular(); yuzucu = [yeniY(ks[0], -3.5, D), yeniY(ks[1], 3.5, D2)]; rakipler = []; ordek.visible = false;
          ks.forEach((k, i) => { O.karakterTak(k, grup, yuzucu[i].x, 0.25, 0, 1, 0); k.kok.rotation.x = -PI / 2 + 0.1; });
          O.solYaz(AD[0] + " 0 m"); O.sagYaz(AD[1] + " 0 m");
        } else {
          const k = O.karakter(); O.karakterTak(k, grup, 0, 0.25, 0, 1, 0); k.kok.rotation.x = -PI / 2 + 0.1;
          const d = O.diger(); O.karakterTak(d, grup, -3.5, 0.25, 0, 1, 0); d.kok.rotation.x = -PI / 2 + 0.1;
          ordek.visible = true; ordek.position.set(3.5, 0.15, 0); yuzucu = [yeniY(k, 0, D)];
          rakipler = [{ m: d.kok, k: d, z: 0, v: taban * (0.95 + Math.random() * 0.1), faz: 1 }, { m: ordek, k: null, z: 0, v: taban * (0.9 + Math.random() * 0.1), faz: 2 }];
          O.solYaz("0 m"); O.sagYaz("🏁 " + BOY + " m");
        }
        sure = 0; bitti_ = false;
        O.fov(55); sahne_(0.001);
      },
      kapat() { grup.visible = false; O.zeminGoster(true); },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        sure += dt;
        for (const y of yuzucu) { y.v *= Math.exp(-dt * 0.55); y.z += y.v * dt; }
        for (const r of rakipler) { r.z += r.v * (1 + Math.sin(sure * 0.7 + r.faz) * 0.12) * dt; }
        if (!bitti_ && iki && yuzucu.some(y => y.z >= BOY)) {
          bitti_ = true; const k = yuzucu[0].z >= yuzucu[1].z ? 0 : 1; O.cal("elmas", 0.9, 1.3);
          O.bitir(Math.max(0, Math.round(2000 - sure * 20)), { baslik: "🏆 " + AD[k] + " " + T("kazandı!"), satir: sure.toFixed(1) + " sn" }); return 0;
        }
        if (!bitti_ && !iki && (yuzucu[0].z >= BOY || rakipler.some(r => r.z >= BOY))) {
          const z = yuzucu[0].z; bitti_ = true; const sira = 1 + rakipler.filter(r => r.z > z).length;
          const puan = Math.max(0, Math.round(1500 - sure * 20)) + (sira === 1 ? 500 : sira === 2 ? 200 : 0);
          O.cal(sira === 1 ? "elmas" : "kaybet", 0.8);
          O.bitir(puan, { baslik: sira === 1 ? "🥇 Birinci oldun!" : sira === 2 ? "🥈 İkinci oldun" : "🥉 Üçüncü oldun", satir: sure.toFixed(1) + " sn" });
          return 0;
        }
        if (iki) { O.solYaz(AD[0] + " " + Math.floor(yuzucu[0].z) + " m"); O.sagYaz(AD[1] + " " + Math.floor(yuzucu[1].z) + " m"); } else O.solYaz(Math.floor(yuzucu[0].z) + " m");
        sahne_(dt);
        return 0;
      },
      tus(k) {
        const y = yuzucu[0], y2 = yuzucu[iki ? 1 : 0];
        if (k === "a") kulac(y, y.sonKol === "sol" ? "sag" : "sol");
        else if (k === "ArrowLeft") kulac(iki ? y2 : y, "sol"); else if (k === "ArrowRight") kulac(iki ? y2 : y, "sag"); else if (k === " ") kulac(y, y.sonKol === "sol" ? "sag" : "sol");
      },
      dokun(x) { if (iki) { const y = yuzucu[x < 0.5 ? 0 : 1]; kulac(y, y.sonKol === "sol" ? "sag" : "sol"); } else kulac(yuzucu[0], x < 0.5 ? "sol" : "sag"); },
      poz(P) {
        // Kulaç: bilek başın üstüne çıkar (ust), sonra omuz hizasının altına iner → o kolun kulacı
        const isle = (y, H) => { for (const [ad, w] of [["sol", H.sol], ["sag", H.sag]]) { if (w.g < 0.35) continue; if (w.y < H.by - H.tgovde * 0.15) y.ust[ad] = true; else if (y.ust[ad] && w.y > w.sy) { y.ust[ad] = false; kulac(y, ad); } } };
        if (iki) O.ikiP().forEach((H, i) => { if (H.var) isle(yuzucu[i], H); }); else isle(yuzucu[0], P);
      },
      onizle() { this.ac(); if (iki) { yuzucu[0].z = 14; yuzucu[1].z = 11; } else { yuzucu[0].z = 14; rakipler[0].z = 12; rakipler[1].z = 15.5; } yuzucu.forEach(y => { y.faz = 1.2; }); sahne_(0.001); }
    };
  }

  // ===================================================================================================
  //  8. DUR-KALK — yeşilde yerinde koş, oyuncak arkasını dönünce (kırmızı) don! Kıpırdarsan yakalanırsın
  // ===================================================================================================
  function durKalk(iki = false) {
    const AD = ["Ponçik", "Zıpır"];
    let grup, bitisG, lamba, bekci, dekorG, yolM, bitis, isik, isikT, can, skor, seviye, sure, kutlamaT, kirmiziBas = 0, kazanan, ks, n;
    let z = [0, 0], enerji = [0, 0], yakalandiT = [0, 0], oncekiV = [null, null];
    const Db = O.yeniDurus(), D2 = O.yeniDurus(), DEK = {};
    function isikDegis(yeni) {
      const zr = Z(); isik = yeni;
      if (yeni === "yesil") isikT = (zr.kolay ? 3.5 : 2.2) + Math.random() * 2.5 / Math.max(1, seviye * 0.3);
      else if (yeni === "sari") isikT = zr.kolay ? 0.9 : zr.zor ? 0.45 : 0.6;
      else { isikT = 1.8 + Math.random() * 1.5; kirmiziBas = performance.now(); }
      lamba.material.color.set(yeni === "yesil" ? 0x46d16a : yeni === "sari" ? 0xffd23f : 0xff4756); lamba.material.emissive.set(lamba.material.color);
      O.durumYaz(yeni === "yesil" ? "🟢 " + T("KOŞ!") : yeni === "sari" ? "🟡 " + T("Hazırlan…") : "🔴 " + T("DUR!"));
      if (yeni === "kirmizi") O.cal("blok", 0.6);
    }
    // Park süsleri: her seviyede yeniden dizilir, renkleri değişir
    function dekorYap() {
      while (dekorG.children.length) dekorG.remove(dekorG.children[0]);
      const tur = [DEK.agac, DEK.cam, DEK.cali, DEK.cicek0, DEK.cicek1, DEK.cicek2, DEK.bank, DEK.balon];
      for (let zz = 6; zz > -bitis - 16; zz -= 3.2 + Math.random() * 1.6) for (const yon of [-1, 1]) {
        const g = tur[rast(tur.length)], m = new THREE.Mesh(g, mPlastik); m.castShadow = true;
        const yakin = g === DEK.cicek0 || g === DEK.cicek1 || g === DEK.cicek2 || g === DEK.bank;
        m.position.set(yon * ((yakin ? 3.4 : 5) + Math.random() * (yakin ? 1.5 : 9)), 0, zz); m.rotation.y = g === DEK.bank ? -yon * PI / 2 : Math.random() * 6;
        m.scale.setScalar(0.8 + Math.random() * 0.4); dekorG.add(m);
      }
      for (let zz = 4; zz > -bitis - 4; zz -= 2.2) for (const yon of [-1, 1]) { const m = new THREE.Mesh(DEK.cit, mPlastik); m.position.set(yon * 2.9, 0, zz); dekorG.add(m); }
    }
    function seviyeKur() {
      bitis = iki ? 60 : 38 * Math.pow(1.05, seviye - 1); z = [0, 0];      // her seviyede yol %5 uzar
      bitisG.position.z = -bitis; yolM.scale.z = (bitis + 12) / 50; yolM.position.z = -(bitis + 12) / 2 + 4;
      dekorYap();
    }
    function kosDurus(k, Dd, i, faz) {
      const kos = Math.min(1, enerji[i] / 3), x = iki ? (i ? 1.1 : -1.1) : 0, sev = kutlamaT > 0 && (!iki || kazanan === i);
      k.kok.position.set(x, sev ? Math.abs(Math.sin(kutlamaT * 9)) * 0.6 : 0, -z[i]);
      O.durusSifir(Dd);
      if (sev) { Dd.lKolZ = -2.7 + Math.sin(faz) * 0.3; Dd.rKolZ = 2.7 - Math.sin(faz) * 0.3; Dd.lUst = 0.4; Dd.rUst = 0.4; }
      else if (yakalandiT[i] > 0) { Dd.lKolZ = -2.4; Dd.rKolZ = 2.4; Dd.basX = -0.2; }
      else { Dd.lUst = 0.9 * kos * Math.sin(faz); Dd.rUst = -0.9 * kos * Math.sin(faz); Dd.lAlt = -kos * (0.3 + Math.max(0, Math.cos(faz))); Dd.rAlt = -kos * (0.3 + Math.max(0, -Math.cos(faz))); Dd.lKolX = -0.8 * kos * Math.sin(faz); Dd.rKolX = 0.8 * kos * Math.sin(faz); Dd.lDirX = Dd.rDirX = 1.2 * kos; Dd.govdeX = -0.15 * kos; }
    }
    function sahne_(dt) {
      const faz = O.zaman() * 10;
      kosDurus(ks[0], D, 0, faz); if (iki) { kosDurus(ks[1], D2, 1, faz + 1.3); O.durusUygula(ks[1], D2); }
      const hedefYon = isik === "yesil" ? 0 : PI; bekci.kok.rotation.y = yaklas(bekci.kok.rotation.y, hedefYon, us(dt, 8));
      O.durusSifir(Db); if (isik !== "yesil") { Db.lKolZ = -0.4; Db.rKolZ = 0.4; Db.basZ = Math.sin(O.zaman() * 4) * 0.1; } O.durusUygula(bekci, Db);
      if (iki) { const zOn = Math.max(z[0], z[1]), zArka = Math.min(z[0], z[1]), ara = zOn - zArka; O.hPoz.set(0, 3.6 + ara * 0.35, -zArka + 6.8 + ara * 0.3); O.hBak.set(0, 1.5, -zOn - 8); }
      else { O.hPoz.set(1.5, 3.4, -z[0] + 6.5); O.hBak.set(0, 1.5, -z[0] - 8); }
    }
    return {
      id: iki ? "durkalk2" : "durkalk", esi: iki ? "durkalk" : undefined, ikiKisi: iki, ad: "Dur-Kalk", elSerbest: true, elGerek: false,
      ipucu: iki ? "Yeşilde ikiniz de yerinde koşun, kırmızıda donun! Bitişe ilk varan kazanır" : "Yeşilde yerinde koş, kırmızıda don kal!",
      ogretici: [
        { tr: "Yeşil ışıkta yerinde koş", a: Pz("onde", { bacak: 0.6 }), b: Pz("onde", { bacak: -0.6 }), efekt: "🟢🏃", sonuc: "Oyuncağın ileri koşar" },
        { tr: "Kırmızı ışıkta heykel gibi don!", a: Pz("duz"), b: Pz("duz"), efekt: "🔴🧍", sonuc: "Kıpırdarsan yakalanır, geri dönersin" },
        { tr: "Bitiş çizgisine ulaşınca bir sonraki seviye", a: Pz("yukari"), b: Pz("yana"), efekt: "🏁", sonuc: "" }
      ],
      kur() {
        grup = grupYap(); dekorG = new THREE.Group(); grup.add(dekorG);
        yolM = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 50), new THREE.MeshStandardMaterial({ color: 0xe8c99a, roughness: 1 }));
        yolM.rotation.x = -PI / 2; yolM.position.y = 0.015; yolM.receiveShadow = true; grup.add(yolM);
        bitisG = new THREE.Group(); grup.add(bitisG);
        const l = [p(yKutu(4.6, 0.03, 0.5, 0.01), R.beyaz, 0, 0.03, 0), p(yKutu(3, 0.6, 2.4, 0.1), 0xdba463, 0, 0.3, -4)];
        for (let i = 0; i < 13; i++) { const a = i / 12 * PI; l.push(p(kure(10), CANLI[i % 8], Math.cos(a) * 2.8, Math.sin(a) * 2.8, 0, 0, 0, 0, 0.36, 0.42, 0.36)); }
        bitisG.add(ag(l));
        lamba = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), new THREE.MeshStandardMaterial({ color: 0x46d16a, emissive: 0x46d16a, emissiveIntensity: 0.8 }));
        lamba.position.set(1.8, 3.6, -4); bitisG.add(lamba, ag([p(sil(8), R.gri, 1.8, 1.8, -4, 0, 0, 0, 0.06, 3.4, 0.06)]));
        DEK.agac = agac(); DEK.cam = cam();
        DEK.cali = birlestir([p(kure(10), 0x4cc06a, 0, 0.45, 0, 0, 0, 0, 0.7, 0.55, 0.6), p(kure(10), 0x5fd07c, 0.5, 0.4, 0.2, 0, 0, 0, 0.5, 0.45, 0.5), p(kure(6), R.kirmizi, 0.3, 0.8, 0.4, 0, 0, 0, 0.08)]);
        for (let i = 0; i < 3; i++) { const cl = [p(kure(8), 0x46a14f, 0, 0.1, 0, 0, 0, 0, 0.8, 0.12, 0.5)]; for (let k = 0; k < 7; k++) cl.push(p(sil(4), 0x3a9d5a, (k - 3) * 0.2, 0.25, (k % 2) * 0.2 - 0.1, 0, 0, 0, 0.02, 0.4, 0.02), p(kure(6), [R.pembe, R.sari, R.mor][i], (k - 3) * 0.2, 0.47, (k % 2) * 0.2 - 0.1, 0, 0, 0, 0.1)); DEK["cicek" + i] = birlestir(cl); }
        DEK.bank = birlestir([p(yKutu(1.6, 0.1, 0.5, 0.03), R.ahsap, 0, 0.5, 0), p(yKutu(1.6, 0.45, 0.08, 0.03), R.ahsap, 0, 0.8, -0.24), p(yKutu(0.08, 0.5, 0.45, 0.02), R.siyah, -0.7, 0.25, 0), p(yKutu(0.08, 0.5, 0.45, 0.02), R.siyah, 0.7, 0.25, 0)]);
        DEK.balon = birlestir([p(kure(10), R.kirmizi, 0, 2.6, 0, 0, 0, 0, 0.35, 0.42, 0.35), p(kure(10), R.sari, 0.4, 2.8, 0.1, 0, 0, 0, 0.32, 0.38, 0.32), p(kure(10), R.mavi, -0.35, 2.9, -0.1, 0, 0, 0, 0.32, 0.38, 0.32), p(sil(4), R.beyaz, 0, 1.3, 0, 0, 0, 0, 0.01, 2.6, 0.01), p(yKutu(0.4, 0.3, 0.4, 0.05), R.kahve || 0xa9744f, 0, 0.15, 0)]);
        DEK.cit = birlestir([p(yKutu(0.1, 0.7, 0.1, 0.03), R.beyaz, 0, 0.35, 0), p(yKutu(0.06, 0.08, 2.2, 0.02), R.beyaz, 0, 0.5, -1.1), p(yKutu(0.06, 0.08, 2.2, 0.02), R.beyaz, 0, 0.25, -1.1)]);
      },
      ac() {
        grup.visible = true; O.zeminHarita(cimDoku(), 0.95);
        ks = iki ? O.oyuncular() : [O.karakter()]; n = ks.length;
        ks.forEach((k, i) => O.karakterTak(k, grup, iki ? (i ? 1.1 : -1.1) : 0, 0, 0, 1, 0));
        bekci = iki ? O.ucuncu() : O.diger();
        O.karakterTak(bekci, bitisG, 0, 0.6, -4, 1.8, 0);
        enerji = [0, 0]; yakalandiT = [0, 0]; oncekiV = [null, null]; can = Z().kolay ? 5 : 3; skor = 0; seviye = 1; sure = 0; kutlamaT = 0; kazanan = -1;
        seviyeKur(); isikDegis("yesil");
        if (iki) { O.solYaz(AD[0] + " 0 m"); O.sagYaz(AD[1] + " 0 m"); } else { O.solYaz("0"); O.sagYaz(kalp(can)); }
        O.fov(iki ? 60 : 56); sahne_(0.001);
      },
      kapat() { grup.visible = false; O.zeminHarita(null); },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        sure += dt;
        if (!O.kameraKontrol()) { enerji[0] = (O.tus.ArrowUp || O.tus[" "] || O.isaretci.basili) ? 3 : 0; if (iki) enerji[1] = O.tus.ArrowRight ? 3 : 0; }
        if (kutlamaT > 0) {         // seviye bitti: oyuncak zıplayıp sevinir, sonra yol %5 uzar, park yenilenir
          kutlamaT -= dt; if (Math.random() < 0.4) O.parAt((Math.random() - 0.5) * 3, 2 + Math.random(), -z[Math.max(0, kazanan)], 3, CANLI[rast(8)], 5, 0.12);
          if (kutlamaT <= 0) {
            if (iki) { O.bitir(Math.max(100, Math.round(3000 - sure * 30)), { baslik: "🏆 " + AD[kazanan] + " " + T("kazandı!"), satir: sure.toFixed(1) + " sn" }); return 0; }
            seviye++; seviyeKur(); isikDegis("yesil"); O.sagYaz(kalp(can));
          }
          sahne_(dt); return 0;
        }
        isikT -= dt;
        if (isikT <= 0) isikDegis(isik === "yesil" ? "sari" : isik === "sari" ? "kirmizi" : "yesil");
        const sinir = (Z().kolay ? 2.2 : Z().zor ? 1.1 : 1.5) * O.has();
        for (let i = 0; i < n; i++) {
          if (yakalandiT[i] > 0) { yakalandiT[i] -= dt; z[i] = Math.max(0, z[i] - dt * 12); continue; }
          const kosHiz = Math.min(1, enerji[i] / 3) * (4 + seviye * 0.4);
          if (isik !== "kirmizi") z[i] += kosHiz * dt;
          else if (enerji[i] > sinir && performance.now() - kirmiziBas > 350) {
            yakalandiT[i] = 1.2; O.cal("carp"); O.flas(); O.durumYaz("😮 " + (iki ? AD[i] + " " : "") + T("Yakalandın!"));
            if (!iki) {
              can--; O.sagYaz(kalp(can));
              if (can <= 0) { O.cal("kaybet"); O.bitir(skor, { baslik: "Yakalandın!", satir: T("Seviye") + " " + seviye }); return 0; }
              isikDegis("yesil");
            }
          }
          if (z[i] >= bitis && kutlamaT <= 0) { z[i] = bitis; kazanan = i; skor += 100 * seviye; kutlamaT = 2.2; O.cal("elmas", 0.9, 1.3); O.parAt(0, 1.5, -bitis, 30, 0xffe066, 7, 0.15); O.durumYaz(iki ? "🏆 " + AD[i] + " " + T("kazandı!") : "🏆 " + T("Seviye") + " " + seviye + " " + T("tamam!")); }
        }
        if (iki) { O.solYaz(AD[0] + " " + Math.floor(z[0]) + " m"); O.sagYaz(AD[1] + " " + Math.floor(z[1]) + " m"); } else O.solYaz(String(skor + Math.floor(z[0])));
        sahne_(dt);
        return 0;
      },
      poz(P, dt) {
        const olc = (i, H) => {
          const v = [H.sol.x, H.sol.y, H.sag.x, H.sag.y, H.sol.sx, H.sol.sy, H.sag.sx, H.sag.sy, H.dizSol.x, H.dizSol.y, H.dizSag.x, H.dizSag.y];
          if (oncekiV[i] && dt > 0) { let t = 0; for (let k = 0; k < v.length; k++) t += Math.abs(v[k] - oncekiV[i][k]); const e = t / Math.max(dt, 0.02) / H.tgen / 3; enerji[i] += (e - enerji[i]) * 0.35; }
          oncekiV[i] = v;
        };
        if (iki) O.ikiP().forEach((H, i) => { if (H.var) olc(i, H); else { oncekiV[i] = null; enerji[i] *= 0.9; } }); else olc(0, P);
      },
      onizle() { this.ac(); z = [14, 11]; enerji = [3, 3]; isikDegis("kirmizi"); bekci.kok.rotation.y = PI; sahne_(0.001); }
    };
  }

  // ===================================================================================================
  //  9. İP ATLAMA — ip ayağının altından geçerken zıpla
  // ===================================================================================================
  function ipAtlama() {
    let grup, ip, aci, periyot, py, vy, havada, can, skor, seri, sure, takildiT, gecisHazir;
    const zip = { hazir: true, bekle: 0 };
    let kolHazirIp = true;
    function zipla() { if (!havada && takildiT <= 0) { havada = true; vy = 8; O.cal("zipla", 0.45, 1.2); } }
    function sahne_(dt) {
      ip.rotation.x = aci;
      const k = O.karakter(); k.kok.position.y = 0.1 + py;
      O.durusSifir(D);
      if (havada) { D.lUst = D.rUst = 0.5; D.lAlt = D.rAlt = -1.0; }
      D.lKolZ = -0.55; D.rKolZ = 0.55; D.lDirZ = -0.4; D.rDirZ = 0.4;
      if (takildiT > 0) { D.lKolZ = -2.4; D.rKolZ = 2.4; D.basX = 0.3; }
      O.hPoz.set(0, 2.2, 7.6); O.hBak.set(0, 1.3, 0);
    }
    return {
      id: "ip", ad: "İp Atlama", elSerbest: false, elGerek: false, ipucu: "İp ayağının altından geçerken zıpla!",
      ogretici: [
        { tr: "İp döner; aşağı gelirken zıpla", a: Pz("yanaAsagi"), b: Pz("yanaAsagi", { y: 0.3 }), efekt: "🪢⤴️", sonuc: "Oyuncağın ipin üstünden atlar" },
        { tr: "Küçük bir zıplama yeter", a: Pz("yanaAsagi"), b: Pz("yanaAsagi", { y: 0.15 }), efekt: "👍", sonuc: "" },
        { tr: "İp hızlandıkça daha seri zıpla", a: Pz("yanaAsagi", { y: 0.2 }), b: Pz("yanaAsagi"), efekt: "⚡", sonuc: "" }
      ],
      kur() {
        grup = grupYap();
        const l = []; kupEkle(l, 1.0, 0, R.kirmizi, R.krem, 0.2, -3.6, 0); kupEkle(l, 0.9, 1.0, R.sari, R.krem, -0.3, -3.6, 0); kupEkle(l, 1.0, 0, R.mavi, R.krem, -0.2, 3.6, 0); kupEkle(l, 0.9, 1.0, R.yesil, R.krem, 0.3, 3.6, 0);
        l.push(p(sil(10), R.gri, -3.0, 1.45, 0, 0, 0, PI / 2, 0.08, 0.5, 0.08), p(sil(10), R.gri, 3.0, 1.45, 0, 0, 0, PI / 2, 0.08, 0.5, 0.08));
        grup.add(ag(l));
        const nok = []; for (let i = 0; i <= 24; i++) { const u = i / 24, a = u * PI; nok.push(new THREE.Vector3(-2.8 + u * 5.6, -Math.sin(a) * 1.4, 0)); }
        ip = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(nok), 48, 0.045, 6, false), new THREE.MeshStandardMaterial({ color: 0xff5fa2, roughness: 0.5 }));
        ip.castShadow = true; ip.position.y = 1.45; grup.add(ip);
      },
      ac() {
        grup.visible = true; O.susGoster(true); O.karakterTak(O.karakter(), grup, 0, 0.1, 0, 1, PI);
        aci = PI; periyot = Z().kolay ? 2.1 : Z().zor ? 1.55 : 1.8; py = 0; vy = 0; havada = false; can = Z().kolay ? 5 : 3; skor = 0; seri = 0; sure = 0; takildiT = 0; gecisHazir = true;
        O.solYaz("0"); O.sagYaz(kalp(can)); O.fov(52); sahne_(0.001);
      },
      kapat() { grup.visible = false; O.susGoster(false); },
      bekle(dt) { aci += dt * 2; sahne_(dt); },
      guncelle(dt) {
        const zr = Z(); sure += dt;
        if (takildiT > 0) { takildiT -= dt; sahne_(dt); return 0; }
        const hedefP = Math.max(zr.kolay ? 1.5 : zr.zor ? 0.95 : 1.15, (zr.kolay ? 2.1 : zr.zor ? 1.55 : 1.8) - Math.floor(skor / 15) * 0.04 * zr.rampa);      // yavaş başlar, her 15 atlayışta biraz hızlanır
        periyot += (hedefP - periyot) * us(dt, 1);
        const onceki = aci; aci += 2 * PI * dt / periyot;
        if (havada) { vy -= 21 * dt; py += vy * dt; if (py <= 0) { py = 0; havada = false; } }      // uzun havada kalma: zamanlama affedici
        // ip en altta (açı 2πk) iken ayağın altından geçer
        const ad = Math.floor(onceki / (2 * PI)), ay = Math.floor(aci / (2 * PI));
        if (ay !== ad) {
          if (havada || py > 0.05) { seri++; skor += 1; O.cal("adim1", 0.4, 1.2); if (seri % 10 === 0) { O.cal("elmas", 0.7, 1.3); O.durumYaz("⭐ " + seri); } }
          else {
            can--; seri = 0; takildiT = 1.1; O.cal("carp"); O.flas(); O.durumYaz("Kaçtı!"); O.sagYaz(kalp(can));
            if (can <= 0) { O.cal("kaybet"); O.bitir(skor, { baslik: "İpe takıldın!", satir: "" }); return 0; }
          }
          O.solYaz(String(skor));
        }
        sahne_(dt);
        return 0;
      },
      tus(k) { if (k === " " || k === "ArrowUp") zipla(); },
      dokun() { zipla(); },
      poz(P) {
        if (ziplamaAlgila(zip, P)) zipla();
        // diğer oyunlardaki gibi: iki kolu yanlara / yukarı açmak da zıplatır
        const acik = w => w.g > 0.4 && w.y < w.sy + 0.35 * P.tgovde && (Math.abs(w.x - w.sx) * P.oran > 0.7 * P.tgen * P.oran || w.y < w.sy - 0.5 * P.tgovde);
        const ikisi = acik(P.sol) && acik(P.sag);
        if (ikisi && kolHazirIp) { kolHazirIp = false; zipla(); } else if (!acik(P.sol) && !acik(P.sag)) kolHazirIp = true;
      },
      onizle() { this.ac(); aci = 0.15; py = 0.45; havada = true; sahne_(0.001); }
    };
  }

  // ===================================================================================================
  //  10. SANDAL — iki kürekli sandal: sol el sol kürek, sağ el sağ kürek; ikisi birlikte = düz ve hızlı
  // ===================================================================================================
  function kano(iki = false) {
    const GEN = 8, D2 = O.yeniDurus(), tk = [0, 1].map(() => ({ a: izci(), b: izci(), hazir: true }));
    let ks;
    let grup, suDk, sandal, kurekler = {}, susler = [], nesneler = [], x, baslik, donus, hiz, ekHiz, sure, mesafe, can, dokunulmaz, elmas, sonraki;
    const kurekT = { sol: 0, sag: 0 }, sonCekis = { sol: -9, sag: -9 }; let kenarT = 0, kenarda = false;
    const L = izci(), Rr = izci(); let hazirL = true, hazirR = true;
    const havuz = {}, GEO = {};
    const al = ad => { const h = havuz[ad] || (havuz[ad] = []); let m = h.pop(); if (!m) { m = new THREE.Mesh(GEO[ad], mPlastik); m.castShadow = true; grup.add(m); } m.visible = true; return m; };
    const birak = n => { n.m.visible = false; havuz[n.ad].push(n.m); };
    function ekle(ad, nx, z, r) { const m = al(ad); m.position.set(nx, ad === "kutuk" ? 0.25 : 0, z); m.rotation.y = ad === "kutuk" ? (Math.random() - 0.5) * 0.8 : Math.random() * 6; nesneler.push({ m, ad, x: nx, z, r }); }
    function dalga(z) {
      const zr = Z(), n = zr.kolay ? 1 : zr.zor ? 3 : 2, bos = (Math.random() - 0.5) * (GEN * 2 - 5);
      for (let k = 0; k < n; k++) { let nx; do { nx = (Math.random() - 0.5) * (GEN * 2 - 2); } while (Math.abs(nx - bos) < 2.8); const t = Math.random(); ekle(t < 0.5 ? "kaya" : t < 0.8 ? "kutuk" : "girdap", nx, z - k * 4, t < 0.5 ? 1.0 : t < 0.8 ? 1.4 : 1.3); }
      for (let k = 0; k < 6; k++) O.elmasEkle(bos + Math.sin(k) * 0.6, 0.7, z + 4 + k * 2.2);
    }
    // Kürek çekme: sol el = sol kürek → sandal sağa döner; sağ el = sağ kürek → sola. İkisi birlikte = düz ve hızlı
    function kurekCek(taraf) {
      const simdi = O.zaman(), diger = taraf === "sol" ? "sag" : "sol", ikisi = simdi - sonCekis[diger] < 0.35;
      sonCekis[taraf] = simdi; kurekT[taraf] = 0.55;
      ekHiz = Math.min(ekHiz + (ikisi ? 2.6 : 1.6), 9);
      if (ikisi) donus *= 0.25; else donus += (taraf === "sol" ? 1 : -1) * 0.6;
      O.parAt(x + (taraf === "sol" ? -1.6 : 1.6), 0.15, 0.4, 6, 0xffffff, 3, 0.1); O.cal("adim" + (1 + rast(3)), 0.35, 0.8);
    }
    const skor = () => Math.floor(mesafe / 2) + elmas * 10;
    function sahne_(dt) {
      sandal.position.set(x, 0.1 + Math.sin(O.zaman() * 3) * 0.03, 0); sandal.rotation.set(0, -baslik, Math.sin(O.zaman() * 2) * 0.03);
      if (iki) {      // iki oyuncak yan yana oturur: solda Ponçik sol küreği, sağda Zıpır sağ küreği çeker
        ks.forEach((k, i) => { const ox = i ? 0.42 : -0.42, oz = 0.35; k.kok.position.set(x + ox * Math.cos(baslik) + oz * Math.sin(-baslik), 0.12, -ox * Math.sin(-baslik) + oz * Math.cos(baslik)); k.kok.rotation.set(0, -baslik, 0); });
        [["sol", D], ["sag", D2]].forEach(([t, Dd]) => {
          if (kurekT[t] > 0) kurekT[t] -= dt;
          const f = Math.max(0, kurekT[t]) / 0.55, faz = Math.sin(f * PI), yon = t === "sol" ? -1 : 1;
          kurekler[t].rotation.set(0, yon * (0.5 - faz * 1.0), yon * (0.12 + faz * 0.22));
          O.durusSifir(Dd); Dd.lUst = Dd.rUst = 1.45; Dd.lAlt = Dd.rAlt = -1.3; Dd.kalcaY = -0.32;
          Dd.lKolX = Dd.rKolX = 1.0 + faz * 0.6; Dd.lDirX = Dd.rDirX = 0.5 - faz * 0.4; Dd.lKolZ = yon * 0.35 - 0.2; Dd.rKolZ = yon * 0.35 + 0.2; Dd.govdeX = -0.15 - faz * 0.3; Dd.govdeY = yon * 0.25;
        });
        O.durusUygula(ks[1], D2);
        O.hPoz.set(x * 0.7, 5.0, 9.0); O.hBak.set(x * 0.7, 0.4, -8);
        return;
      }
      const k = O.karakter(); k.kok.position.set(x, 0.05, 0.25); k.kok.rotation.set(0, -baslik, 0);
      O.durusSifir(D); D.lUst = D.rUst = 1.45; D.lAlt = D.rAlt = -1.3; D.kalcaY = -0.32;
      for (const t of ["sol", "sag"]) {
        if (kurekT[t] > 0) kurekT[t] -= dt;
        const f = Math.max(0, kurekT[t]) / 0.55, faz = Math.sin(f * PI), yon = t === "sol" ? -1 : 1;
        const kur = kurekler[t]; kur.rotation.set(0, yon * (0.5 - faz * 1.0), yon * (0.12 + faz * 0.22));
        const kolX = 1.0 + faz * 0.6, dir = 0.5 - faz * 0.4;
        if (t === "sol") { D.lKolX = kolX; D.lDirX = dir; D.lKolZ = -0.35; } else { D.rKolX = kolX; D.rDirX = dir; D.rKolZ = 0.35; }
        D.govdeX = -0.15 - Math.max(kurekT.sol, kurekT.sag) * 0.3;
      }
      O.hPoz.set(x * 0.7, 4.2, 7.8); O.hBak.set(x * 0.7, 0.4, -8);
    }
    return {
      id: iki ? "kano2" : "kano", esi: iki ? "kano" : undefined, ikiKisi: iki, ad: "Sandal", elSerbest: true, elGerek: true,
      ipucu: iki ? "Soldaki kürek çekince sandal sağa, sağdaki çekince sola döner. Birlikte çekin: hızlanın!" : "Sol el sol kürek: sağa döner. Sağ el sağ kürek: sola. İkisi birlikte: hızlan",
      ogretici: [
        { tr: "Sol elin sol kürek: aşağı ve geri çek", a: Pz("duz", { lu: -1.9, ll: -2.4 }), b: Pz("duz", { lu: -0.5, ll: -0.3 }), efekt: "🚣↪️", sonuc: "Sandal sağa döner" },
        { tr: "Sağ elin sağ kürek", a: Pz("duz", { ru: 1.9, rl: 2.4 }), b: Pz("duz", { ru: 0.5, rl: 0.3 }), efekt: "↩️🚣", sonuc: "Sandal sola döner" },
        { tr: "İki kolunu birlikte çek", a: Pz("duz", { lu: -1.9, ll: -2.4, ru: 1.9, rl: 2.4 }), b: Pz("duz"), efekt: "🚣💨", sonuc: "Sandal düz gider ve hızlanır" },
        { tr: "Kayalardan, kütüklerden ve girdaplardan kaç", a: Pz("onde"), b: Pz("onde"), efekt: "🪨🪵🌀", sonuc: "" }
      ],
      kur() {
        grup = grupYap(); suDk = suDoku();
        const su = new THREE.Mesh(new THREE.PlaneGeometry(GEN * 2 + 1, O.ZEMIN_BOY), new THREE.MeshStandardMaterial({ map: suDk, roughness: 0.15, metalness: 0, envMapIntensity: 1.1 }));
        su.rotation.x = -PI / 2; su.position.set(0, 0.03, O.zeminZ); grup.add(su);
        grup.add(ag([p(yKutu(0.6, 0.35, O.ZEMIN_BOY, 0.15), 0xc9a77c, -GEN - 0.6, 0.1, O.zeminZ), p(yKutu(0.6, 0.35, O.ZEMIN_BOY, 0.15), 0xc9a77c, GEN + 0.6, 0.1, O.zeminZ)], false));
        GEO.kaya = kaya(1.1); GEO.girdap = birlestir([0, 1, 2].map(i => p(simit(0.5 + i * 0.4, 0.07, PI * 1.6, 20), i % 2 ? 0xffffff : 0x9fdcff, 0, 0.06, 0, PI / 2, 0, i)));
        GEO.kutuk = birlestir([p(sil(12), 0x8a5a33, 0, 0, 0, 0, 0, PI / 2, 0.3, 2.6, 0.3), p(sil(12), 0xd9b48a, 1.31, 0, 0, 0, 0, PI / 2, 0.28, 0.02, 0.28), p(sil(12), 0xd9b48a, -1.31, 0, 0, 0, 0, PI / 2, 0.28, 0.02, 0.28)]);
        // iki kürekli oyuncak sandal: gövde, oturaklar, ıskarmozlar
        sandal = new THREE.Group();
        sandal.add(ag([p(kure(18), 0x3a86ff, 0, 0.05, 0, 0, 0, 0, 0.95, 0.42, 2.0), p(kure(16), 0x8a5a33, 0, 0.2, 0, 0, 0, 0, 0.8, 0.25, 1.75), p(simit(0.9, 0.07, PI * 2, 28), R.beyaz, 0, 0.32, 0, PI / 2, 0, 0, 1, 2.15, 1),
          p(yKutu(1.5, 0.08, 0.35, 0.03), R.ahsap, 0, 0.4, 0.2), p(yKutu(1.2, 0.08, 0.3, 0.03), R.ahsap, 0, 0.38, 1.2), p(kure(8), R.kirmizi, 0, 0.3, -1.95, 0, 0, 0, 0.14),
          p(sil(8), R.gri, -0.92, 0.45, -0.1, 0, 0, 0, 0.05, 0.22, 0.05), p(sil(8), R.gri, 0.92, 0.45, -0.1, 0, 0, 0, 0.05, 0.22, 0.05)]));
        for (const [t, yon] of [["sol", -1], ["sag", 1]]) {
          const g = new THREE.Group(); g.position.set(yon * 0.92, 0.55, -0.1);
          g.add(ag([p(sil(8), R.koyuAhsap, yon * 0.6, 0, 0, 0, 0, PI / 2, 0.035, 2.0, 0.035), p(yKutu(0.6, 0.04, 0.26, 0.02), R.sari, yon * 1.75, -0.02, 0), p(kure(8), R.kirmizi, -yon * 0.42, 0, 0, 0, 0, 0, 0.06)]));
          sandal.add(g); kurekler[t] = g;
        }
        grup.add(sandal);
        const sg = [agac(), cam(), kaya(1.6)];
        for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(sg[i % 3], mPlastik); m.castShadow = true; grup.add(m); susler.push({ m, yon: i % 2 ? 1 : -1 }); }
      },
      ac() {
        grup.visible = true; O.zeminHarita(cimDoku(), 0.95);
        for (const n of nesneler) birak(n); nesneler = []; O.elmasListe().length = 0;
        sandal.scale.setScalar(iki ? 1.5 : 1);      // iki kişilikte büyük sandal
        if (iki) { ks = O.oyuncular(); ks.forEach(k => O.karakterTak(k, grup, 0, 0.12, 0.35, 0.85, 0)); tk.forEach(t => { t.hazir = true; t.a.var = t.b.var = false; }); }
        else O.karakterTak(O.karakter(), grup, 0, 0.05, 0.25, 1, 0);
        susler.forEach((s, i) => s.m.position.set(s.yon * (GEN + 2.5 + Math.random() * 10), 0, 10 - i * 4.4));
        x = 0; baslik = 0; donus = 0; hiz = 6 * Z().hiz; ekHiz = 0; sure = 0; mesafe = 0; can = Z().kolay ? 5 : 3; dokunulmaz = 0; elmas = 0; sonraki = 0;
        kurekT.sol = kurekT.sag = 0; sonCekis.sol = sonCekis.sag = -9;
        dalga(-45); dalga(-75);
        O.solYaz("0"); O.sagYaz(kalp(can)); O.fov(58); sahne_(0.001);
      },
      kapat() { grup.visible = false; O.zeminHarita(null); for (const n of nesneler) birak(n); nesneler = []; O.elmasListe().length = 0; },
      bekle(dt) { sahne_(dt); },
      guncelle(dt) {
        const zr = Z(); sure += dt; const zor = Math.min(1, sure * zr.rampa / 420);
        if (!O.kameraKontrol()) { const yonT = (O.tus.ArrowRight ? 1 : 0) - (O.tus.ArrowLeft ? 1 : 0); donus += yonT * dt * 2.5; if (O.tus.ArrowUp) ekHiz = Math.min(8, ekHiz + dt * 6); }
        donus *= Math.exp(-dt * 2.2); baslik = sinirla(baslik + donus * dt * 1.6, -0.9, 0.9); baslik *= Math.exp(-dt * 0.6);
        ekHiz *= Math.exp(-dt * 0.9);
        hiz = (6 + 6 * zor) * zr.hiz + ekHiz;
        const adim = hiz * Math.cos(baslik) * dt; mesafe += adim;
        x += Math.sin(baslik) * hiz * dt;
        if (kenarT > 0) kenarT -= dt;
        if (Math.abs(x) > GEN - 1.6) {      // kenara değince içeri döner; ses sadece ilk değişte ve aralıklı
          const yon = Math.sign(x); x = yon * (GEN - 1.6);
          if (Math.sign(baslik) === yon) baslik = -yon * Math.min(0.25, Math.abs(baslik) * 0.5);
          if (Math.sign(donus) === yon) donus = 0;
          if (!kenarda && kenarT <= 0) { O.cal("blok", 0.35); kenarT = 1.2; }
          kenarda = true;
        } else if (Math.abs(x) < GEN - 2.2) kenarda = false;
        if (dokunulmaz > 0) dokunulmaz -= dt;
        suDk.offset.y = (suDk.offset.y + adim / 8) % 1;
        for (const s of susler) { s.m.position.z += adim; if (s.m.position.z > 14) s.m.position.z -= 26 * 4.4; }
        if (mesafe >= sonraki) { dalga(-96); sonraki = mesafe + hiz * (2.6 - zor * 1.0) / zr.yogun; }
        for (let i = nesneler.length - 1; i >= 0; i--) {
          const n = nesneler[i]; n.z += adim; n.m.position.z = n.z; if (n.ad === "girdap") n.m.rotation.y += dt * 3;
          if (dokunulmaz <= 0 && Math.abs(n.z) < (n.ad === "kutuk" ? 0.8 : 1.6) * (iki ? 1.4 : 1) && Math.abs(n.x - x) < n.r + (iki ? 1.3 : 0.9)) {
            if (n.ad === "girdap") { donus += (Math.random() - 0.5) * 4; ekHiz = 0; dokunulmaz = 0.8; O.cal("blok", 0.5); O.durumYaz("🌀"); }
            else {
              can--; dokunulmaz = 1.5; O.cal("carp"); O.cal("vur", 0.7); O.flas(); O.sarsinti(0.35); O.parAt(x, 0.5, 0, 14, 0xffffff, 5, 0.13); O.sagYaz(kalp(can));
              if (can <= 0) { O.cal("kaybet"); O.bitir(skor(), { baslik: "Sandal devrildi!", satir: "💎 " + elmas }); return 0; }
            }
          }
          if (n.z > 14) { birak(n); nesneler[i] = nesneler[nesneler.length - 1]; nesneler.pop(); }
        }
        const l = O.elmasListe();
        for (let i = l.length - 1; i >= 0; i--) { const e = l[i]; e.z += adim; if (Math.abs(e.z) < 1.2 && Math.abs(e.x - x) < (iki ? 1.8 : 1.3)) { elmas++; O.cal("elmas", 0.6); O.parAt(e.x, e.y, e.z, 5, 0x9defff, 3, 0.09); l[i] = l[l.length - 1]; l.pop(); } else if (e.z > 10) { l[i] = l[l.length - 1]; l.pop(); } }
        const gor = dokunulmaz <= 0 || Math.floor(O.zaman() * 12) % 2 === 0; sandal.visible = gor; (iki ? ks : [O.karakter()]).forEach(k => { k.kok.visible = gor; });
        sahne_(dt); O.solYaz(String(skor()));
        return 0;
      },
      tus(k) { if (k === "a" || k === "ArrowLeft") kurekCek("sol"); else if (k === "d" || k === "ArrowRight") kurekCek("sag"); else if (k === " " || k === "ArrowUp") { kurekCek("sol"); kurekCek("sag"); } },
      dokun(px) { kurekCek(px < 0.5 ? "sol" : "sag"); },
      poz(P, dt) {
        const esik = 2.4 / O.has();
        if (iki) {      // soldaki kişi hangi koluyla çekerse çeksin sol kürek; sağdaki kişi sağ kürek
          O.ikiP().forEach((H, i) => {
            if (!H.var) return; const t = tk[i];
            if (H.sol.g > 0.35) izle(t.a, H.sol.x, H.sol.y, H.tgen, H.oran, dt); if (H.sag.g > 0.35) izle(t.b, H.sag.x, H.sag.y, H.tgen, H.oran, dt);
            const v = Math.max(t.a.var ? t.a.vy : 0, t.b.var ? t.b.vy : 0);
            if (t.hazir && v > esik) { t.hazir = false; kurekCek(i ? "sag" : "sol"); } else if (!t.hazir && v < esik * 0.25) t.hazir = true;
          });
          return;
        }
        if (P.sol.g > 0.35) { izle(L, P.sol.x, P.sol.y, P.tgen, P.oran, dt); if (hazirL && L.vy > esik) { hazirL = false; kurekCek("sol"); } else if (!hazirL && L.vy < esik * 0.25) hazirL = true; }
        if (P.sag.g > 0.35) { izle(Rr, P.sag.x, P.sag.y, P.tgen, P.oran, dt); if (hazirR && Rr.vy > esik) { hazirR = false; kurekCek("sag"); } else if (!hazirR && Rr.vy < esik * 0.25) hazirR = true; }
      },
      onizle() { this.ac(); x = -1.5; baslik = 0.2; kurekT.sol = 0.27; kurekT.sag = 0.27; ekle("kaya", 3, -14, 1); ekle("kutuk", -4, -22, 1.4); for (let k = 0; k < 5; k++) O.elmasEkle(-1.2, 0.7, -3 - k * 2.2); sahne_(0.001); }
    };
  }

  // ===================================================================================================
  //  2 KİŞİLİK OYUNCAK KOŞUSU — Oyuncak Koşusu pistinde iki kişi yerinde koşar; aradaki mesafe açıldıkça kamera geri çekilir
  // ===================================================================================================
  function kosuIkili() {
    const BITIS = 120, AD = ["Ponçik", "Zıpır"];
    let grup, bitisG, ks, d = [0, 0], e = [0, 0], dRef, sure, kutlaT, kazanan, basladiT;
    const D2 = O.yeniDurus(), onc = [null, null];
    function kos(k, Dx, en, faz, z, x, kazandi, kaybetti) {
      const kosu = Math.min(1, en / 3);
      k.kok.position.set(x, kazandi ? Math.abs(Math.sin(kutlaT * 9)) * 0.6 : 0, z);
      O.durusSifir(Dx);
      if (kazandi) { Dx.lKolZ = -2.7 + Math.sin(faz) * 0.3; Dx.rKolZ = 2.7 - Math.sin(faz) * 0.3; }
      else if (kaybetti) { Dx.lKolZ = -0.2; Dx.rKolZ = 0.2; Dx.basX = 0.4; Dx.govdeX = 0.15; }
      else { Dx.lUst = 0.9 * kosu * Math.sin(faz); Dx.rUst = -0.9 * kosu * Math.sin(faz); Dx.lAlt = -kosu * (0.3 + Math.max(0, Math.cos(faz))); Dx.rAlt = -kosu * (0.3 + Math.max(0, -Math.cos(faz)));
        Dx.lKolX = -0.8 * kosu * Math.sin(faz); Dx.rKolX = 0.8 * kosu * Math.sin(faz); Dx.lDirX = Dx.rDirX = 1.2 * kosu; Dx.govdeX = -0.15 * kosu; }
    }
    function sahne_() {
      const z0 = -(d[0] - dRef), z1 = -(d[1] - dRef), f = O.zaman() * 11;
      kos(ks[0], D, e[0], f, z0, -1.1, kazanan === 0, kazanan === 1); kos(ks[1], D2, e[1], f + 1.3, z1, 1.1, kazanan === 1, kazanan === 0); O.durusUygula(ks[1], D2);
      const zOn = Math.min(z0, z1), zArka = Math.max(z0, z1), ara = zArka - zOn;
      O.hPoz.set(0, 3.4 + ara * 0.35, zArka + 6.5 + ara * 0.3); O.hBak.set(0, 1.2, zOn - 8);
      bitisG.position.z = -(BITIS - dRef);
    }
    function enerjiOlc(i, H, dt) {
      const v = [H.sol.x, H.sol.y, H.sag.x, H.sag.y, H.dizSol.x, H.dizSol.y, H.dizSag.x, H.dizSag.y], o = onc[i]; onc[i] = v;
      if (!o || dt <= 0) return; let t = 0; for (let k = 0; k < v.length; k++) t += Math.abs(v[k] - o[k]);
      e[i] += (t / Math.max(dt, 0.02) / H.tgen / 3 - e[i]) * 0.35;
    }
    return {
      id: "kosu2", esi: "kosu", ad: "Oyuncak Koşusu", ikiKisi: true, elSerbest: true, elGerek: false, ipucu: "İkiniz de yerinde koşun: hızlı koşan öne geçer!",
      ogretici: [
        { tr: "Yerinde koşun: kim hızlı koşarsa o öne geçer", a: Pz("onde", { bacak: 0.6 }), b: Pz("onde", { bacak: -0.6 }), efekt: "🏃💨", sonuc: "" },
        { tr: "Bitiş çizgisine ilk varan kazanır", a: Pz("duz"), b: Pz("yukari"), efekt: "🏁🏆", sonuc: "" }
      ],
      kur() {
        grup = grupYap(); bitisG = new THREE.Group(); grup.add(bitisG);
        const b = [p(yKutu(6.6, 0.03, 0.6, 0.01), R.beyaz, 0, 0.04, 0)];
        for (let i = 0; i < 15; i++) { const a = i / 14 * PI; b.push(p(kure(10), CANLI[i % 8], Math.cos(a) * 3.6, Math.sin(a) * 3.4, 0, 0, 0, 0, 0.4, 0.48, 0.4)); }
        bitisG.add(ag(b));
      },
      ac() {
        grup.visible = true; O.kosuYol(true); O.zeminHarita(null);
        ks = O.oyuncular(); O.karakterTak(ks[0], grup, -1.1, 0, 0, 1, 0); O.karakterTak(ks[1], grup, 1.1, 0, 0, 1, 0);
        d = [0, 0]; e = [0, 0]; dRef = 0; sure = 0; kutlaT = 0; kazanan = -1; basladiT = 3; onc[0] = onc[1] = null;
        O.solYaz(AD[0] + " 0 m"); O.sagYaz(AD[1] + " 0 m"); O.fov(60); sahne_();
      },
      kapat() { grup.visible = false; O.kosuYol(false); },
      bekle() { sahne_(); },
      guncelle(dt) {
        if (kazanan >= 0) { kutlaT += dt; if (Math.random() < 0.4) O.parAt(kazanan ? 1.1 : -1.1, 2, -(d[kazanan] - dRef), 3, CANLI[rast(8)], 5, 0.12); sahne_(); return 0; }
        if (basladiT > 0) {
          const once = Math.ceil(basladiT); basladiT -= dt; const simdi = Math.ceil(basladiT);
          if (simdi !== once || basladiT > 2.98) { O.durumYaz(simdi > 0 ? String(simdi) : "🏁 " + T("BAŞLA!")); O.cal("adim1", 0.7, simdi > 0 ? 1 : 1.5); }
          e = [0, 0]; sahne_(); return 0;
        }
        sure += dt;
        const [L, Rr] = O.ikiP();
        if (!O.kameraKontrol()) { e = e.map(x => x * Math.exp(-dt * 2.5)); }
        else { if (!L.var) e[0] *= Math.exp(-dt * 3); if (!Rr.var) e[1] *= Math.exp(-dt * 3); }
        const eski = dRef;
        d[0] += Math.min(1, e[0] / 3) * 7 * dt; d[1] += Math.min(1, e[1] / 3) * 7 * dt; dRef = (d[0] + d[1]) / 2;
        O.solYaz(AD[0] + " " + Math.floor(d[0]) + " m"); O.sagYaz(AD[1] + " " + Math.floor(d[1]) + " m");
        if (d[0] >= BITIS || d[1] >= BITIS) {
          kazanan = d[0] >= d[1] ? 0 : 1; O.cal("elmas", 0.9, 1.3); O.parAt(0, 2, -(BITIS - dRef), 40, 0xffe066, 8, 0.15); O.durumYaz("🏆 " + AD[kazanan] + " " + T("kazandı!"));
          setTimeout(() => { if (grup.visible && kazanan >= 0) O.bitir(Math.max(100, Math.round(3000 - sure * 40)), { baslik: "🏆 " + AD[kazanan] + " " + T("kazandı!"), satir: sure.toFixed(1) + " sn" }); }, 2400);
        }
        sahne_();
        return dRef - eski;      // pist, zemin ve oyuncak süsleri akar
      },
      tus(k) { if (k === "a" || k === "A") e[0] = Math.min(4, e[0] + 0.9); if (k === "l" || k === "L" || k === "ArrowRight") e[1] = Math.min(4, e[1] + 0.9); },
      dokun(x) { if (x < 0.5) e[0] = Math.min(4, e[0] + 0.9); else e[1] = Math.min(4, e[1] + 0.9); },
      poz(P, dt) { O.ikiP().forEach((H, i) => { if (H.var) enerjiOlc(i, H, dt); else onc[i] = null; }); },
      onizle() { this.ac(); basladiT = 0; d = [26, 21]; dRef = 23.5; e = [3, 2.6]; sahne_(); }
    };
  }

  // ===================================================================================================
  //  2 KİŞİLİK KAYAK — aynı pistte iki kayakçı, ağaçlar ve kardan adamların arasından birlikte kaçarlar
  // ===================================================================================================
  function kayakIkili() {
    let karT, susListe;
    const kayakGeo = renk => birlestir([p(yKutu(0.16, 0.05, 1.5, 0.02), renk, -0.17, 0.03, -0.1), p(yKutu(0.16, 0.05, 1.5, 0.02), renk, 0.17, 0.03, -0.1), p(yKutu(0.16, 0.1, 0.2, 0.03), renk, -0.17, 0.08, -0.82, -0.6, 0, 0), p(yKutu(0.16, 0.1, 0.2, 0.03), renk, 0.17, 0.08, -0.82, -0.6, 0, 0)]);
    const geo = {
      cam: karliCam(), kardan: kardanAdam(), kaya: kaya(0.8),
      bayrak: birlestir([p(sil(8), R.beyaz, -1.6, 1.0, 0, 0, 0, 0, 0.05, 2.0, 0.05), p(yKutu(0.7, 0.45, 0.04, 0.02), R.kirmizi, -1.25, 1.75, 0), p(sil(8), R.beyaz, 1.6, 1.0, 0, 0, 0, 0, 0.05, 2.0, 0.05), p(yKutu(0.7, 0.45, 0.04, 0.02), R.mavi, 1.95, 1.75, 0)]),
      rampa: birlestir([p(new THREE.CylinderGeometry(0.01, 1.4, 0.8, 4, 1), 0xe6f2ff, 0, 0.4, 0, 0, PI / 4, 0, 1, 1, 1.4), p(yKutu(2.0, 0.05, 1.2, 0.02), 0x9fd0ff, 0, 0.42, 0, -0.35, 0, 0)])
    };
    return yarisIkili(O, {
      id: "kayak2", esi: "kayak", ad: "Kayak", yari: 8, bitis: 1300, hiz0: 14, hiz1: 26, yanHiz: 9, donusYum: 6, kamY: 6.5, kamZ: 9, geo, zipla: true,
      ipucu: "İkiniz de sağa sola yatarak kayın, engellerden birlikte kaçın",
      kur() { karT = karDoku(); susListe = [karliCam(), karliCam(), kardanAdam(), kaya(1.2)]; },
      ac() { O.zeminHarita(karT, 0.9); O.susGoster(true, susListe); },
      kapat() { O.zeminHarita(null); O.susGoster(false); },
      kaydir(adim) { karT.offset.y = (karT.offset.y + adim / 12) % 1; },
      aracYap(g, i) { const m = new THREE.Mesh(kayakGeo(i ? R.mavi : R.pembe), mPlastik); m.castShadow = true; g.add(m); g.userData.kayak = m; },
      karakterBagla(a, k) { O.karakterTak(k, a, 0, 0, 0, 1, 0); },
      aracDurus(a, s) { a.position.y = s.py; a.rotation.set(0, -s.yon * 0.35, -s.yon * 0.35); },
      durus(Dd, s) {
        Dd.lUst = Dd.rUst = 0.6; Dd.lAlt = Dd.rAlt = -1.0; Dd.kalcaY = -0.14; Dd.govdeX = -0.35; Dd.basX = 0.25; Dd.lKolX = Dd.rKolX = 0.5; Dd.lKolZ = -0.25; Dd.rKolZ = 0.25; Dd.lDirX = Dd.rDirX = 0.4;
        if (s.havada) { Dd.lUst = Dd.rUst = 1.1; Dd.lAlt = Dd.rAlt = -1.5; }
      },
      dalga(z, ekle) {
        const t = Math.random();
        if (t < 0.3) { const gx = (Math.random() - 0.5) * 9; ekle("bayrak", gx, z, { tur: "bonus", bx: 1.6, bz: 0.9 }); for (let k = 0; k < 4; k++) O.elmasEkle(gx, 0.9, z + 6 + k * 2.4); }
        else if (t < 0.42) ekle("rampa", (Math.random() - 0.5) * 9, z, { tur: "rampa", bx: 1.3, bz: 0.9 });
        else {
          const n = Z().kolay ? 2 : Z().zor ? 4 : 3, bos = [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12];
          for (let k = 0; k < n; k++) { let nx, dene = 0; do { nx = (Math.random() - 0.5) * 14; dene++; } while (bos.some(b => Math.abs(nx - b) < 2.6) && dene < 20); const ad = Math.random() < 0.55 ? "cam" : Math.random() < 0.5 ? "kardan" : "kaya"; ekle(ad, nx, z - k * 3, { ry: Math.random() * 6, bx: 1.25, bz: 0.9 }); }
        }
      },
      girdi(H) {
        const egim = Math.atan2(H.sag.sy - H.sol.sy, (H.sag.sx - H.sol.sx) * H.oran), kayma = (H.ox - H.tx) / H.tgen;
        return egri((egim / 0.45 + kayma * 0.6) * O.has(), 0.12, 1.4);
      }
    });
  }

  return [kus(), vurus(), duvar(), kaleci(), davulcu(), kayak(), yuzme(), durKalk(), ipAtlama(), kano(), kosuIkili(), kayakIkili(), yuzme(true), durKalk(true), kano(true)];
}
