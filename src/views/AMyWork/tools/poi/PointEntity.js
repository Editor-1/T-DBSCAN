export default class PointEntity {
  constructor(options) {
    this.id = options.id || ''

    this.lat = options.lat
    this.lng = options.lng

    this.name = options.name
    this.time = options.time
    this.altitude = options.altitude || 0
    this.photos = options.photos
    this.address = ''
    this.desc = options.desc || ''
  }
  getLatlng() {
    return [this.lat, this.lng]
  }
}
