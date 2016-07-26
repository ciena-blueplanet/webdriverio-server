export default function (redirectRoute, that) {
  let params = redirectRoute.lastIndexOf('?')
  let redirect = ''
  let queryParamsArray = []
  let queryParams = {}
  if (params > 0) {
    redirect = redirectRoute.substring(0, params).split('/')
    queryParamsArray = redirectRoute.substring(params + 1).split('&')
    queryParamsArray.forEach((element) => {
      let param = element.split('=')
      queryParams[param[0]] = param[1]
    })
  } else {
    redirect = redirect.split('/')
  }
  if (redirect[0] === '' && redirect[1] === '#') {
    redirect.shift()
    redirect.shift()
  }
  redirect = redirect.join('.')
  if (that.transitionToRoute) {
    that.transitionToRoute(redirect, {queryParams})
  } else if (that.transitionTo) {
    that.transitionTo(redirect, {queryParams})
  } else {
    console.error('Error in transition')
  }
}
