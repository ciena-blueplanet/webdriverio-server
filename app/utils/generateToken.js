/**
 * A snippet of brilliance by stackoverflow user @doubletap, improved on by @amichair
 * http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
 * @param {Number} n - The length of the desired randomized token
 * @returns {String} A randomized n-length token
 */
export default function (n) {
  // The usable alphabet of characters for the token
  const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  if (isNaN(n) && n <= 0) {
    throw new Error('n must be of type Number and >= 0')
  } else {
    return Array.apply(null, Array(n)).map(function () { return s.charAt(Math.floor(Math.random() * s.length)) }).join('')
  }
}
