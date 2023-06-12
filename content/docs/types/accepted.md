---
summary: A special data-type to validate HTML checkboxes
---

# Accepted type

The `accepted` schema type is a special type you may use with HTML checkboxes. Please read the [HTML forms and surprises](../guides/html_forms_and_surprises.md#checkboxes-are-not-booleans) guide to learn about the serialization behavior of the `<input type="checkbox">` element.

The `accepted` type ensures the field is present and must have one of the following values.
 
- `"on"`
- `"1"`
- `"yes"`
- `"true"`

If validation passes, the value will be normalized to `true`.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  terms: vine.accepted()
})

const data = {
  terms: 'on'
}

// output { terms: true }
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  terms: vine.accepted().nullable()
}
```

```ts
{
  terms: vine.accepted().optional()
}
```

## Defining error message

You may define the custom error message using the `accepted` rule name.

```ts
const messages = {
  accepted: 'The {{ field }} field must be accepted'
}

vine.messagesProvider = new SimpleMessagesProvider(messages)
```
