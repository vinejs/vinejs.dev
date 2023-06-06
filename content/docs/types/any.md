# Any type

Mark the field under validation to be anything. In other words, do not perform any type-checking validation on the value.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  secretMessage: vine.any()
})
```

Using the following modifiers, you may mark the record as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  secretMessage: vine.any().nullable()
}
```

```ts
{
  secretMessage: vine.any().optional()
}
```
