
export function mercatorToLngLat(mercator){
  let lonlat={lon:0,lat:0};

  let x = mercator.x/20037508.34*180;
  let y = mercator.y/20037508.34*180;

  y= 180/Math.PI*(2*Math.atan(Math.exp(y*Math.PI/180))-Math.PI/2);

  lonlat.lon = x;
  lonlat.lat = y;

  return lonlat;
}
export function mercatorToLngLats(list){
  const r = []
  list.forEach(item => {
    const tt = mercatorToLngLat(item)
    r.push([tt.lon, tt.lat])
  })
  return r
}
export function lonlatToMercator(lonlat){
  var mercator = {};

  let x = lonLat.lon * 20037508.34 / 180;
  let y = Math.log(Math.tan((90 + lonLat.lat) * Math.PI / 360)) / (Math.PI / 180);

  y = y * 20037508.34 / 180;

  mercator.x = x;
  mercator.y = y;

  return mercator;
}
