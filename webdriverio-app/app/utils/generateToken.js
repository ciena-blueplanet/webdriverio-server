/*
 * On the subjust of generating random alphanumeric strings:
 * A snippet of brilliance by stackoverflow user @doubletap, improved on by @amichair
 * http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
 */
export function generateToken (n) {
  var s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return (isNaN(n) && n >= 0) ? new Error('n must be of type Number and >= 0') : Array.apply(null, Array(n)).map(function () { return s.charAt(Math.floor(Math.random() * s.length)) }).join('')
}
