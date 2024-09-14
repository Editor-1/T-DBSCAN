
export function getLng(longitude) {
  const lng = toFixed(longitude)
  return getLongitude(lng)
}
function getLongitude(lng) {
  if (lng > 180) {
    lng = lng - 360
  }
  if (lng < -180) {
    lng += 360
  }

  if (lng > 180 || lng < -180) {
    return getLongitude(lng)
  }
  return lng
}
export function toFixed(num = 0, fixed = 7) {
  return (Number(Number(num).toFixed(fixed)))
}

