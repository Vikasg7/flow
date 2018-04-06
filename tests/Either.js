const { expect } = require("chai")
const { describe, it } = require("mocha")
const { Either } = require("../index")

describe("Testing Either", () => {
   
   it("map should map a function", (done) => {
      const double = x => x * 2
      Either.of(1)
      .map(double)
      .fold(done, v => {
         expect(v).to.equal(2)
         done()
      })
   })

   it("map should also act like a chain", (done) => {
      const double = x => Either.of(x * 2)
      Either.of(1)
      .map(double)
      .fold(done, v => {
         expect(v).to.equal(2)
         done()
      })
   })

   it("fold should branch code based on value received", (done) => {
      const double = x => x * 2
      Either.of(1)
      .map(double)
      .fold(done, (v) => {
         expect(v).to.equal(2)
      })

      Either.Left(1)
      .map(double)
      .fold((e) => {
         expect(e).to.equal(1)
      }, done)

      Either.of(1)
      .map(double)
      .map(() => { throw new Error("Delibrate Error") })
      .fold((e) => {
         expect(e).to.be.instanceof(Error)
         done()
      }, done)
   })

   it("ap should ap should apply a Right over another Right", (done) => {
      const compute = x => y => x + y
      Either.of(compute)
      .ap(Either.of(2))
      .ap(Either.of(3))
      .fold(done, (v) => {
         expect(v).to.equal(5)
         done()
      })
   })

})