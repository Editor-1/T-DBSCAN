
import request from '@/utils/request'
export function create(param) {
  console.log('pp', param)
  return new Promise((resolve, reject) => {
    request.post('/save-data', JSON.stringify(param)).then(res => {
      console.log('res', res)
    })

    resolve('')
    }).catch(error => {
      reject(error)
    })
}
export function getList() {
  return request.get('/read-data')
}
export function update(param) {
  console.log('pp', param)
  return new Promise((resolve, reject) => {
      resolve('')
    }).catch(error => {
      reject(error)
    })
}
