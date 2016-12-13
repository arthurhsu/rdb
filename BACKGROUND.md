# Background Information

The document provides background information regarding this Relational Database
proposal. It is organized in the following:

* What problem is this spec addressing?
* Why can't we extend IndexedDB?
* Why can't we revive WebSQL?
* What are the differences between RDB and WebSQL?

## Problem to Solve

The holy grail of data access on the web is to make sure the server data is
nicely accessed by the browsers on the client side. We want to reduce
round-trip latency, and we want to offer offline capability. Therefore we need
a fast and secure storage solution on the browser side.

Existing data access solutions on the browser side are IndexedDB and WebSQL.
WebSQL is formally deprecated and discouraged from usage. On the other hand,
IndexedDB is a NoSQL solution that falsily advertised to replace WebSQL, which
requires the developers to think and code in no-SQL paradigm.

RDB is created to solve the relational data-access requirements on the browser
side, without making the [mistakes that got WebSQL killed](https://hacks.mozilla.org/2010/06/beyond-html5-database-apis-and-the-road-to-indexeddb/).

### What's Wrong with NoSQL/IndexedDB?

Let's take a look with the simplest code:

```sql
SELECT t.id, t.desc, p.firstName, p.lastName
  FROM task t, person p
  WHERE t.state = 'Working' AND t.owner = p.id;
```

To do that with IndexedDB's NoSQL approach, you need to do this:

```javascript
// IndexedDB version, hard to read/change/maintain
// Reading data from IndexedDB needs ~100LOC in this case
// which is not listed here.
var tasks = ...;  // Array of task objects
var personMap = ...;  // Map of person id to person objects
return tasks.map(function(t) {
  var p = personMap[t.owner] || null;
  if (t.state != ‘Working’ || p == null) return null;
  return {
    ‘id’: t.id,
    ‘desc’: t.desc,
    ‘firstName’: p.firstName,
    ‘lastName’: p.lastName
  };
}).filter(function(record) {
  return record != null;
});
```

This is not good for reading, maintaining, debugging. One can argue that you can
use a library to help, and yes, I created
[Lovefield](https://github.com/google/lovefield) to help with this:

```javascript
// Lovefield version, easy to read/change/maintain
// The code already includes reading from DB
var t = db.getSchema().table(‘task’);
var p = db.getSchema().table(‘person’);
db.select(t.id, t.desc, p.firstName, p.lastName).
    from(t, p).
    where(lf.op.and(
        t.state.eq(‘Working’), t.owner.eq(p.id))).
    exec().
    then(function(rows) {
      // Your handler here
    });
```

Well this looks good enough. Why do you still need RDB?

### Limitations of Lovefield

Lovefield loads all data from IndexedDB into memory during initial load. This
means that Lovefield will be constrainted for small app usage only.

Why Lovefied does something like this? Because it needs to provide long-lived,
fine-controlled transaction that meets SQL behaviors. On the other hand, it's
also unlikely to implement that in today's JavaScript without loading everything
into memory.

JavaScript lacks fundamental memory control. Ideally we want to read from disk
only the thing can fit. Think about the easiest scenario of swapping. Say I have
100MB of memory and 500MB of data. I know that I'm going to pick roughly 1MB
from the data for the given conditions, unfortunately I need to scan all 500MB
of data (which is the worst cast for all SQL query). Therefore I need to read a
small batch, pick from that batch, and loop all batches until that's done.

This is not too bad with C++. I can use placement new to make sure I only use
50MB of memory. I can swap pages in and out (because I can delete the blob).
I can directly cast the read binary blobs into C++ objects, and directly
serialize C++ objects as memory blobs. I have very good locking/signal mechanism
to make sure all my read/write are done on the same snapshot.

Now let's try this in JavaScript. I have no idea if I'm reading 50MB of memory
using normal objects, so I either guess, or I need to use ArrayBuffer. If I read
things from ArrayBuffer/IndexedDB, then I don't have a way to cast them into JS
objects except expensive `JSON.serialize`. Once I finished using these objects,
I have no control of releasing them. JS GC decides when to release these pale
refs when it's happy. So I may still over use the memory when I read next pages
in. Worst of all, each read is a separate IndexedDB transaction and it commits
automatically. I don't have any way to guarantee that I'm operating on the same
snapshot, and my transaction integrity cannot be guaranteed either. I haven't
talked about the performance requirements here, and you can already see how slow
this not-working approach can be.

Therefore Lovefield reads everything in memory. If it can't fit, sorry. That is
what the platform provides.


## Why can't we extend IndexedDB?

If IndexedDB did not exist today, and we were thinking about this problem, would
we ever propose to "Add a schema-less DB to the platform and then implement our
RDBMS on top of it with JavaScript. BTW, SQLlite already ships with Chrome but
let's not use it."

I think the answer is pretty obvious. No. The proposal is simply based on the
fact that IndexedDB exists as the only viable persistent storage we have so far,
disregarding the mistakes been made in the first place.

Why leaving the hardest parts of a relational database (indexing, memory
management, optimizing queries) up to a JavaScript library to implement (and
expecting good performance) is a sound approach?

What makes IndexedDB the appropriate low-level building block for a relational
database?

Are the 30+ years of SQL not enough evidence that it is a proven useful idea?

Do we agree that structured data query/manipulation should be a first class
citizen on the Web platform? If the answer is "No", how do we expect the Web
platform to compete with native (mobile or not) platforms?

NoSQL technology is great at replicability, scalability, and high parallelism.
In exchange, doing structural relational data query on top of it is non-trivial.
Why shall we weigh those nice features that make little sense on the browser
side over developer productivity?

Many browsers (Chrome, Safari, Firefox for sure) already carry a relational
database implementation in C++ without exposing it. Building/fixing more
low-level blocks to improve IndexedDB so that relational usage can be shoehorned
on top of it, when there is already something in the C++ layer, simply makes no
sense.

IndexedDB and relational DB are different from algorithms. Relational DB is also
very self-contained and well defined. It should be viewed as a separate
component. Many other platforms (notably iOS and Android) already take this
approach and provide dedicated APIs for developers.


## Why can't we revive WebSQL?

WebSQL is not secure and posts great risk. We don't need an additional parser to
increase attack surface. It's very painful to write queries because SQLite is
not standard SQL, its types are not 1:1 mapping to JavaScript, and fun with
collations, sorting, transactions, corner cases using engines other than SQLite.

More details can be found on [mistakes that got WebSQL killed](https://hacks.mozilla.org/2010/06/beyond-html5-database-apis-and-the-road-to-indexeddb/).


## What are the differences between RDB and WebSQL?

RDB uses builder patterns to communicate queries instead of passing SQL
statements as strings to a parser.

RDB defines a meaningful subset of SQL for web applications, and it defines
clearly the behaviors to expect. It can be implemented from scratch, or using
SQL engines on the browser side (whether it's SQLite or not).

RDB is designed to work with all modern artifacts like Promises, Service
Workers, etc. It also avoids problems of existing IndexedDB spec.

### Problems of Existing IndexedDB?

Slow by design. IndexedDB fires event for every cursor, every `get()`/`set()`,
which grows in direct proportion of the number of records. There are remedies
like `getAll()`, but it's more a patch than real fix.

IndexedDB assumes one index type fits all. Even for pure object database this is
a highly questionable decision.


