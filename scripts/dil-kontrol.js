// Çeviri dosyalarını denetler: node scripts/dil-kontrol.js
// dil/<kod>.js dizisi index.html'deki EN sözlüğüyle aynı uzunlukta olmalı; her 10 girdide /*N*/ işareti dizi konumuyla eşleşmeli (kayma denetimi).
const fs = require("fs"), path = require("path");
const kok = path.join(__dirname, ".."), html = fs.readFileSync(path.join(kok, "index.html"), "utf8");
const en = eval("({" + html.match(/const EN = \{([\s\S]*?)\n\};/)[1] + "})"), n = Object.keys(en).length;
let hata = 0;
for (const f of fs.readdirSync(path.join(kok, "dil")).filter(x => x.endsWith(".js"))) {
  const kaynak = fs.readFileSync(path.join(kok, "dil", f), "utf8");
  const dizi = eval("(" + kaynak.replace(/export default /, "").replace(/;\s*$/, "") + ")");
  if (dizi.length !== n) { console.log(f, "UZUNLUK", dizi.length, "!=", n); hata++; continue; }
  const bos = dizi.map((v, i) => v ? -1 : i).filter(i => i >= 0); if (bos.length) console.log(f, "boş girdiler:", bos.join(","));
  // işaret denetimi: /*N*/ yorumundan hemen sonra gelen girdinin konumu N olmalı
  let say = 0, kalan = kaynak, m; const re = /\/\*(\d+)\*\//g;
  while ((m = re.exec(kaynak))) { const once = kaynak.slice(0, m.index); const sayim = (once.match(/"(?:[^"\\]|\\.)*"\s*,/g) || []).length; if (sayim !== +m[1]) { console.log(f, "KAYMA: /*" + m[1] + "*/ konumunda", sayim); hata++; break; } }
}
console.log(hata ? "HATA VAR" : "Tamam: " + n + " girdi");
