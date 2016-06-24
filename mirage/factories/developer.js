import { Factory } from 'ember-cli-mirage'
import generateToken from '../../app/utils/generateToken'

export default Factory.extend({
  username (i) {
    return `user${i}`
  },
  token: generateToken(30)
})
