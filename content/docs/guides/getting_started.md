# Getting started

You may install VineJS inside an existing Node.js project from the npm packages registry.

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

const schema = vine.schema({
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

- The `vine.schema` method defines the validation schema.

- The validation is performed using the `validate` method. The validate method accepts the `schema` and the `data` object to perform the validation.

- If validation passes, the return value will be a new object with validated properties.

- If validation fails, an exception will be raised.

## Pre-compiling schema
<!-- The performance benefits of VineJS kick in when you pre-compile your schemas and use the output to perform the validations. Read our dedicated guide on [pre-compiling](./pre_compiling.md) to learn more about the API. -->

The performance benefits of using VineJS kick in when you pre-compile a schema. During the pre-compile phase, VineJS will convert your schema into an optimized JavaScript function that you can reuse to perform validations.

You may pre-compile a schema using the `vine.compile` method. The compile method returns a `validate` function you must use to perform validations. The data to validate, custom error messages, and the validator options are provided directly to the `validate` method.

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
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
const validate = vine.compile(schema)
const output = await validate({ data })
// highlight-end

console.log(output)
```

## Handling errors

In case of an error, VineJS will throw a [ValidationError]() exception. You may access the detailed error messages using the `error.messages` property.

```ts
import vine, { errors } from '@vinejs/vine'

try {
  const validate = vine.compile(schema)
  const output = await validate({ data })
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
- `index` - Array element index for which the validation failed.

## Custom error messages

You may define custom error messages when calling the `validate` method. Messages can be defined for rules or a `field + rule` combination.

See also: [Guide on custom error messages](./custom_error_messages.md)

```ts
const messages = {
  'required': 'The {{ field }} field is required',
  'email': 'Enter a valid email address',
  'password.minLength': 'Password must be 8 characters long'
}

const validate = vine.compile(schema)
const output = await validate({
  data,
  messages
})
```

## Formatting errors

VineJS uses error reporters to change the formatting of error messages. For example, if you follow the [JSON API spec](https://jsonapi.org/format/#errors), you may create an error reporter that formats the errors per the spec.

[Learn more about error reporters](./error_reporter.md).

## Inferring types from schema

The `validate` method output is fully typed; hence, you do not have to perform manual type inference. 

However, if you want to infer types directly from the schema (without performing validation), you may use the `Infer` type helper. For example:

```ts
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

const schema = vine.schema({
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

## Configuring Vine

You may configure Vine using the `vine.configure` method. The configuration options are applied globally and will impact all the schemas.

```ts
import vine from '@vinejs/vine'

vine.configure({
  convertEmptyStringsToNull: true,
  messagesProvider: (messages) => {
    return new CustomMessageProvider(messages)
  },
  errorReporter: () => {
    return new CustomErrorReporter()
  }
})
```

<dl>

<dt>

convertEmptyStringsToNull

</dt>

<dd>

When set to `true`, all empty string values will be converted to `null`. You can learn more about when to enable this flag in the [HTML forms and surprises](./html_forms_and_surprises.md) guide.

</dd>

<dt>

messagesProvider

</dt>

<dd>

The messages provider is an object with the `getMessage` method. You may create a messages provider to build a custom workflow around error messages.

</dd>


<dt>

errorReporter

</dt>

<dd>

The [error reporter](./error_reporter.md) to use to format the error messages.

</dd>

</dl>
