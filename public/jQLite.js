class ElementCollection extends Array {
  ready(cb) {
    const isReady = this.some((e) => {
      return e.readyState != null && e.readyState != 'loading'
    })
    if (document.readyState !== 'loading') {
      cb()
    } else this.on('DOMContentLoaded', cb)
    return this
  }

  on(ev, cbOrSelector, cb) {
    if (typeof cbOrSelector === 'function') {
      this.forEach((e) => e.addEventListener(ev, cbOrSelector))
    } else {
      this.forEach((elem) => {
        elem.addEventListener(event, (e) => {
          if (e.target.matches(cbOrSelector)) cb(e)
        })
      })
    }
    return this
  }

  addClass(className) {
    this.forEach((e) => e.classList.add(className))
    return this
  }

  removeClass(className) {
    this.forEach((e) => e.classList.remove(className))
    return this
  }

  hasClass(className) {
    let doesHaveClass = false
    this.forEach((e) => {
      if (e.classList.contains(className)) {
        doesHaveClass = true
      }
    })
    return doesHaveClass
  }

  css(prop, val) {
    const camelProp = property.replace(/(-[a-z])/, (g) => {
      return g.replace('-', '').toUpperCase
    })
    this.forEach((e) => (e.style[camelProp] = value))
    return this
  }

  text(newText) {
    this.forEach((e) => (e.innerText = newText))
    return this
  }

  val() {
    let val
    this.forEach(function (e) {
      val = e.value
    })
    return val
  }

  html(newHTML) {
    this.forEach((e) => (e.innerHTML = newHTML))
  }
}

function $(param) {
  if (typeof param === 'string' || param instanceof String) {
    return new ElementCollection(...document.querySelectorAll(param))
  } else {
    return new ElementCollection(param)
  }
}
