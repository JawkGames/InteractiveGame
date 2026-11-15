// Android derlemesi için hazırlık (GitHub Actions çalıştırır):
//   node scripts/hazirla.js www      -> oyun dosyalarını www/ klasörüne kopyalar
//   node scripts/hazirla.js config   -> capacitor.config.json oluşturur
//   node scripts/hazirla.js android  -> yatay ekran, kamera izni, sürüm numarası, imza ayarlarını ekler
const fs = require("fs");
const path = require("path");

const kok = path.join(__dirname, "..");
const PAKET = "com.jawk.interactivegame";
const AD = "Interactive Game";
const adim = process.argv[2];

if (adim === "www") {
  const www = path.join(kok, "www");
  fs.rmSync(www, { recursive: true, force: true });
  fs.mkdirSync(www);
  for (const f of ["index.html", "oyunlar.js", "poz-isci.js"]) fs.copyFileSync(path.join(kok, f), path.join(www, f));
  fs.cpSync(path.join(kok, "assets"), path.join(www, "assets"), { recursive: true });
  console.log("www hazır");
}

if (adim === "config") {
  fs.writeFileSync(path.join(kok, "capacitor.config.json"), JSON.stringify({
    appId: PAKET,
    appName: AD,
    webDir: "www",
    android: { backgroundColor: "#d9eeff" }
  }, null, 2));
  console.log("capacitor.config.json yazıldı");
}

if (adim === "android") {
  const app = path.join(kok, "android/app");

  // AndroidManifest: kamera izni (hareket algılama), kamera zorunlu değil (yoksa dokunmatikle oynanır), yatay ekran
  const man = path.join(app, "src/main/AndroidManifest.xml");
  let m = fs.readFileSync(man, "utf8");
  if (!m.includes("permission.CAMERA")) m = m.replace("<application", '<uses-permission android:name="android.permission.CAMERA" />\n    <uses-feature android:name="android.hardware.camera.front" android:required="false" />\n    <uses-feature android:name="android.hardware.camera" android:required="false" />\n    <application');
  if (!m.includes("screenOrientation")) m = m.replace("<activity", '<activity\n            android:screenOrientation="sensorLandscape"');
  fs.writeFileSync(man, m);

  // Sürüm numarası (her derlemede artar, Play Console bunu ister)
  const gradle = path.join(app, "build.gradle");
  const no = process.env.GITHUB_RUN_NUMBER || "1";
  let g = fs.readFileSync(gradle, "utf8");
  g = g.replace(/versionCode \d+/, `versionCode ${no}`).replace(/versionName "[^"]*"/, `versionName "1.0.${no}"`);
  // Yayın imzası (GitHub Secrets'ta keystore varsa)
  if (process.env.KEYSTORE_PATH && !g.includes("signingConfigs")) {
    g = g.replace("    buildTypes {", `    signingConfigs {
        release {
            storeFile file(System.getenv("KEYSTORE_PATH"))
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias System.getenv("KEY_ALIAS")
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {`).replace("minifyEnabled false", "minifyEnabled false\n            signingConfig signingConfigs.release");
  }
  fs.writeFileSync(gradle, g);

  // Simgeler: android-res/ varsa projenin res klasörüne kopyalanır
  const kaynak = path.join(kok, "android-res");
  if (fs.existsSync(kaynak)) fs.cpSync(kaynak, path.join(app, "src/main/res"), { recursive: true });

  console.log("Android ayarlandı. Paket:", PAKET, "sürüm:", no);
}
