import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { LocateFixed, Plus, Minus, ChevronDown, Satellite, Map } from "lucide-react";
import { toast } from "sonner";
import AnimalCard from "./AnimalCard";
import AnimalSearch from "./AnimalSearch";
import { ANIMALS, type Animal, type Language, getAnimalName } from "@/data/animals";

const ZOO_CENTER: [number, number] = [41.387, 2.189];
const ZOO_DEFAULT_ZOOM = 17;

// ─── Barcelona bounds — карта не вийде за ці межі ────────────────────────────
const BARCELONA_BOUNDS: L.LatLngBoundsExpression = [
  [41.32, 2.08], // SW
  [41.47, 2.29], // NE
];

// ─── User location dot marker ─────────────────────────────────────────────────

const USER_LOCATION_ICON = L.divIcon({
  className: "user-location-dot",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 0 0 2px #2563eb,0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ─── Language config ──────────────────────────────────────────────────────────

const LANGUAGES: { code: Language; flag: string; label: string }[] = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "ua", flag: "🇺🇦", label: "UA" },
  { code: "de", flag: "🇩🇪", label: "DE" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "pl", flag: "🇵🇱", label: "PL" },
];

const UI_TEXTS: Record<Language, {
  locating: string; routeTo: string; stop: string; direct: string;
  geoError: string; geoTimeout: string; geoDenied: string;
  satellite: string; mapView: string; caching: string; cached: string;
}> = {
  en: { locating: "Locating...",        routeTo: "Route to",   stop: "Stop",  direct: "Direct path",    geoError: "Could not get location",      geoTimeout: "GPS timeout — try again",        geoDenied: "Location access denied",      satellite: "Satellite", mapView: "Map",   caching: "Saving map offline...", cached: "Map saved offline ✓" },
  ua: { locating: "Шукаємо вас...",     routeTo: "Маршрут до", stop: "Стоп",  direct: "Прямий шлях",    geoError: "Не вдалось визначити місце",   geoTimeout: "GPS не відповів — спробуйте",    geoDenied: "Доступ до локації заборонено", satellite: "Супутник",  mapView: "Карта", caching: "Зберігаємо карту...",   cached: "Карту збережено ✓" },
  de: { locating: "Standort suchen...", routeTo: "Route nach", stop: "Stop",  direct: "Direkter Weg",   geoError: "Standort nicht ermittelbar",   geoTimeout: "GPS-Timeout — erneut versuchen", geoDenied: "Standortzugriff verweigert",   satellite: "Satellit",  mapView: "Karte", caching: "Karte wird gespeichert...", cached: "Karte gespeichert ✓" },
  es: { locating: "Buscando...",        routeTo: "Ruta a",     stop: "Parar", direct: "Camino directo", geoError: "No se pudo obtener ubicación", geoTimeout: "Tiempo de GPS agotado",          geoDenied: "Acceso a ubicación denegado",  satellite: "Satélite",  mapView: "Mapa",  caching: "Guardando mapa...",     cached: "Mapa guardado ✓" },
  pl: { locating: "Szukamy cię...",     routeTo: "Trasa do",   stop: "Stop",  direct: "Prosta trasa",   geoError: "Nie można pobrać lokalizacji", geoTimeout: "Limit czasu GPS — spróbuj ponownie", geoDenied: "Odmowa dostępu do lokalizacji", satellite: "Satelita", mapView: "Mapa",  caching: "Zapisywanie mapy...",   cached: "Mapa zapisana ✓" },
};

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

const ZOO_BOUNDS = { minLat: 41.383, maxLat: 41.392, minLng: 2.184, maxLng: 2.195 };
const OSM_CACHE_NAME = "osm-zoo-tiles-v1";

function getTilesForBounds(minLat: number, maxLat: number, minLng: number, maxLng: number, zoom: number) {
  const toX = (lng: number, z: number) => Math.floor((lng + 180) / 360 * 2 ** z);
  const toY = (lat: number, z: number) => {
    const r = lat * Math.PI / 180;
    return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z);
  };
  const tiles: { x: number; y: number; z: number }[] = [];
  for (let x = toX(minLng, zoom); x <= toX(maxLng, zoom); x++)
    for (let y = toY(maxLat, zoom); y <= toY(minLat, zoom); y++)
      tiles.push({ x, y, z: zoom });
  return tiles;
}

