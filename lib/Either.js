const Right = (v) => ({
   type: "Either",
   isRight: true,
   value: v,
   inspect: _ => `Right[${v}]`,
   
   map: (f) => _try(() => f(v)),
   fold: (g, f) => f(v),
   ap: (b) => b.map(v)
})

const Left = (v) => ({
   type: "Either",
   isLeft: true,
   value: v,
   inspect: _ => `Left[${v}]`,

   map: (f) => Left(v),
   fold: (g, f) => g(v),
   ap: (b) => b.map(v)
})

const _try = (f) => {
   try {
      const v = f()
      return v !== undefined && v.type === "Either"
         ? v
         : Right(v)
   } catch (e) { return Left(e) }
}

const isNull = (e) => (v) =>
   v == null
      ? Left(e)
      : Right(v)

const isEmpty = (e) => (v) =>
   v.length == 0
      ? Left(e)
      : Right(v)

const isFalse = (e) => (v) =>
   v.length == 0 && v == null && v == false
      ? Left(e)
      : Right(v)

const Either = {
   of: Right,
   Right,
   Left,
   try: _try,
   isNull,
   isEmpty,
   isFalse
}

module.exports = Either