# Playas GC 🌊

App Android con el viento, el oleaje, las mareas y la temperatura del agua de 39 playas de Gran Canaria.
Solo aparecen en el listado las playas para las que llegan datos.

## Fuentes (todas públicas y sin clave)

| Fuente | Qué da | Playas |
|---|---|---|
| **AEMET**, predicción de playas (XML `aemet.es/xml/playas/play_v2_<código>.xml`) | Viento y oleaje (débil / moderado / fuerte) de mañana y tarde, temperatura del agua, UV y temperatura máxima, para 3 días | 17 playas oficiales |
| **Instituto Hidrográfico de la Marina** (tabla de mareas de la web de AEMET) | Horas de pleamar y bajamar | Las mismas 17 |
| **Open-Meteo**, Forecast API | Viento actual, rachas y dirección, viento hora a hora, UV y temperatura del aire | Las 39 |
| **Open-Meteo**, Marine API (modelos de oleaje y Copernicus Marine) | Altura, periodo y dirección de la ola, temperatura del mar y curva de marea de 48 h | Las 39 |

El estado *tranquila / precaución / fuerte* es una estimación hecha a partir del oleaje y el viento.
**No es la bandera oficial**: manda siempre la del socorrista.

## Cómo sacar el APK

### Opción A: GitHub Actions (no hace falta instalar nada)
1. Crea un repositorio en GitHub (puede ser privado) y sube esta carpeta tal cual.
   Hay que incluir la carpeta oculta `.github`.
2. Abre la pestaña **Actions**. El workflow **"Compilar APK"** arranca solo (tarda unos 3 minutos).
3. Cuando termine, entra en la ejecución y descarga el artefacto **PlayasGC-apk**. Es un zip con `app-debug.apk`.
4. Pasa el APK al móvil y ábrelo. Android te pedirá permitir "instalar apps de origen desconocido".

### Opción B: Android Studio
1. Abre la carpeta con *File → Open*.
2. Espera a que termine el *Gradle sync*.
3. Ve a *Build → Build App Bundle(s) / APK(s) → Build APK(s)*.

Si prefieres la terminal, con el Android SDK instalado: `gradlew assembleDebug`.
El APK queda en `app/build/outputs/apk/debug/`.

## Versión web

Es la misma página que lleva el APK. En el ordenador se ve como en el móvil: una columna centrada con espacio a los lados.

```
npm start          # o: node web/server.js
```
Luego abre http://localhost:3000 (puedes cambiar el puerto con `PORT=8080 npm start`).

Hace falta el servidorcito (`web/server.js`, Node 18+, sin dependencias) porque AEMET no deja que una web le pida datos directamente desde el navegador (CORS).
El servidor sirve la página y hace de puente solo para las rutas de playas de AEMET, con 10 minutos de caché.
Open-Meteo sí permite CORS y se consulta directamente.
Para publicarla en internet, súbelo a cualquier hosting con Node (Render, Railway, un VPS…) con `npm start`.

## Estructura
- `app/src/main/assets/www/index.html`: toda la app, compartida por el APK y la web (HTML + CSS + JS en un solo archivo). Para añadir playas, edita el array `BEACHES`.
- `app/src/main/java/.../MainActivity.java`: el WebView que carga la app. Permite peticiones a AEMET sin bloqueos CORS.
- `web/server.js`: servidor de la versión web y puente con AEMET.
- `.github/workflows/build-apk.yml`: compilación automática.
