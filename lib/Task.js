/*
** Task is a factory function
** This implementation of Task is based on what I learned from Mr. Brian's course on egghead.io
** link: https://egghead.io/lessons/angular-1-x-applicative-functors-for-multiple-arguments
*/
const Task = (fork) => ({
   type: "Task",

   fork,

   /*
   ** Maps a function.
   */
   map: (f) => {
      return Task((rej, res) => {
         fork(rej, r => _try(() => f(r), rej, res))
      })
   },

   /*
   ** Helps in branching the code.
   */
   fold: (g, f) => {
      return Task((rej, res) => {
         fork(e => _try(() => g(e), rej, res), 
              r => _try(() => f(r), rej, res))
      })
   },

   /*
   ** Maps a function over rejected value and resolves with the result 
   */
   foldRejected: (g) => {
      return Task((rej, res) => {
         fork(e => _try(() => g(e), rej, res), res)
      })
   },

   /*
   ** Maps a function over rejected value and returns a rejected Task
   */
   mapRejected: (g) => {
      return Task((rej, res) => {
         fork(e => _try(() => g(e), rej, rej), res)
      })
   },

   /*
   ** Applies a Task over another Task
   ** This comment is for reminding myself that how I implemented ap method.
   ** So for example, if we run following:
   ** Task.of(x => x + 1)
   ** .ap(Task.of(1))
   ** .fork(log, log)
   ** So, 
   ** t = Task.of(1) (here v = 1)
   ** f = x => x + 1 (f can also be a function that returns another Task)
   ** resolve = (v) => _res(f(v), rej, res)
   ** I used t.fork to get the v out in resolve function (which is = 1 in this case).
   ** Finally, in resolve function, I used _res function which resolve based 
   ** on what f(v) returns. Basically _res will fork again f(v) returns task.
   */
   ap: (t) => {
      return Task((rej, res) => {
         fork(rej, f => t.fork(rej, (v) => _try(() => f(v), rej, res)))
      })
   },

   /*
   ** Maps a function and returns the value received unchanged.
   */
   run: (f) => {
      return Task((rej, res) => {
         fork(rej, r => _try(() => f(r), rej, () => res(r)))
      })
   },

   /*
   ** Runs a function over each element in value received
   */
   reduceMap: (f, i) => {
      return Task((rej, res) => {
         fork(rej, r => {
            r
            .reduce((acc, v, k) => acc.map((i) => f(v, k, i)), Task.of(i))
            .fork(rej, res)
         })
      })
   },

   inspect: _ => `Task[function]`
})

/*
** Checks to see if v is has type: Task and resolve accordingly.
*/
const _try = (fn, rej = Task.rejected, res = Task.of) => {
   try {
      const v = fn()
      v !== undefined && v.type === "Task" 
         ? v.fork(rej, res) 
         : res(v)
   } catch (e) { rej(e) }
}

/* Static methods */
Task.of = (v) =>
   Task((_, res) => res(v))

Task.rejected = (v) =>
   Task((rej, _) => rej(v))

Task.isNull = (e) => (v) =>
   v == null
      ? Task.rejected(e)
      : Task.of(v)

Task.isEmpty = (e) => (v) =>
   v.length == 0
      ? Task.rejected(e)
      : Task.of(v)

Task.isFalse = (e) => (v) =>
   v.length == 0 && v == null && v == false
      ? Task.rejected(e)
      : Task.of(v)

Task.try = _try

module.exports = Task