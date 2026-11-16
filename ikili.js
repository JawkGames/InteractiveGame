// Interactive Game — 2 kişilik yarış çekirdeği (Oyuncak Yarış, Gazlı Motor, Kayak).
// Aynı yolda iki araç: solda Ponçik (ekranın solundaki kişi), sağda Zıpır (sağdaki kişi). Dünya iki aracın ortalamasına göre akar;
// öndeki öne, geride kalan kameraya doğru kayar. Kamera ikisini de kadrajda tutar (aradaki mesafe açıldıkça yükselir ve geri çekilir).
// Çarpan araç birkaç saniye yavaşlar (can yok). Bitişe ilk varan kazanır.
export default function yarisIkili(O, c) {
  const { THREE, sahne, PI, sinirla, rast, Z } = O;
  const T = s => O.t(s), us = (dt, k) => 1 - Math.exp(-dt * k);
  const AD = ["Ponçik", "Zıpır"];
  let grup, dunya, araclar, trafik = [], sure, sonraki, bitti, kutlaT, kazanan, dRef, bitisG;
  const pl = [0, 1].map(() => ({}));
  const havuz = {};
  const al = ad => { const h = havuz[ad] || (havuz[ad] = []); let m = h.pop(); if (!m) { m = new THREE.Mesh(c.geo[ad], O.mPlastik); m.castShadow = m.receiveShadow = true; grup.add(m); } m.visible = true; return m; };
  const birak = t => { t.ag.visible = false; havuz[t.ad].push(t.ag); };
  function ekle(ad, x, z, ek = {}) { const m = al(ad); m.position.set(x, ek.y || 0, z); m.rotation.y = ek.ry || 0; trafik.push({ ag: m, ad, x, z, hiz: ek.hiz || 0, bx: ek.bx || 1.2, bz: ek.bz || 1.5, tur: ek.tur || "engel", alindi: [false, false] }); }
  function yerlestir(dt) {
    const k = O.oyuncular(), t = O.zaman();
    pl.forEach((s, i) => {
      const a = araclar[i]; a.position.set(s.x, 0, s.z); c.aracDurus(a, s, t);
      a.visible = s.dok <= 0 || Math.floor(t * 12) % 2 === 0;
      const Dd = i ? s.D : O.D; O.durusSifir(Dd); c.durus(Dd, s, k[i], t); if (i) O.durusUygula(k[1], Dd);
    });
    const zOn = Math.min(pl[0].z, pl[1].z), zArka = Math.max(pl[0].z, pl[1].z), ara = zArka - zOn, xm = (pl[0].x + pl[1].x) / 2;
    O.hPoz.set(xm * 0.5, c.kamY + ara * 0.4, zArka + c.kamZ + ara * 0.3); O.hBak.set(xm * 0.5, 0.8, zOn - 9);
    if (bitisG) bitisG.position.z = -(c.bitis - dRef);
  }
  return {
    id: c.id, ad: c.ad, esi: c.esi, ikiKisi: true, elSerbest: true, elGerek: !!c.elGerek, ipucu: c.ipucu,
    kur() {
      grup = new THREE.Group(); grup.visible = false; sahne.add(grup);
      c.kur(grup);
      araclar = [0, 1].map(i => { const g = new THREE.Group(); c.aracYap(g, i); grup.add(g); return g; });
      pl[1].D = O.yeniDurus();
      bitisG = new THREE.Group(); grup.add(bitisG);
      const l = [O.p(O.yKutu(c.yari * 2, 0.03, 0.8, 0.01), O.R.beyaz, 0, 0.04, 0)];
      for (let i = 0; i < 19; i++) { const a = i / 18 * PI; l.push(O.p(O.kure(10), O.CANLI[i % 8], Math.cos(a) * (c.yari + 0.4), Math.sin(a) * (c.yari * 0.7 + 1), 0, 0, 0, 0, 0.5, 0.6, 0.5)); }
      const m = new THREE.Mesh(O.birlestir(l), O.mPlastik); m.castShadow = true; bitisG.add(m);
    },
    ac() {
      grup.visible = true; c.ac && c.ac();
      for (const t of trafik) birak(t); trafik = []; O.elmasListe().length = 0;
      const k = O.oyuncular();
      pl.forEach((s, i) => { Object.assign(s, { x: i ? c.yari * 0.4 : -c.yari * 0.4, yon: 0, hedef: 0, d: 0, z: 0, v: 0, yavasT: 0, dok: 0, hizlanT: 0, zip: { hazir: true, bekle: 0 }, py: 0, vy: 0, havada: false }); c.karakterBagla(araclar[i], k[i], i); });
      sure = 0; sonraki = 0; bitti = false; kutlaT = 0; kazanan = -1; dRef = 0;
      c.dalga(-50, ekle); c.dalga(-80, ekle);
      O.solYaz(AD[0] + " 0 m"); O.sagYaz(AD[1] + " 0 m"); O.fov(62); yerlestir(0);
    },
    kapat() { grup.visible = false; c.kapat && c.kapat(); for (const t of trafik) birak(t); trafik = []; O.elmasListe().length = 0; },
    bekle(dt) { yerlestir(dt); },
    guncelle(dt) {
      const zr = Z();
      if (bitti) {
        kutlaT += dt; const s = pl[kazanan];
        if (Math.random() < 0.5) O.parAt(s.x, 2.2, s.z, 3, O.CANLI[rast(8)], 5, 0.12);
        if (kutlaT > 2.4) { bitti = false; O.bitir(Math.round(dRef), { baslik: "🏆 " + AD[kazanan] + " " + T("kazandı!"), satir: AD[0] + " " + Math.floor(pl[0].d) + " m  •  " + AD[1] + " " + Math.floor(pl[1].d) + " m" }); kazanan = -1; }
        yerlestir(dt); return 0;
      }
      sure += dt; const zor = Math.min(1, sure * zr.rampa / 300), taban = (c.hiz0 + (c.hiz1 - c.hiz0) * zor) * zr.hiz;
      if (!O.kameraKontrol()) { pl[0].hedef = (O.tus.d ? 1 : 0) - (O.tus.a ? 1 : 0); pl[1].hedef = (O.tus.ArrowRight ? 1 : 0) - (O.tus.ArrowLeft ? 1 : 0); }
      const eski = dRef;
      pl.forEach(s => {
        if (s.yavasT > 0) s.yavasT -= dt; if (s.dok > 0) s.dok -= dt; if (s.hizlanT > 0) s.hizlanT -= dt;
        s.yon += (s.hedef - s.yon) * us(dt, c.donusYum || 7);
        s.x = sinirla(s.x + s.yon * c.yanHiz * dt, -c.yari + 0.9, c.yari - 0.9);
        s.v = taban * (s.yavasT > 0 ? 0.45 : 1) * (s.hizlanT > 0 ? 1.25 : 1); s.d += s.v * dt;
        if (s.havada) { s.vy -= 22 * dt; s.py += s.vy * dt; if (s.py <= 0) { s.py = 0; s.havada = false; } }
      });
      if (Math.abs(pl[0].x - pl[1].x) < 1.5 && Math.abs(pl[0].z - pl[1].z) < 2.2) { const it = pl[0].x < pl[1].x ? -1 : 1; pl[0].x += it * dt * 3; pl[1].x -= it * dt * 3; }      // birbirinin içinden geçmesinler
      dRef = (pl[0].d + pl[1].d) / 2; const adim = dRef - eski;
      pl.forEach(s => { s.z = -(s.d - dRef); });
      if (dRef >= sonraki && dRef < c.bitis - 60) { c.dalga(-94, ekle); sonraki = dRef + taban * (2.0 - zor * 0.7) / zr.yogun; }
      for (let i = trafik.length - 1; i >= 0; i--) {
        const t = trafik[i]; t.z += adim - t.hiz * dt; t.ag.position.z = t.z;
        pl.forEach((s, j) => {
          if (t.alindi[j] || Math.abs(t.z - s.z) > t.bz || Math.abs(t.x - s.x) > t.bx) return;
          if (t.tur === "bonus") { t.alindi[j] = true; s.hizlanT = 1.2; O.cal("elmas", 0.8, 1.4); O.parAt(t.x, 1.2, t.z, 12, 0xffe066, 5, 0.12); return; }
          if (t.tur === "rampa") { t.alindi[j] = true; if (!s.havada) { s.havada = true; s.vy = 9; O.cal("zipla", 0.6); } return; }
          if (s.dok > 0 || (s.havada && s.py > 0.9)) return;
          t.alindi[j] = true; s.yavasT = 2.2; s.dok = 2.2; O.cal("carp"); O.cal("vur", 0.7); O.sarsinti(0.25); O.parAt(s.x, 0.9, s.z, 14, 0xffe066, 5, 0.13);
          O.durumYaz("💥 " + AD[j]);
        });
        if (t.z > 16) { birak(t); trafik[i] = trafik[trafik.length - 1]; trafik.pop(); }
      }
      const l = O.elmasListe();
      for (let i = l.length - 1; i >= 0; i--) {
        const e = l[i]; e.z += adim; let al_ = false;
        pl.forEach(s => { if (!al_ && Math.abs(e.z - s.z) < 1.3 && Math.abs(e.x - s.x) < 1.2) { al_ = true; s.hizlanT = Math.max(s.hizlanT, 0.5); } });
        if (al_) { O.cal("elmas", 0.6); O.parAt(e.x, e.y, e.z, 5, 0x9defff, 3.2, 0.09); }
        if (al_ || e.z > 12) { l[i] = l[l.length - 1]; l.pop(); }
      }
      c.kaydir && c.kaydir(adim);
      O.solYaz(AD[0] + " " + Math.floor(pl[0].d) + " m"); O.sagYaz(AD[1] + " " + Math.floor(pl[1].d) + " m");
      const bit = pl.findIndex(s => s.d >= c.bitis);
      if (bit >= 0) { bitti = true; kutlaT = 0; kazanan = pl[0].d >= pl[1].d ? 0 : 1; O.cal("elmas", 1, 1.3); O.parAt(0, 2, -(c.bitis - dRef), 40, 0xffe066, 8, 0.15); O.durumYaz("🏆 " + AD[kazanan] + " " + T("kazandı!")); }
      yerlestir(dt);
      return adim;
    },
    poz(P, dt) {
      const [L, Rr] = O.ikiP();
      [L, Rr].forEach((H, i) => { if (!H.var) return; const s = pl[i]; s.hedef = c.girdi(H, s); if (c.zipla && O.ziplaAlgila(s.zip, H) && !s.havada) { s.havada = true; s.vy = 8; O.cal("zipla", 0.5); } });
    },
    onizle() { this.ac(); pl[0].d = 30; pl[1].d = 24; dRef = 27; pl.forEach(s => { s.z = -(s.d - dRef); }); pl[0].x = -1.6; pl[1].x = 1.8; pl[0].yon = -0.3; pl[1].yon = 0.3; c.dalga(-18, ekle); yerlestir(0); }
  };
}
