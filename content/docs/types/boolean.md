# Boolean type

Ensure the field's value is a valid `boolean` or a string representation of a boolean. The following values are converted to `true` or `false`.

- `[true, 1, "1", "true", "on"]` will be converted to `true`.
- `[false, 0, "0", "false"]` will be converted to `false`.
- Every other value will result in a validation error.

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  is_admin: vine.boolean()
})
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  is_admin: vine.boolean().nullable()
}
```

```ts
{
  is_admin: vine.boolean().optional()
}
```

## Defining error message

You may define the custom error message using the `boolean` rule name.

```ts
const messages = {
  boolean: 'The value must be true or false'
}
```

## Strict mode

You may enable the strict mode to disallow the string representation of a boolean. In strict mode, the value's data-type must be a valid JavaScript boolean.

```ts
{
  is_admin: vine.boolean().strict()
}
```
