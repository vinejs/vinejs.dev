---
summary: The Enum data type provides a type-safe API to ensure the field value is from a pre-defined list
---

# Enum type

The `enum` data type ensures the value of a field is from the pre-defined list. The return value data type is a union of values of the pre-defined list.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  role: vine.enum(['admin', 'moderator', 'owner', 'user'])
})

const validate = vine.compile(schema)
const output = await validate(data)

output.role // 'admin' | 'moderator' | 'owner' | 'user'
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  role: vine
    .enum(['admin', 'moderator', 'owner', 'user'])
    .nullable()
}
```

```ts
{
  role: vine
    .enum(['admin', 'moderator', 'owner', 'user'])
    .optional()
}
```

## TypeScript enum data type

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

const schema = vine.object({
  role: vine.enum(Roles)
})

const validate = vine.compile(schema)
const output = await validate(data)

output.role // Roles
```

## Defer computing enum options

You may defer computing the enum options by registering a callback with the `enum` data type. This is usually helpful when the list of options needs access to the runtime data.

```ts
const schema = vine.object({
  creative_device: vine.enum(['mobile', 'desktop']),

  banner_width: vine.enum((field) => {
    if (field.parent.creative_device === 'mobile') {
      return ['320px', '640px'] as const
    }

    return ['1080px', '1280px'] as const
  })
})
```

## Defining error message

You may define the custom error message using the `enum` rule name.

```ts
const messages = {
  enum: 'The selected {{ field }} is invalid'
}

vine.messagesProvider = new SimpleMessagesProvider(messages)
```
