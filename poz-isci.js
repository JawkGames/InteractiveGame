// Hareket algılama iş parçacığı (modül worker).
// Kamera karesini ana sayfadan alır, vücut noktalarını bulur, sadece gereken 13 noktayı geri yollar.
// Böylece algılama oyunun çizimini hiç bekletmez.
let alg = null;
// burun, omuzlar, dirsekler, bilekler, kalçalar | dizler, ayak bilekleri
const NOKTA = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

// Düzen: [0..26] ilk 9 nokta (x, y, görünürlük) · [27..35] ilk 9 noktanın derinliği (z)
//        [36..47] dizler + ayak bilekleri (x, y, görünürlük) · [48..51] onların derinliği
// En çok 2 kişi: her kişi 52 sayı, art arda (ana oyuncuyu sayfa seçer, arkadaki kişiyi fark eder)
function paketle(sonuc) {
  const l = sonuc && sonuc.landmarks;
  if (!l || !l.length) return null;
  const v = new Float32Array(52 * l.length);
  l.forEach((n, k) => {
    const o = k * 52;
    for (let i = 0; i < 13; i++) {
      const q = n[NOKTA[i]], g = q.visibility === undefined ? 1 : q.visibility;
      if (i < 9) { v[o + i * 3] = q.x; v[o + i * 3 + 1] = q.y; v[o + i * 3 + 2] = g; v[o + 27 + i] = q.z || 0; }
      else { const j = i - 9; v[o + 36 + j * 3] = q.x; v[o + 37 + j * 3] = q.y; v[o + 38 + j * 3] = g; v[o + 48 + j] = q.z || 0; }
    }
  });
  return v;
}

self.onmessage = async (e) => {
  const m = e.data;
  if (m.tip === "kur") {
    try {
      const v = await import(m.kutuphane);
      const ayar = (delege) => ({
        baseOptions: { modelAssetPath: m.model, delegate: delege },
        runningMode: "VIDEO", numPoses: 2,
        minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5
      });
      let delege = "GPU";
      // Wasm yükleyicisini bir kez al; GPU olmazsa CPU ile ikinci kez kurabilmek için elde tutulur
      const fabrika = (await import(m.wasm + "/vision_wasm_module_internal.js")).default;
      const fs = { wasmBinaryPath: m.wasm + "/vision_wasm_module_internal.wasm" };
      const kur = (delege) => { self.ModuleFactory = fabrika; return v.PoseLandmarker.createFromOptions(fs, ayar(delege)); };
      try { alg = await kur("GPU"); }
      catch (h) { delege = "CPU"; alg = await kur("CPU"); }
      self.postMessage({ tip: "hazir", delege });
    } catch (h) {
      self.postMessage({ tip: "hata", mesaj: String((h && h.message) || h) });
    }
  } else if (m.tip === "kare") {
    let veri = null, hata = null;
    try { veri = paketle(alg.detectForVideo(m.bmp, m.zaman)); } catch (h) { hata = String((h && h.message) || h); }
    try { m.bmp.close(); } catch (h) {}
    self.postMessage({ tip: "sonuc", veri, hata, zaman: m.zaman }, veri ? [veri.buffer] : []);
  }
};
