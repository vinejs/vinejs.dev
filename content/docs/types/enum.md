# Enum type

The `enum` data type ensures the value of a field is from the pre-defined list. The return value data type is a union of values of the pre-defined list.

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  role: vine.enum(['admin', 'moderator', 'owner', 'user'])
})

const output = await vine.validate({
  schema,
  data
})

output.role // 'admin' | 'moderator' | 'owner' | 'user'
```

You may use the `vine.enum` method with [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html)
as well.

```ts
import vine from '@vinejs/vine'

enum Roles {
  ADMIN = 'admin',
  MOD = 'moderator',
  OWNER = 'owner',
  USER = 'user'
}

const schema = vine.schema({
  role: vine.enum(Roles)
})

const output = await vine.validate({
  schema,
  data
})

output.role // Roles
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  role: vine.enum(Roles).nullable()
}
```

```ts
{
  role: vine.enum(Roles).optional()
}
```

## Defining error message

You may define the custom error message using the `enum` rule name.

```ts
const messages = {
  enum: 'The selected {{ field }} is invalid'
}
```
