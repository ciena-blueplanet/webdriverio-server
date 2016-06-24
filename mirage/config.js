export default function () {
  this.get('/developers', (db, request) => {
    const token = request.body.developer.token
    const username = request.body.developer.token
    return db.developers.where({
      username: username,
      token: token
    })
  })
}
