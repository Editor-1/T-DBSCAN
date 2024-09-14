export default class NavPointEntity {
    constructor(options){
        this.id = options.id || ''
        this.lat = options.lat
        this.lng = options.lng
        this.name = options.name
    }
    getLatlng(){
        return [this.lat, this.lng]
    }
}