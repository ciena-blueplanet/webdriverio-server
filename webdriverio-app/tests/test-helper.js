import resolver from './helpers/resolver'
import {setResolver} from 'ember-mocha'

const flag = chai.util.flag

// Taken from chai-jquery
chai.Assertion.addMethod('class', function (className) {
  this.assert(
    flag(this, 'object').hasClass(className),
    'expected #{this} to have class #{exp}',
    'expected #{this} not to have class #{exp}',
    className
  )
})

// Taken from chai-jquery
chai.Assertion.overwriteChainableMethod('contain',
  function (_super) {
    return function (text) {
      var obj = flag(this, 'object')
      if ('jquery' in obj) {
        this.assert(
            obj.is(':contains(\'' + text + '\')')
          , 'expected #{this} to contain #{exp}'
          , 'expected #{this} not to contain #{exp}'
          , text)
      } else {
        _super.apply(this, arguments)
      }
    }
  },
  function (_super) {
    return function () {
      _super.call(this)
    }
  }
)

setResolver(resolver)
