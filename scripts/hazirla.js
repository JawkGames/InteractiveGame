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
  // Telefon eklentileri (Capacitor, AdMob, Google Play satın alma): sadece uygulamaya eklenir, web sürümünü etkilemez
  const lib = path.join(www, "lib"); fs.mkdirSync(lib);
  const nm = path.join(kok, "node_modules");
  fs.copyFileSync(path.join(nm, "@capacitor/core/dist/capacitor.js"), path.join(lib, "capacitor.js"));
  fs.copyFileSync(path.join(nm, "@capacitor-community/admob/dist/plugin.js"), path.join(lib, "admob.js"));
  fs.copyFileSync(path.join(nm, "@capgo/native-purchases/dist/plugin.js"), path.join(lib, "satin.js"));
  const ix = path.join(www, "index.html");
  fs.writeFileSync(ix, fs.readFileSync(ix, "utf8").replace("<script type=\"module\">",
    '<script src="lib/capacitor.js"></script>\n<script src="lib/admob.js"></script>\n<script src="lib/satin.js"></script>\n<script type="module">'));
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
  // AdMob uygulama kimliği, reklam kimliği izni, Google Play satın alma izni
  const ADMOB = "ca-app-pub-7983529419004158~6435142212";
  if (!m.includes("gms.ads.APPLICATION_ID")) m = m.replace(/<application([^>]*)>/, `<application$1>\n        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="${ADMOB}" />`);
  if (!m.includes("permission.AD_ID")) m = m.replace("<application", '<uses-permission android:name="com.google.android.gms.permission.AD_ID" />\n    <application');
  if (!m.includes("vending.BILLING")) m = m.replace("<application", '<uses-permission android:name="com.android.vending.BILLING" />\n    <application');
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
