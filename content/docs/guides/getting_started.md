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

You may pre-compile a schema and create a validator using the `vine.create` method.

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
const validator = vine.create(schema)
const output = await validator.validate(data)
// highlight-end

console.log(output)
```

The `vine.create` method also works with a top-level object. It eliminates the need of nested calls `vine.create(vine.object())` and create a validator as follows.

```ts
const validator = vine.create({
  username: vine.string(),
  email: vine.string().email(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .confirmed()
})
```

## Synchronous validation

Use `validateSync` when your code needs a result without returning or awaiting a Promise. It returns the validated output directly, typed as `Infer<Schema>`, and throws validation errors immediately. This API is for synchronous code paths, not a performance optimization.

```ts
import vine from '@vinejs/vine'

const validator = vine.create({
  email: vine.string().email(),
  age: vine.number(),
})

const data = { email: 'virk@example.com', age: '32' }
const output = validator.validateSync(data)
// { email: 'virk@example.com', age: 32 }
```

To receive validation errors as a return value, use `tryValidateSync`. It returns `[ValidationError, null]` on failure or `[null, Infer<Schema>]` on success, without a Promise.

```ts
const [error, output] = validator.tryValidateSync(data)

if (error) {
  console.log(error.messages)
} else {
  console.log(output.email)
}
```

`tryValidateSync` catches only `ValidationError`. Other errors, including incompatible async rules, still throw.

Both methods accept the same options as their async counterparts, including [metadata](./schema_101.md#validation-metadata), [`messagesProvider`](./custom_error_messages.md#registering-messages-provider), and [`errorReporter`](./error_reporter.md#registering-the-error-reporter). Metadata declared with `vine.withMetaData` remains required.

The `vine` instance also provides shortcuts that accept the schema, data, and validation options in one object.

```ts
const schema = vine.object({
  email: vine.string().email(),
})

const output = vine.validateSync({ schema, data })
const [error, result] = vine.tryValidateSync({ schema, data })
```

A validator compiles its synchronous validation function on the first sync call and caches it for later calls. Reuse a validator when validating repeatedly instead of using the shortcuts.

### Compatible schemas

The entire schema must be synchronous, including rules inside nested objects, arrays, unions, and conditional branches, even branches that the current input does not use. For example, [`activeUrl()`](../types/string.md#activeurl) performs an async DNS lookup and cannot be used with synchronous validation.

The first sync call rejects a schema containing any async rule. You can still create that validator and use its async methods. A custom rule declared synchronous that returns a Promise or thenable is rejected at runtime.

The existing `validate`, `tryValidate`, and Standard Schema `~standard.validate` methods remain asynchronous and unchanged.

## Handling errors

In case of an error, VineJS will throw a [ValidationError](https://github.com/vinejs/vine/blob/main/src/errors/validation_error.ts) exception. You may access the detailed error messages using the `error.messages` property.

```ts
import vine, { errors } from '@vinejs/vine'

try {
  const validator = vine.create({})
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

### Infer input types

You can infer the input data accepted by your schema using the `InferInput` type helper.

```ts
import vine from '@vinejs/vine'
import { InferInput } from '@vinejs/vine/types'

const schema = vine.object({
  username: vine.string(),
  email: vine.string().email(),
  is_admin: vine.boolean(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
})

type UserRegistrationInput = InferInput<typeof schema>
/**
 * {
 *   username: string
 *   email: string
 *   is_admin: boolean | string | number
 *   password: string
 * }
 */
```