async function precacheOSMTiles(onProgress?: (pct: number) => void) {
  if (!("caches" in window)) return;
  const cache = await caches.open(OSM_CACHE_NAME);
  const allTiles = [15, 16, 17, 18, 19].flatMap(z =>
    getTilesForBounds(ZOO_BOUNDS.minLat, ZOO_BOUNDS.maxLat, ZOO_BOUNDS.minLng, ZOO_BOUNDS.maxLng, z)
  );
  let done = 0;
  const BATCH = 8;
  for (let i = 0; i < allTiles.length; i += BATCH) {
    await Promise.all(
      allTiles.slice(i, i + BATCH).map(async ({ x, y, z }) => {
        const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
        if (!(await cache.match(url))) {
          try {
            const res = await fetch(url, { mode: "cors" });
            if (res.ok) await cache.put(url, res);
          } catch { /* skip */ }
        }
      })
    );
    done += Math.min(BATCH, allTiles.length - i);
    onProgress?.(Math.round(done / allTiles.length * 100));
  }
}

type MapLayer = "satellite" | "osm";

const ZooMap = () => {
  const [language, setLanguage]         = useState<Language>("en");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [routeInfo, setRouteInfo]       = useState<{ animal: Animal } | null>(null);
  const [mapLayer, setMapLayer]         = useState<MapLayer>("satellite");
  const [osmCached, setOsmCached]       = useState(false);
  const [caching, setCaching]           = useState(false);

  const containerRef      = useRef<HTMLDivElement>(null);
  const mapRef            = useRef<L.Map | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);
  const osmLayerRef       = useRef<L.TileLayer | null>(null);
  const routeLineRef      = useRef<L.Polyline | null>(null);
  const userMarkerRef     = useRef<L.Marker | null>(null);
  const langMenuRef       = useRef<HTMLDivElement>(null);

  const t = UI_TEXTS[language];
  const currentLang = LANGUAGES.find((l) => l.code === language)!;

  useEffect(() => {
    if ("caches" in window) caches.has(OSM_CACHE_NAME).then(setOsmCached);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node))
        setLangMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const sat = satelliteLayerRef.current;
    const osm = osmLayerRef.current;
    if (!map || !sat || !osm) return;
    if (mapLayer === "satellite") {
      if (!map.hasLayer(sat)) map.addLayer(sat);
      if (map.hasLayer(osm))  map.removeLayer(osm);
    } else {
      if (!map.hasLayer(osm)) map.addLayer(osm);
      if (map.hasLayer(sat))  map.removeLayer(sat);
    }
  }, [mapLayer]);

  const clearRoute = useCallback(() => {
    if (routeLineRef.current && mapRef.current) mapRef.current.removeLayer(routeLineRef.current);
    routeLineRef.current = null;
    setRouteInfo(null);
  }, []);

  const showUserLocation = useCallback(() => {
    toast.info(t.locating);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (!mapRef.current) return;
        if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = L.marker([lat, lng], { icon: USER_LOCATION_ICON }).addTo(mapRef.current);
        // ✅ Центруємо тільки якщо користувач в межах Барселони
        const bounds = L.latLngBounds(BARCELONA_BOUNDS);
        if (bounds.contains([lat, lng])) {
          mapRef.current.setView([lat, lng], 18);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) toast.error(t.geoDenied);
        else if (err.code === err.TIMEOUT)      toast.error(t.geoTimeout);
        else                                    toast.error(t.geoError);
      },
      GEO_OPTIONS
    );
  }, [t]);

  const buildRoute = useCallback((animal: Animal) => {
    clearRoute();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!mapRef.current) return;
        const start: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        const end: [number, number]   = [animal.lat, animal.lng];
        routeLineRef.current = L.polyline([start, end], { color: "#3b82f6", weight: 5, dashArray: "10, 10" }).addTo(mapRef.current);
        setRouteInfo({ animal });
        toast.success(`${t.routeTo} ${getAnimalName(animal, language)}`);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) toast.error(t.geoDenied);
        else if (err.code === err.TIMEOUT)      toast.error(t.geoTimeout);
        else                                    toast.error(t.geoError);
      },
      GEO_OPTIONS
    );
  }, [clearRoute, t, language]);

  const handleLayerToggle = useCallback(async () => {
    const next: MapLayer = mapLayer === "satellite" ? "osm" : "satellite";
    setMapLayer(next);
    if (next === "osm" && !osmCached && !caching) {
      setCaching(true);
      toast.info(t.caching);
      await precacheOSMTiles();
      setCaching(false);
      setOsmCached(true);
      toast.success(t.cached);
    }
  }, [mapLayer, osmCached, caching, t]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: ZOO_CENTER,
      zoom: ZOO_DEFAULT_ZOOM,
      zoomControl: false,
      preferCanvas: false,
      // ✅ Карта не виходить за межі Барселони
      maxBounds: BARCELONA_BOUNDS,
      maxBoundsViscosity: 1.0, // тверда межа
      minZoom: 13,             // не можна відзумити далі Барселони
    });
    mapRef.current = map;

    satelliteLayerRef.current = L.tileLayer(
      "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      { subdomains: ["mt0", "mt1", "mt2", "mt3"], maxZoom: 21, attribution: "© Google" }
    ).addTo(map);

    osmLayerRef.current = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "© OpenStreetMap contributors" }
    );

    setMapLayer("satellite");
    map.setView(ZOO_CENTER, ZOO_DEFAULT_ZOOM);

    const cluster = L.markerClusterGroup();
    map.addLayer(cluster);
    ANIMALS.forEach((animal) => {
      const icon = L.divIcon({
        className: "custom-pin",
        html: `<div style="font-size:24px;background:white;border-radius:50%;width:35px;height:35px;display:flex;align-items:center;justify-content:center;border:2px solid red;">${animal.emoji}</div>`,
        iconSize: [35, 35],
      });
      const marker = L.marker([animal.lat, animal.lng], { icon });
      marker.on("click", () => setSelectedAnimal(animal));
      cluster.addLayer(marker);
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute top-4 left-0 right-0 z-[1000] flex gap-2 px-4">
        <AnimalSearch
          onSelect={(a) => { setSelectedAnimal(a); mapRef.current?.setView([a.lat, a.lng], 18); }}
          language={language}
        />
        <div ref={langMenuRef} className="relative shrink-0">
          <button
            onClick={() => setLangMenuOpen((v) => !v)}
            className="flex h-10 items-center gap-1 rounded-xl bg-white/90 shadow-lg backdrop-blur-md px-2.5 font-bold text-xs uppercase text-gray-900"
          >
            <span>{currentLang.flag}</span>
            <span>{currentLang.label}</span>
            <ChevronDown size={12} className={`transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-28 rounded-xl border border-gray-200 bg-white shadow-xl z-[1300] overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-100 ${language === lang.code ? "bg-gray-100 font-semibold" : ""}`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute z-[1000] flex flex-col items-center gap-2"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)", right: "16px" }}
      >
        <button onClick={() => mapRef.current?.zoomIn()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-md text-gray-700 transition-transform active:scale-90">
          <Plus size={20} strokeWidth={2.5} />
        </button>
        <button onClick={showUserLocation}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-transform active:scale-90">
          <LocateFixed size={26} />
        </button>
        <button onClick={() => mapRef.current?.zoomOut()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-md text-gray-700 transition-transform active:scale-90">
          <Minus size={20} strokeWidth={2.5} />
        </button>
        <button
          onClick={handleLayerToggle}
          disabled={caching}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-md text-gray-700 transition-transform active:scale-90 disabled:opacity-50"
        >
          {mapLayer === "satellite" ? <Map size={20} strokeWidth={2} /> : <Satellite size={20} strokeWidth={2} />}
        </button>
      </div>

      {routeInfo && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-xs bg-white p-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <span className="text-2xl">{routeInfo.animal.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-bold leading-tight">{getAnimalName(routeInfo.animal, language)}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">{t.direct}</p>
          </div>
          <button onClick={clearRoute} className="bg-red-500 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold">{t.stop}</button>
        </div>
      )}

      {selectedAnimal && (
        <AnimalCard
          animal={selectedAnimal}
          language={language}
          onClose={() => setSelectedAnimal(null)}
          onRoute={(a) => buildRoute(a)}
        />
      )}
    </div>
  );
};

export default ZooMap;