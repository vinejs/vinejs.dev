# Union type

Unions in VineJS allow expressing conditional validations without losing type safety. You may define union types using the `vine.union`, `vine.unionOfTypes`, or `vine.group` methods. All methods serve different purposes.

:::note
The goal of Unions is to provide accurate type information when narrowing types post-validation.
:::

In this guide, we will look at some real-world examples to better understand different Union APIs.

## Login with phone or email

We all got login forms that may accept a phone number or an email address. Before creating the schema for this login form, let's define the expected TypeScript type.

In the following example, we start with a static object and merge a union of two objects. One contains the `email` field, and the other contains the `phone` field.

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
const emailOrPhone = vine.group([
  vine.group.if((data) => 'email' in data, {
    email: vine.string().email()
  }),
  vine.group.if((data) => 'phone' in data, {
    phone: vine.string().phone()
  }),
])

const loginForm = vine.schema({
  password: vine
    .string()
    .minLength(6)
    .maxLength(32)
})
.merge(emailOrPhone)
```

Currently, the validation will pass if the user does not provide both the `email` and the `phone` number fields. So, let's handle this case and report an error.

The `vine.group` allows you to define a callback using the `otherwise` method. The method is called when none of the group's conditions are `true`.

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
.otherwise((_, ctx) => {
  ctx.report(
    'Enter either the email or the phone number',
    'email_or_phone',
    ctx
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
  accountId: string
} | {
  type: 'paypal',
  email: string
} | {
  type: 'open_collective',
  projectUrl: string
}
```

```ts
const fiscalHost = vine.group([
  vine.group.if((data) => data.type === 'stripe', {
    type: vine.literal('stripe'),
    accountId: vine.string(),
  }),
  vine.group.if((data) => data.type === 'paypal', {
    type: vine.literal('paypal'),
    email: vine.string().email(),
  }),
  vine.group.if((data) => data.type === 'open_collective', {
    type: vine.literal('open_collective'),
    projectUrl: vine.string().url(),
  })
])

const schema = vine.schema({
  type: vine.enum(['enum', 'paypal', 'open_collective'])
}).merge(fiscalHost)
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

const contact = vine.union([
  vine.union.if(
    (value) => vine.helpers.isString(value),
    vine.string().email()
  ),
  vine.union.if(
    (value) => vine.helpers.isObject(value) && 'email' in value,
    vine.object({
      email: vine.string().email(),
    })
  ),
  vine.union.if(
    (value) => vine.helpers.isObject(value) && 'phone' in value,
    vine.object({
      phone: vine.string().mobile(),
    })
  ),
])
.otherwise((_, ctx) => {
  vine.report('Invalid contact type', 'invalid_contact', ctx)
})

const schema = vine.schema({
  contacts: vine.array(contact)
})
```

## Union of types

Unions in VineJS are represented as a conditional (aka predicate) and a schema associated with it.

If you are creating a union of distinct types, meaning the value of a field can either be a `string`, a `number`, a `boolean`, and so on. Then you may skip writing the conditionals yourself and instead use the `unionOfTypes` method.

In the following example, we want the `healthCheck` field to be either a string (formatted as URL) or a boolean. There are two ways to write this schema.

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

const schema = vine.schema({
  healthCheck: healthCheckSchema
})
```

:::caption{for="success"}
**Using vine.unionOfTypes (recommended)**

The `vine.unionOfTypes` method removes the need for conditionals. However, you can use this method only when all types inside the union are distinct.
:::

```ts
const schema = vine.schema({
  healthCheck: vine.unionOfTypes([
    vine.boolean(),
    vine.string().url(),
  ])
})
```

- The `unionOfTypes` method accepts an array of distinct types. If you provide two similar types, then it will throw an error.
- First, we will validate the value type, and if the type matches, we will perform the rest of the validations.

  In the above example, the `url` validation will be performed only when the value is a valid string.
