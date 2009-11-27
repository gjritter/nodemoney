Array.prototype.reduce = function (f, value) { 
    for (var i = 0; i < this.length; i++) { 
        value = f(this[i], value)
    }
    return value
}
