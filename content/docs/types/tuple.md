# Tuple type

A tuple type represents an array field of a fixed length, and each element inside the array can have a specific type.

You may create a tuple using the `vine.tuple` method and define the types for individual elements. In the following example, we define a tuple that accepts the starting and the ending date.

The validation will fail if the provided array has less than two properties or if any fields are not valid dates.

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  dateRange: vine.tuple([
    vine.date().inFuture('days'),
    vine.date().afterField('dateRange.0', { diff: 'days' }),
  ])
})
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  dateRange: vine.tuple([
    vine.date().inFuture('days'),
    vine.date().afterField('dateRange.0', { diff: 'days' }),
  ])
  .nullable()
}
```

```ts
{
  dateRange: vine.tuple([
    vine.date().inFuture('days'),
    vine.date().afterField('dateRange.0', { diff: 'days' }),
  ])
  .optional()
}
```


## Allowing unknown properties

By default, the tuple keeps only the validated properties in the output, and the rest of the array elements are ignored. However, if needed, you may copy the rest of the properties using the `allowUnknownProperties` method.


:::codegroup

```ts
// title: Without unknown properties
import vine from '@vinejs/vine'

const schema = vine.schema({
  topScores: vine.tuple([
    vine.number(),
    vine.number(),
    vine.number(),
  ])
})

const data = {
  topScores: [
    98,
    96,
    92,
    88,
    84
  ]
}

const output = await vine.validate({ schema, data })
/**
const data = {
  topScores: [
    98,
    96,
    92
  ]
}
*/
```


```ts
// title: Allow unknown properties
import vine from '@vinejs/vine'

const schema = vine.schema({
  topScores: vine.tuple([
    vine.number(),
    vine.number(),
    vine.number(),
  ])
  // insert-start
  .allowUnknownProperties()
  // insert-end
})

const data = {
  topScores: [
    98,
    96,
    92,
    88,
    84
  ]
}

const output = await vine.validate({ schema, data })
/**
const data = {
  topScores: [
    98,
    96,
    92,
    // insert-start
    88,
    84
    // insert-end
  ]
}
*/
```

:::

## Defining error message

You may define the custom error message using the `tuple` rule name.

```ts
const messages = {
  tuple: 'The {{ field }} field must be an array'
}
```
