const { DOMParser } = require('@xmldom/xmldom');

// Conversao KML -> GeoJSON e calculo de centroide.
// Foca em poligonos (contorno de talhao), que e o caso de uso do projeto.
// Coordenadas GeoJSON seguem a ordem [lng, lat].

// "lng,lat,alt lng,lat,alt ..." -> [[lng,lat], ...]
function parseCoordinates(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((tuple) => {
      const [lng, lat] = tuple.split(',').map(Number);
      return [lng, lat];
    })
    .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));
}

function ringFromBoundary(boundaryEl) {
  const ring = boundaryEl.getElementsByTagName('LinearRing')[0];
  if (!ring) return null;
  const coordsEl = ring.getElementsByTagName('coordinates')[0];
  if (!coordsEl) return null;

  const coords = parseCoordinates(coordsEl.textContent);
  if (coords.length < 3) return null;

  // Garante anel fechado (primeiro == ultimo ponto).
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    coords.push([first[0], first[1]]);
  }
  return coords;
}

function polygonElToGeometry(polygonEl) {
  const rings = [];

  const outer = polygonEl.getElementsByTagName('outerBoundaryIs')[0];
  if (outer) {
    const ring = ringFromBoundary(outer);
    if (ring) rings.push(ring);
  }

  const inners = polygonEl.getElementsByTagName('innerBoundaryIs');
  for (let i = 0; i < inners.length; i += 1) {
    const ring = ringFromBoundary(inners[i]);
    if (ring) rings.push(ring);
  }

  return rings.length > 0 ? { type: 'Polygon', coordinates: rings } : null;
}

// Converte uma string KML em FeatureCollection GeoJSON (somente poligonos).
function kmlToGeoJson(kmlString) {
  const dom = new DOMParser({
    // Silencia warnings de KML "sujo"; lancamos erro de dominio se nao houver geometria.
    errorHandler: { warning() {}, error() {}, fatalError() {} },
  }).parseFromString(kmlString, 'text/xml');

  const polygonEls = dom.getElementsByTagName('Polygon');
  const features = [];
  for (let i = 0; i < polygonEls.length; i += 1) {
    const geometry = polygonElToGeometry(polygonEls[i]);
    if (geometry) {
      features.push({ type: 'Feature', properties: {}, geometry });
    }
  }

  return { type: 'FeatureCollection', features };
}

// Coleta os aneis externos (primeiro anel) de cada poligono do GeoJSON.
function collectOuterRings(geojson) {
  const rings = [];
  const handleGeometry = (geom) => {
    if (!geom) return;
    if (geom.type === 'Polygon' && geom.coordinates[0]) {
      rings.push(geom.coordinates[0]);
    } else if (geom.type === 'MultiPolygon') {
      geom.coordinates.forEach((poly) => poly[0] && rings.push(poly[0]));
    } else if (geom.type === 'GeometryCollection') {
      (geom.geometries || []).forEach(handleGeometry);
    }
  };

  if (geojson.type === 'FeatureCollection') {
    (geojson.features || []).forEach((f) => handleGeometry(f.geometry));
  } else if (geojson.type === 'Feature') {
    handleGeometry(geojson.geometry);
  } else {
    handleGeometry(geojson);
  }
  return rings;
}

function hasPolygon(geojson) {
  return collectOuterRings(geojson).length > 0;
}

// Area assinada (formula do cadarco) de um anel [[lng,lat], ...].
function signedArea(ring) {
  let area = 0;
  for (let i = 0, n = ring.length; i < n; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % n];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function ringCentroid(ring) {
  let x = 0;
  let y = 0;
  let a = 0;
  for (let i = 0, n = ring.length; i < n; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % n];
    const cross = x1 * y2 - x2 * y1;
    a += cross;
    x += (x1 + x2) * cross;
    y += (y1 + y2) * cross;
  }
  a /= 2;

  // Anel degenerado (area ~0): usa a media simples dos pontos.
  if (Math.abs(a) < 1e-12) {
    const sum = ring.reduce((acc, [lx, ly]) => ({ x: acc.x + lx, y: acc.y + ly }), { x: 0, y: 0 });
    return { lng: sum.x / ring.length, lat: sum.y / ring.length };
  }

  return { lng: x / (6 * a), lat: y / (6 * a) };
}

// Centroide do maior poligono do GeoJSON. Retorna { lat, lng } ou null.
function computeCentroid(geojson) {
  const rings = collectOuterRings(geojson);
  if (rings.length === 0) return null;

  let largest = rings[0];
  let largestArea = -1;
  rings.forEach((ring) => {
    const area = Math.abs(signedArea(ring));
    if (area > largestArea) {
      largestArea = area;
      largest = ring;
    }
  });

  return ringCentroid(largest);
}

module.exports = { kmlToGeoJson, hasPolygon, computeCentroid };
