---
summary: The Union data type provides a type-safe API for expressing conditional validations
---

# Union type

Unions in VineJS allow expressing conditional validations without losing type safety. You may define union types using the `vine.union`, `vine.unionOfTypes`, or `vine.group` methods. All methods serve different purposes.

In this guide, we will look at some real-world examples to better understand different Union APIs.

## Login with phone or email

We all got login forms that may accept a phone number or an email address along with a password. If the user provides an email, we will validate it for the `email` format and validate the phone number for the `mobile` format.

Following is the visual representation of the data we want to accept. First is a static object with the `password` field, followed by a union of objects with `email` or the `phone` number.

```ts
/**
 * Just for visualization purposes. Not required by VineJS
 */
type LoginForm = {
  password: string
} & ({
  email: string
} | {
  phone: string
})
```

Let's reproduce the `LoginForm` type using the `vine.group` method.

```ts
// highlight-start
const emailOrPhone = vine.group([
  vine.group.if((data) => 'email' in data, {
    email: vine.string().email()
  }),
  vine.group.if((data) => 'phone' in data, {
    phone: vine.string().mobile()
  }),
])
// highlight-end

const loginForm = vine.object({
  password: vine
    .string()
    .minLength(6)
    .maxLength(32)
})
// highlight-start
.merge(emailOrPhone)
// highlight-end
```

Post validation, you can check if the user has provided `email` or the `phone` number and perform a database search accordingly.

```ts
const validator = vine.create(loginForm)
const payload = await validator.validate(data)

if ('email' in payload) {
  // search using email
} else {
  // search using phone number
}
```

The validation will fail, if both the `email` and the `phone` number fields are missing. If needed, you can report a custom error by defining an `otherwise` clause.

```ts
const emailOrPhone = vine.group([
  vine.group.if((data) => 'email' in data, {
    email: vine.string().email()
  }),
  vine.group.if((data) => 'phone' in data, {
    phone: vine.string().mobile({ strict: true })
  }),
])
// highlight-start
.otherwise((_, field) => {
  field.report(
    'Enter either the email or the phone number',
    'email_or_phone',
    field
  )
})
// highlight-end
```

## Selecting a fiscal host

Let's explore an example of a [discriminated union](https://basarat.gitbook.io/typescript/type-system/discriminated-unions). This time, we want the user to select a fiscal host (a term taken from Github sponsors), and based on their selection, we will validate additional fields.

In the following example, the `type` property serves as a discriminant.

```ts
/**
 * Just for visualization purposes. Not required by VineJS
 */
type FiscalHost = {
  type: 'stripe',
  account_id: string
} | {
  type: 'paypal',
  email: string
} | {
  type: 'open_collective',
  project_url: string
}
```

```ts
const stripe = {
  type: vine.literal('stripe'),
  account_id: vine.string(),
}

const paypal = {
  type: vine.literal('paypal'),
  email: vine.string().email(),
}

const oc = {
  type: vine.literal('open_collective'),
  project_url: vine.string().url(),
}

const fiscalHost = vine.group([
  vine.group.if((data) => data.type === 'stripe', stripe),
  vine.group.if((data) => data.type === 'paypal', paypal),
  vine.group.if((data) => data.type === 'open_collective', oc)
])

const schema = vine
  .object({
    type: vine.enum(['stripe', 'paypal', 'open_collective'])
  })
  // highlight-start
  .merge(fiscalHost)
  // highlight-end
```

In the above example, we do not need the `otherwise` method because we define an `enum` validation on the `type` property regardless of the union conditions.

## Creating a top-level union type

In the previous examples, we have created a union of objects and merged them into an existing object. However, you may also create a union of top-level types.

For example, you want to validate an array of contacts, and each contact may have one of the following possible values.

- An object with an email field.
- An object with a phone number field.
- String value representing an email address.

```ts
/**
 * Just for visualization purposes. Not required by VineJS
 */
type Contact = string | {
  email: string
} | {
  phone: string
}
```

```ts
import vine from '@vinejs/vine'

const emailField = vine.string().email()

const emailSchema = vine.object({
  email: emailField.clone(),
})

const phoneSchema = vine.object({
  phone: vine.string().mobile(),
})

const contact = vine.union([
  vine.union.if(
    (value) => vine.helpers.isString(value),
    emailField
  ),
  vine.union.if(
    (value) => vine.helpers.isObject(value) && 'email' in value,
    emailSchema
  ),
  vine.union.if(
    (value) => vine.helpers.isObject(value) && 'phone' in value,
    phoneSchema
  ),
])
.otherwise((_, field) => {
  vine.report('Invalid contact type', 'invalid_contact', field)
})

const schema = vine.object({
  contacts: vine.array(contact)
})
```

## Union of types

Unions in VineJS are represented as a conditional (aka predicate) and a schema associated with it.

If you are creating a union of distinct types, meaning the value of a field can either be a `string`, a `number`, a `boolean`, and so on. Then you may skip writing the conditionals yourself and instead use the `unionOfTypes` method.

In the following example, we want the `health_check` field to be either a string (formatted as URL) or a boolean. There are two ways to write this schema.

:::caption{for="error"}
**Using vine.union (not recommended)**

When using the `vine.union` method, you must write the conditionals yourself. For example:
:::

```ts
const healthCheckSchema = vine.union([
  vine.union.if(
    (value) => vine.helpers.string(value),
    vine.string().url()
  ),
  vine.union.else(vine.boolean())
])

const schema = vine.object({
  health_check: healthCheckSchema
})
```

:::caption{for="success"}
**Using vine.unionOfTypes (recommended)**

The `vine.unionOfTypes` method removes the need for conditionals. However, you can use this method only when all types inside the union are distinct.
:::

```ts
const schema = vine.object({
  health_check: vine.unionOfTypes([
    vine.boolean(),
    vine.string().url(),
  ])
})
```

- The `unionOfTypes` method accepts an array of distinct types. If you provide two similar types, then it will throw an error.

- First, we will validate the value type, and if the type matches, we will perform the rest of the validations. In the above example, the `url` validation will be performed only when the value is a valid string.

- Following is the list of schema types you can use with the `unionOfTypes` method.
  - `vine.string`
  - `vine.boolean`
  - `vine.number`
  - `vine.object / vine.record`
  - `vine.array / vine.tuple`
  - `vine.literal`
  - `vine.nativeFile`

## Defining error messages
You can define custom error messages for the following error codes. The error messages are only used when you have not defined the `otherwise` clause.

```ts
const messages = {
  'union': 'Invalid value provided for {{ field }} field',
  'unionGroup': 'Invalid value provided for {{ field }} field',
  'unionOfTypes': 'Invalid value provided for {{ field }} field',
}

vine.messagesProvider = new SimpleMessagesProvider(messages)
```
