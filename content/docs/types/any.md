---
summary: The Any data type is allows the field value to be anything
---

# Any type

Mark the field under validation to be anything. In other words, do not perform any type-checking validation on the value.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  secret_message: vine.any()
})
```

Using the following modifiers, you may mark the record as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  secret_message: vine.any().nullable()
}
```

```ts
{
  secret_message: vine.any().optional()
}
```
