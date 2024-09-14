import { v4 } from 'uuid'
export function toFixed(num = 0, fixed = 7) {
  return (Number(Number(num).toFixed(fixed)))
}
export function getUuid() {
  return v4()
}

