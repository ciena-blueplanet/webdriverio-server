const supertest = require('supertest')

const server = supertest.agent('http://localhost:3000')

xdescribe('Baseline tests', () => {
  it('should return the homepage', (done) => {
    server
        .get('/')
        .expect('Content-type', /html/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            throw err
          }
          expect(res.status).toEqual(200)
          done()
        })
  })
})

xdescribe('Post Requests', () => {
  it('should post a new user correctly', (done) => {
    server
        .post('/developers/testuser')
        .send({token: '1234567890987654321'})
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) throw err
          expect(res.status).toEqual(200)
          expect(res.body).toEqual('OK')
          done()
        })
  })
})

xdescribe('Put Requests', () => {
  it('should update a user correctly', (done) => {
    server
        .post('/developers/testuser')
        .send({token: '357284909lsdkjf83745'})
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) throw err
          expect(res.status).toEqual(200)
          expect(res.body).toEqual('OK')
          done()
        })
  })
})

xdescribe('Get Requests', () => {
  it('should get a user with the correct token after an update happens', (done) => {
    var testToken = {token: 'sometokenofjustice'}
    server
        .put('/developers/testuser')
        .send(testToken)
        .end(() => {
          server
            .get('/developers/testuser')
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
              if (err) throw err
              expect(res.status).toEqual(200)
              expect(res.body).toEquals('sometokenofjustice')
              done()
            })
        })
  })

  it('should get a user with the correct token after an post happens', (done) => {
    var testToken = {token: 'acompletelynewandoriginaltoken'}
    server
        .post('/developers/testuser')
        .send(testToken)
        .end(() => {
          server
            .get('/developers/testuser')
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
              if (err) {
                throw err
              }
              expect(res.status).toEqual(200)
              expect(res.body).toEquals('acompletelynewandoriginaltoken')
              done()
            })
        })
  })

  it('should indicate that a username does not exist', (done) => {
    server
        .get('/developers/ksdflaj')
        .expect('Content-type', /json/)
        .expect(500)
        .end((err, res) => {
          if (err) {
            throw err
          }
          expect(res.status).toEqual(500)
          expect(res.body).toEquals('The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com')
          done()
        })
  })
})

xdescribe('Delete Requests', () => {
  it('should delete a user correctly', (done) => {
    server
        .post('/developers/testuser')
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) {
            throw err
          }
          expect(res.status).toEqual(200)
          server
            .delete('/developers/testuser')
            .expect('Content-type', /json/)
            .expect(200)
            .end((err, res) => {
              if (err) {
                throw err
              }
              expect(res.status).toEqual(200)
              server
                .get('/developers/testuser')
                .expect('Content-type', /json/)
                .expect(500)
                .end((err, res) => {
                  if (err) {
                    throw err
                  }
                  console.log(res.status)
                  expect(res.status).toEqual(500)
                  expect(res.body).toEquals('The username provided does not match any username. Please make sure that you are signed up as an authorized ciena developer on www.cienadevelopers.com')
                  done()
                })
            })
        })
  })
})
