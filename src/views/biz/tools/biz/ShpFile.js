
// import shpwrite from "@mapbox/shp-write"
import shpwrite from "@/plugins/shpwrite/dist/index.js"

export function exportPoints(param) {
  const fileName = param.fileName || 'SurveyorPathShp'
  const list = param.data
  if (!list || list.length < 1) {
    return
  }
  const options = {
    outputType: "blob",
    compression: "DEFLATE",
    types: {
      point: fileName,
      polygon: fileName,
      polyline: fileName
    }
  }
  const features = []
  list.forEach(item => {
    const properties = item
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [item.longitude, item.latitude]
      },
      properties: properties
    })
  })
  const fc = {
    type: "FeatureCollection",
    features: features
  }
  shpwrite.zip(fc, options).then(blob => {
    const aLink = document.createElement('a')
    aLink.href = URL.createObjectURL(blob)
    aLink.download = fileName
    document.body.appendChild(aLink)
    aLink.click()
    document.body.removeChild(aLink)
  })
}


export function test() {
// a GeoJSON bridge for features
  const zipData = shpwrite.zip(
    {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [113, 28],
              [113, 29],
              [114, 29],
              [114, 28]
            ]
          },
          properties: {
            name: "Foo",
          },
        },
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [114, 28],
              [114, 29],
              [115, 29],
              [115, 28]
            ]
          },
          properties: {
            name: "中文测试aaabc1234",
          },
        },
      ],
    }, {
      folder: "my_internal_shapes_folder",
      filename: "my_zip_filename",
      outputType: "blob",
      compression: "DEFLATE",
      types: {
        point: "mypoints",
        polygon: "mypolygons",
        polyline: "mylines",
      }
    }
  );
  return zipData
}
