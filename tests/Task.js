const { expect } = require("chai")
const { it, describe } = require("mocha")
const { Task } = require("../index")

describe("Testing Task", () => {
   
   it("map should map a function", (done) => {
      const double = x => x * 2
      Task.of(1)
      .map(double)
      .fork(done, (v) => {
         expect(v).to.equal(2)
         done()
      })
   })

   it("map should map a function returning another Task", (done) => {
      const double = x => Task((rej, res) => setTimeout(res, 50, x * 2))
      expect(double(2)).to.have.property("type", "Task")

      Task.of(1)
      .map(double)
      .fork(done, (v) => {
         expect(v).to.equal(2)
         done()
      })
   })

   it("fold should branch code based on value received", (done) => {
      Task.of(1)
      .fold(e => e + 1,
            r => r + 2)
      .fork(done, (v) => {
         expect(v).to.equal(3)
      })

      Task.rejected(1)
      .fold(e => e + 1,
            r => r + 2)
      .fork(done, (v) => {
         expect(v).to.equal(2)
         done() // should be called only once.
      })
   })

   it("foldRejected should map a funciton over rejected value and resolve with the results", (done) => {
      const double = x => x * 2
      Task.rejected(1)
      .foldRejected(double)
      .fork(done, (v) => {
         expect(v).to.equal(2)
         done()
      })
   })

   it("mapRejected should map function over rejected value", (done) => {
      const double = x => Task((rej, res) => setTimeout(res, 50, x * 2))
      Task.rejected(2)
      .mapRejected(double)
      .fork((v) => {
         expect(v).to.equal(4)
         done()
      }, done)
   })

   it("ap should apply a Task over another Task", (done) => {
      const compute = x => y => x + y
      Task.of(compute)
      .ap(Task.of(1))
      .ap(Task.of(2))
      .fork(done, (v) => {
         expect(v).to.equal(3)
         done()
      })
   })

   it("run should invoke a fn(value) and return value affected", (done) => {
      const double = x => x * 2
      Task.of(2)
      .run(double)
      .fork(done, (v) => {
         expect(v).to.equal(2)
         done()
      })
   })

   it("reduceMap should run a function over each element in value received", (done) => {
      const double = (v, i, l) => 
         Task.of(v)
         .run((v) => { expect(v).to.equal(i+1) })
         .map(v => Task((rej, res) => setTimeout(res, 50, v * 2)))
         .map((v) => {
            l.push(v)
            return l
         })

      Task.of([1,2,3])
      .reduceMap(double, [])
      .fork(done, (l) => {
         expect(l).to.deep.equal([2, 4, 6])
         done()
      })
   })

   it("testing handling of errors in reduceMap", (done) => {
      const double = (v, i, l) =>
         Task.of(v)
         .run((v) => expect(v).to.equal(i + 1))
         .map(v => { throw new Error("error in double") })
         .map((v) => {
            l.push(v)
            return l
         })

      Task.of([1, 2, 3])
      .reduceMap(double, [])
      .fork((e) => {
         expect(e).to.instanceOf(Error)
         done()
      }, done)
   })  

   it("testing inspect method", (done) => {
      const t = Task.of("hello")
      expect(t.inspect()).to.equal("Task[function]")
      done()
   })

})
