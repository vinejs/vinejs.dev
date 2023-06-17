---
summary: Get started by installing VineJS inside an existing Node.js project
---

# Getting started

You may install VineJS inside an existing Node.js project from the npm packages registry.

:::warning

VineJS is an ESM only package and will not work with the CommonJS module system

:::

:::codegroup

```sh
// title: npm
npm i @vinejs/vine
```

```sh
// title: yarn
yarn add @vinejs/vine
```

```sh
// title: pnpm
pnpm add @vinejs/vine
```

:::


Once installed, you can import and use VineJS as follows.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  username: vine.string(),
  email: vine.string().email(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .confirmed()
})

const data = {
  username: 'virk',
  email: 'virk@example.com',
  password: 'secret',
  password_confirmation: 'secret',
}

const output = await vine.validate({
  schema,
  data
})

console.log(output)
```

- The `vine.object` method defines the top-level object for the validation schema.

- The validation is performed using the `validate` method. The validate method accepts the `schema` and the `data` object to perform the validation.

- If validation passes, the return value will be a new object with validated properties.

- If validation fails, an exception will be raised.

## Pre-compiling schema
The performance benefits of using VineJS kick in when you pre-compile a schema. During the pre-compile phase, VineJS will convert your schema into an optimized JavaScript function that you can reuse to perform validations.

You may pre-compile a schema using the `vine.compile` method. The compile method returns a validator object you must use to perform validations.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  username: vine.string(),
  email: vine.string().email(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .confirmed()
})

const data = {
  username: 'virk',
  email: 'virk@example.com',
  password: 'secret',
  password_confirmation: 'secret',
}

// highlight-start
const validator = vine.compile(schema)
const output = await validator.validate(data)
// highlight-end

console.log(output)
```

You may pass a custom messages provider or error reporter as the second argument to the `validator.validate` method.

```ts
const validator = vine.compile(schema)
const output = await validator.validate(data, {
  messagesProvider,
  errorReporter,
  meta: {}
})
```

## Handling errors

In case of an error, VineJS will throw a [ValidationError](https://github.com/vinejs/vine/blob/main/src/errors/validation_error.ts) exception. You may access the detailed error messages using the `error.messages` property.

```ts
import vine, { errors } from '@vinejs/vine'

try {
  const validator = vine.compile(schema)
  const output = await validator.validate(data)
} catch (error) {
  if (error instanceof errors.E_VALIDATION_ERROR) {
    console.log(error.messages)
  }
}
```

The `error.messages` property is an array of error objects with the following properties.

- `field` - The name of the field under validation. Nested fields are represented with a dot notation. For example: `contact.email`.
- `message` - Error message.
- `rule` - The rule that reported the error.
- `index?` - Array element index for which the validation failed.
- `meta?` - Optional meta-data set by the validation rule when reporting the error.

## Custom error messages
Error messages workflow in VineJS is managed using the messages provider. VineJS ships with a [simple messages provider](https://github.com/vinejs/vine/blob/develop/src/messages_provider/simple_messages_provider.ts) that accepts error messages for validation rules or a `field + rule` combination.

[Learn more about custom error messages](./custom_error_messages.md).

## Formatting errors

VineJS uses error reporters to change the formatting of error messages. For example, if you follow the [JSON API spec](https://jsonapi.org/format/#errors), you may create an error reporter that formats the errors per the spec.

[Learn more about error reporters](./error_reporter.md).

## Inferring types from schema

The `validate` method output is fully typed; hence, you do not have to perform manual type inference. 

However, if you want to infer types directly from the schema (without performing validation), you may use the `Infer` type helper. For example:

```ts
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

const schema = vine.object({
  username: vine.string(),
  email: vine.string().email(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .confirmed()
})

type UserRegistration = Infer<typeof schema>
/**
 * {
 *   username: string
 *   email: string
 *   password: string
 * }
 */
```
