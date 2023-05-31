# Literal type

Ensure the field's value matches exactly the expected literal value. In certain cases, VineJS will perform the following normalizations on the input value.

- **When expected value is a boolean** - The input value `[true, 1, "1", "true", "on"]` will be converted to `true`.
- **When expected value is a boolean** - The input value `[false, 0, "0", "false"]` will be converted to `false`.
- **When expected value is a number** - The string representation of a number value will be converted to a number.

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  isHiringGuide: vine.literal(true)
})
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  isHiringGuide: vine.literal(true).nullable()
}
```

```ts
{
  isHiringGuide: vine.literal(true).optional()
}
```

## Defining error message

You may define the custom error message using the `literal` rule name.

```ts
const messages = {
  literal: 'The {{ field }} field must be {{ expectedValue }}'
}
```
