---
summary: Convert Vine Schema to JSON Schema
---

# JSON Schema

[JSON Schema](https://json-schema.org/) is a standard for describing the structure of JSON with JSON. It's widely used in [OpenAPI](https://www.openapis.org/) definitions and defining [structured outputs](https://platform.openai.com/docs/guides/structured-outputs?api-mode=chat) for AI.

With VineJS you can **convert Vine schemas into JSON Schemas** using the `toJSONSchema` method.

```ts
import vine from '@vinejs/vine'

const schema = vine.create(vine.object({
  firstName: vine.string().optional(),
  lastName: vine.string().optional(),
  email: vine.string().email(),
}))

schema.toJSONSchema()
// => {
//   type: 'object',
//   properties: { 
//     firstName: { type: 'string' }, 
//     lastName: { type: 'string' } 
//     email: { type: 'string', format: 'email' } 
//   },
//   required: [ 'email' ],
//   additionalProperties: false,
// }
```

:::warning

JSON Schema cannot represent all complex schemas that VineJS can create. We always try to find the closest equivalent, otherwise we represent it as an `Any` type.

:::

## Customize Schema

You can customize the computed JSON schema by using the `meta` modifier.

```ts
vine.string().email().meta({ title: 'Login email' })
// => {
//   type: 'string',
//   format: 'email',
//   title: 'Login email'
// }
```

## Custom rules

You can pass a `toJSONSchema` option when creating [custom rules](../extend/custom_rules.md) to modify the computed JSON schema.

```ts
const lowercaseRule = vine.createRule(
  (value, _, field) => {
    if (!value.match(/[a-z]/)) {
      field.report('The {{ field }} field can only contain lowercase letters', 'lowercase', field)
    }
  },
  {
    toJSONSchema(schema) {
      schema.regex = '/[a-z]/'
    }
  }
)

vine.string().use(lowercaseRule())
// => {
//   type: 'string',
//   regex: '/[a-z]/',
// }
```
