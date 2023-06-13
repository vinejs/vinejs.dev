---
summary: The Object data type is used to validate an object with unknown properties
---

# Record type

The record type is similar to the [object type](./object.md). However, you may use it to validate objects with unknown keys.

In the following example, we want to accept an object of colors. The object keys can be anything. However, the values should be a valid hex code.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  colors: vine.record(
    vine.string().hexCode()
  )
})

const data = {
  colors: {
    white: '#ffffff',
    black: '#000000',
    lime: '#99d52a'
  }
}

const validate = vine.compile(schema)
const output = await validate(data)
```

Using the following modifiers, you may mark the record as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  colors: vine.record(
    vine.string().hexCode()
  ).nullable()
}
```

```ts
{
  colors: vine.record(
    vine.string().hexCode()
  ).optional()
}
```

## Creating a record of unions

Since the record type accepts any valid VineJS type, you may also use the union type with it.

In the following example, we want the value of each key to be either a hex code or a nested object with a color scale. For example:

:::tip

The `clone` method creates a new instance from an existing schema type. It is a great way to create a base type and then clone it for further modifications.

:::

```ts
const color = vine.string().hexCode()

const scale = vine.object({
  '1': color.clone(),
  '2': color.clone(),
  '3': color.clone(),
  '4': color.clone(),
  '5': color.clone(),
  '6': color.clone(),
  '7': color.clone(),
  '8': color.clone(),
  '9': color.clone(),
  '10': color.clone(),
  '11': color.clone(),
})

{
  colors: vine.record(
    vine.unionOfTypes([color, scale])
  )
}
```

## Defining error messages

You may define custom error messages for the following record based rules.

```ts
const messages = {
  'record': 'The {{ field }} field must be an object',
  'record.minLength': 'The {{ field }} field must have at least {{ min }} items',
  'record.maxLength': 'The {{ field }} field must not have more than {{ max }} items',
  'record.fixedLength': 'The {{ field }} field must contain {{ size }} items'
}

vine.messagesProvider = new SimpleMessagesProvider(messages)
```

## Validations

Following are the validation rules you can apply to a record schema type.

### minLength

Enforce the object keys to have the expected minimum length.

```ts
{
  colors: vine.record(
    vine.string().hexCode()
  ).minLength(1)
}
```

### maxLength

Enforce the object keys to have the expected maximum length.

```ts
{
  colors: vine.record(
    vine.string().hexCode()
  ).maxLength(11)
}
```

### fixedLength

Enforce the object keys to have a fixed length.

```ts
{
  colors: vine.record(
    vine.string().hexCode()
  ).fixedLength(11)
}
```

### validateKeys

The `validateKeys` method allows you to perform custom validation on the object keys by defining a callback. The callback receives an array of keys as the first argument and the [field context](../guides/field_context.md) as the second argument.

```ts
{
  colors: vine
    .record(vine.string().hexCode())
    .validateKeys((keys, field) => {
      const nonNumericKey = keys.find((key) => !vine.helpers.isNumber(key))

      if (!!nonNumericKey) {
        field.report(
          'Color scale must be a valid number', // message
          'record.keys.number', // error id
          field
        )
      }
    })
}
```
