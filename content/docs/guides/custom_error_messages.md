---
summary: Learn how you can define custom error messages
---

# Custom error messages

A messages provider manages the workflow for defining custom error messages in VineJS. You can use the default messages provider or create a custom provider that works great for your team and project.

In this guide, we will cover the API of the [simple messages provider](https://github.com/vinejs/vine/blob/develop/src/messages_provider/simple_messages_provider.ts) (shipped with VineJS) and also create a custom messages provider.

## Using the SimpleMessagesProvider
The error messages given to the **simple messages provider** are defined as an object of a key-value pair. The key can be the rule name or the `field + rule` combination; the value is the error message.

```ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  // Applicable for all fields
  'required': 'The {{ field }} field is required',
  'string': 'The value of {{ field }} field must be a string',
  'email': 'The value is not a valid email address',

  // Error message for the username field
  'username.required': 'Please choose a username for your account',
})
```

### Targeting nested fields
You may define custom error messages for nested fields using the dot-separator `(.)`. For example:

```ts
const schema = vine.object({
  profile: vine.object({
    social: vine.object({
      twitter: vine.string()
    })
  })
})

const messages = {
  'profile.social.twitter.required': 'Twitter handle is required.'
}
```

### Targeting array elements

For fields inside arrays, you can either use the wildcard `(*)` expression to target all array elements or define the error message for a specific index.

```ts
const schema = vine.object({
  contacts: vine.array(vine.object({
    email: vine.string().email()
  }))
})

const messages = {
  'contacts.0.email.required': 'The primary email of the contact is required',
  'contacts.*.email.required': 'Contact email is required'
}
```

### Interpolation
You can use dynamic placeholders inside custom error messages, and they will be replaced with the runtime values. 

The `{{ field }}` placeholder is always available; the rest are specific to rules. You may reference the rules documentation to view available placeholders.

```ts
const messages = {
  required: 'The {{ field }} field is required',
  minLength: 'The {{ field }} field must be {{ min }} characters long',
  date: 'The {{ field }} field must be formatted as {{ format }}'
}

// username: Will translate to following
// The username field is required
```

### Field names substitution
The `{{ field }}` placeholder inside error messages gets replaced with the input field name. However, you may define a human-readable name for the fields as a key-value pair and supply it to the `validate` method.

```ts
import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const messages = { 
  required: 'The {{ field }} field is required',
}

// highlight-start
const fields = {
  first_name: 'first name',
  last_name: 'last name',
}
// highlight-end

vine.messagesProvider = new SimpleMessagesProvider(messages, fields)
```

## Creating a messages provider
As discussed earlier, the messages provider allows you to build a custom workflow for defining validation error messages. For example, if you have a multi-lingual web app, you should create a message provider that integrates with your translation workflow.

:::warning
Using a custom messages provider will disable the default messages provider. Hence, everything we covered in this guide will no longer be relevant.
:::

A custom messages provider must implement the `MessagesProviderContact` interface. VineJS will call the `getMessage` method to resolve an error message for a given rule and field.

```ts
import vine from '@vinejs/vine'
import { FieldContext, MessagesProviderContact } from '@vinejs/vine/types'

export class CustomMessagesProvider implements MessagesProviderContact {
  /**
   * Returns the error messages for a given rule id and field.
   */
  getMessage(
    defaultMessage: string,
    rule: string,
    field: FieldContext,
    meta?: Record<string, any>
  ) {
    // resolve and return error message from some collection
  }
}
```

## Registering messages provider
The messages provider can be defined globally, at the per-schema level, or when executing the `validate` method.

```ts
// title: Configure globally
import vine from '@vinejs/vine'

vine.messagesProvider = new CustomMessageProvider()
```

```ts
// title: Per schema level
import vine from '@vinejs/vine'

const validator = vine.create({})

validator.messagesProvider = new CustomMessageProvider()
```

```ts
// title: During validation call
import vine from '@vinejs/vine'
const validator = vine..create({})

validator.validate(data, {
  messagesProvider: new CustomMessageProvider()
})
```
