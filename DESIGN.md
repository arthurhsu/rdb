# Design Decisions

This document records several design decisions made during the development of
this specification.

## Base API: Lovefield

Lovefield provides a set of builder-pattern API and is field-proven. We used
it in G-Mail Inbox and various Google products, so we have a good idea about
the completeness of the functionality provided, and naturally started from
there. We also understand that Lovefield is unnessarily constrainted by
IndexedDB limitations, which implies that certain API needs to be redesigned.
On the other hand, to become a W3C standard, use of scoped global function
needs to be limited, which is a new constraint in API design.

## DDL Changes

DDL changes are the main changes from Lovefield to RDB specification. The way of
defining tables, indices and constraints are similar, but with subtle
differences. The new syntax is less verbose and easier to call. Besides that,
it also allows multi-column foreign key, schema change at arbitary readwrite
transactions, schema persistence, and so on.

## Search Condition Changes

### Logical operation

Why is it not a good idea to have scoped global function? Here's a quick
example:

```js
// Lovefield
db.select().from(foo).where(lf.op.and(foo.id.eq(1), foo.name.eq('bar')));
```

How can we handle `lf.op.and()` in spec? We need a thing that carries `lf.op`.
In RDB spec design this is done through the `IFunctionProvider` in
`IRelationalDatabase` interface. Anyway this makes the code looks like:

```js
let rdb = navigator.rdb;
db.select().from(foo).where(rdb.fn.and(foo.id.eq(1), foo.name.eq('bar')));
```

This does not look too bad, but we can do better.

```js
db.select().from(foo).where(foo.id.eq(1).and(foo.name.eq('bar')));
```

This reads closer to its SQL counterparts. The only thing stays in
`IFunctionProvider` now is the `not` operator, whose existence can be discussed
since we do have the option to force developers to complement the boolean logic
themselves.


## Aggregation Function Changes

RDB provides less aggregation functions (`stddev`, `var`, `geomean` are all
removed) because SQL-03 standard does not have them, and thus many existing SQL
engines do not have these functions either. Adding these functions will
significantly increase the difficulty of implementing this spec.

## Subqueries

Subqueries are hard to implement in JavaScript, and we now have freedom to
incorporate it. There are two different subqueries supported:

### Set Operations

`ISelectQuery#union`, `ISelectQuery#intersect`, `ISelectQuery#except` are
provided to offer native support of set operations on tuples instead of asking
users to do those in JavaScript.

### Enumeration

The `in` predicate can now take `ISelectQuery` as parameter so that the
condition does not need to be marshalled from C++ layer to JavaScript, which
can be a good performance improvement.


## TBD: To Be Determined

### Table Changes

The `ALTER TABLE` support among SQL engines are very diversified. Current
`ITableChanger` design is not universal enough for implementation.

### Naming Limitations

Currently names are limited to be `/^[A-Za-z_][A-Za-z0-9_]*$/`, which is there
for simplifying implementation. Because names are case-sensitive, there needs
to be an escaping algorithm to transfer names into case-insensitive SQL.
Opening this to UTF-16 as in JavaScript naming will cause this algorithm
to be hard to implement. We do understand W3C loves UTF-16 but this will
cause unnessary difficulty.


## Not Implemented in this Version

### Full Text Search

FTS can be done using virtual tables or table views. In that case the spec
design will need to accomodate different implementations.

Due to the complexity, FTS feature is left to v2.

### Index Type

Ideally SQL engines should support at least two index types: Hash and B-Tree.
However, the engine may choose not to expose the API and silently determine what
to use underneath. To simplify the already huge v1 spec, this feature is left
out.

