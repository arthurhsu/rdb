# Frequently Asked Questions

The following is to create a digest of frequently asked questions, and mostly
adopted from
[the long discussion thread](https://github.com/arthurhsu/rdb/issues/2).


## Q: Why do you propose a new spec?

The goal is to provide a relational DB for web apps, which
* Simplifies relational data manipulation
* Provides easy-to-use APIs to promote readable, maintainable, and performant
  code for apps needing relational data
* Removes the need to shoehorn relational data model on top of object data
  model (i.e. IndexedDB)
* Removes the need to implement domain-specific query layer or to use
  third-party libraries (e.g. [Lovefield](https://github.com/google/lovefield))


## Q: Why not just use existing IndexedDB? You can ...

TL;DR:

* IndexedDB does not have a relational query engine.
* IndexedDB is the only viable persistent storage on web platform, but it is
  not suitable for relational data manipulation.
* A relational query/manipulation API can be useful even when persistence is
  not a desired (and therefore IndexedDB cannot help). Surprisingly this use
  case has shown to be fairly popular.

### Relational Query Engine

IndexedDB does not have any relational query capability, and users are forced
to either implement their own domain-specific query layer, or use libraries
like [Lovefield](https://github.com/google/lovefield).

#### Problems with Domain-Specific Query Layer

Implementing domain-specific query layer creates unnecessary complexity. For
example:

* [Pure IDB version demo](https://github.com/google/lovefield/blob/master/demos/moviedb/demo-pureidb.js)
* [Lovefield version](https://github.com/google/lovefield/blob/master/demos/moviedb/demo-jquery.js)

Readability, ease of change, ease of maintenance, these are all valuable to
developers. Writing such a simple app using so many lines with IndexedDB is
simply wrong. A generic purpose relational data query/manipulation API would
relieve developers from re-inventing the wheel, over and over again.

#### Problems for Implementing a Generic Relational Query Engine

I am the creator of Lovefield and I have found many constraints of implementing
a generic relational query engine using JavaScript. JavaScript is not designed
to provide memory management capability. JavaScript is not designed to pack
data into blobs, or to unpack data from blobs, efficiently and easily.

On top of that, IndexedDB poses many assumptions and limitations for query
engine authors. IndexedDB assumes one storage structure can satisfy all needs.
IndexedDB assumes one index structure (B-Tree) can satisfy all needs. Moreover,
IndexedDB has many weird limitations/behaviors such as auto-commit
transactions, schema change only in upgrade transactions, excessive eventing
in cursor looping, ... etc.

IndexedDB is at best a shoehorned back store for relational DB. Relational DB
is designed around paged store with atomic writing, and that is why it uses
complex B-Trees and other designs to make sure the I/O and memory can be most
efficient. Fundamentally IndexedDB is not designed as a page store, it is an
object store that is best working with NoSQL technology, not relational DB.


## Q: Do you fully exhaust the possibilities with IndexedDB?

I believe so (see what Lovefield can do).
[Performance benchmark demo](http://arthurhsu.github.io/rdb/demo/demo.html)
implements a simple but super common usage of relational database:
a master-slave view. It joins three tables and shows the details result.
The key number here is the time it takes to generate the details data,
when the user clicks on a grid row. 

On my Macbook Pro, IndexedDB is about 70~200ms, WebSQL is 5ms~9ms, and
Lovefield is 5ms~15ms. Remember this is just for a single row and it is order
of magnitude difference between IndexedDB and WebSQL. If you were curious,
you can also profile the process memory usage and JS heap usage. You shall see
that WebSQL uses way less memory.


## Q: Why not fix IndexedDB and JavaScript (aka keep extensible web)?

Because it is simply non-sense.

Many browsers (Chrome, Safari, Firefox for sure) already carry a relational
database implementation in C++ without exposing it. Building/fixing more
low-level blocks to improve IndexedDB so that relational usage can be
shoehorned on top of it, when there is already something in the C++ layer,
simply makes no sense.

Moreover, making IndexedDB more bloated with features that an object DB
does not need also makes no sense.

IndexedDB and relational DB are different from algorithms. Relational DB is
also very self-contained and well defined. It should be viewed as a separate
component. Many other platforms (notably iOS and Android) already take this
approach and provide dedicated APIs for developers.


## Q: RDB can be vulnerable for cross-browser bugs, just like the dead WebSQL.

RDB tried to define the queries to be performed using JS API, therefore it aims
to define a clear set of behavior from JS layer. It is up to the browser vendor
to decide how to implement these behaviors, but it will not have the problems
(e.g. collation, semantic parsing for SQL, transaction model) that plagues
WebSQL.

On the other hand, cross-browser bugs exist if browser vendors cannot get the
spec implemented correctly. IndexedDB on Safari is an infamous example. This
cannot be counted as a concern of spec proposal.


## Q: But developers need to learn one more APIs ...

Developers writing apps that needs the power of relational data are very likely
mastered or willing to learn SQL. The RDB APIs are designed to be very easy for
these developers to pick up and learn.

From the experiences I have promoting Lovefield, I have very positive feedback
from hundreds of developers.

Developers who need to handle tiny data set or NoSQL data, they can still use
existing LocalStorage or IndexedDB.


## Q: I do not see web developers ask for relational database ...

That is not what I see when I promote Lovefield. Web developers are using
server-side solutions today (e.g. PHP/MySQL is one popular way) to solve their
relational query needs, because there is *nothing* on the client side.

Moreover, platform shall not force user to use one paradigm over the other for
no good reason. "IndexedDB can be used" is not a good reason. Academic studies
already showed us the strength and weakness of object DB and relational DB.
It is not reasonable nor useful to force everyone to use object DB to simulate
relational DB behavior.


## Q: How hard is this for browser vendors to implement?

It is not hard to implement, the problem is the spec looks gigantic.

A quick reasonable implementation is to use the RDB JS API to generate SQL
statements, and leverage existing engine embedded in the browser (i.e. SQLite
in Safari, Chrome, and Firefox. For Microsoft Edge, it is up to Microsoft
to pull in some more DLLs/.Net assemblies or not.) The SQL statement
generation is not complicated, see [polyfill](
https://github.com/google/lovefield/blob/master/lib/query/to_sql.js), and I
expect most of the efforts will be quite boiler-plate.

If any vendor want to go full-fledged (i.e. create a real database from
scratch), then yes that would be a significant investment decision to make.
Even so there are quite a few existing C++ class libraries to start with, and
it is not from zero. At least one does not really need to write B+-Tree from
scratch as I did for Lovefield.


## Q: Why not from(...).where(...).select(...)? SQL made a mistake ...

First of all, I disagree that SQL made a mistake. It's extremely important to
make things readable. Secondly, this syntax makes sense only when free-form
parsing are involved. The builder pattern of this spec will build a query syntax
tree, which can be augmented or modified from a pre-stored subtree.

More discussions about syntax design can be found from [Lovefield's design
document](https://github.com/google/lovefield/blob/master/docs/dd/00_intro.md#07-api-design).


## Q: Why not just make the original thread more readable?

I cannot help with people derailing the discussion. I do have the control to
delete/modify what were said, but I do not think you will like it if you
were a participant in the discussion.

So this FAQ is at least something I have full control with and you can decide
whether to agree or disagree by reading to here or hit your back button.
