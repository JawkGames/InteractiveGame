// Hareket algılama iş parçacığı (modül worker).
// Kamera karesini ana sayfadan alır, vücut noktalarını bulur, sadece gereken 9 noktayı geri yollar.
// Böylece algılama oyunun çizimini hiç bekletmez.
let alg = null;
const NOKTA = [0, 11, 12, 13, 14, 15, 16, 23, 24]; // burun, omuzlar, dirsekler, bilekler, kalçalar

function paketle(sonuc) {
  const n = sonuc && sonuc.landmarks && sonuc.landmarks[0];
  if (!n) return null;
  const v = new Float32Array(27);
  for (let i = 0; i < 9; i++) {
    const q = n[NOKTA[i]];
    v[i * 3] = q.x; v[i * 3 + 1] = q.y; v[i * 3 + 2] = q.visibility === undefined ? 1 : q.visibility;
  }
  return v;
}

self.onmessage = async (e) => {
  const m = e.data;
  if (m.tip === "kur") {
    try {
      const v = await import(m.kutuphane);
      // Wasm yükleyicisini bir kez al; GPU olmazsa CPU ile ikinci kez kurabilmek için elde tutulur
      const fabrika = (await import(m.wasm + "/vision_wasm_module_internal.js")).default;
      const fs = { wasmBinaryPath: m.wasm + "/vision_wasm_module_internal.wasm" };
      const kur = (delege) => { self.ModuleFactory = fabrika; return v.PoseLandmarker.createFromOptions(fs, ayar(delege)); };
      const ayar = (delege) => ({
        baseOptions: { modelAssetPath: m.model, delegate: delege },
        runningMode: "VIDEO", numPoses: 1,
        minPoseDetectionConfidence: 0.5, minPosePresenceConfidence: 0.5, minTrackingConfidence: 0.5
      });
      let delege = "GPU";
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
