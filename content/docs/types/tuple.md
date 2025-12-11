---
summary: The Object data type is used to validate an array with known elements and array length
---

# Tuple type

A tuple type represents an array field of a fixed length, and each element inside the array can have a specific type. You may create a tuple using the `vine.tuple` method and define the types for individual elements. 

In the following example, we define a tuple that accepts the latitude and the longitude pair. The validation will fail if the provided array has less than two properties or if any field is not a number.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  coordinates: vine.tuple([
    vine.number(),
    vine.number(),
  ])
})
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  coordinates: vine.tuple([
    vine.number(),
    vine.number(),
  ])
  .nullable()
}
```

```ts
{
  coordinates: vine.tuple([
    vine.number(),
    vine.number(),
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

const data = {
  top_scores: [
    98,
    96,
    92,
    88,
    84
  ]
}

const validator = vine.create({
  top_scores: vine.tuple([
    vine.number(),
    vine.number(),
    vine.number(),
  ])
})
const output = await validator.validate(data)

/*
const data = {
  topScores: [
    98,
    96,
    92,
  ]
}
*/
```


```ts
// title: Allow unknown properties
import vine from '@vinejs/vine'

const data = {
  top_scores: [
    98,
    96,
    92,
    88,
    84
  ]
}

const validator = vine.create({
  top_scores: vine.tuple([
    vine.number(),
    vine.number(),
    vine.number(),
  ])
  // insert-start
  .allowUnknownProperties()
  // insert-end
})
const output = await validator.validate(data)

/*
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

vine.messagesProvider = new SimpleMessagesProvider(messages)
```
