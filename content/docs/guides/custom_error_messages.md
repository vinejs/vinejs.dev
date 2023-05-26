# Custom error messages

VineJS has first-class support for defining custom error messages. You may specify a generic error message for a validation rule or define a specific one for a `field + rule` combination.

The error messages are supplied to the `vine.validate` method as an object or function.

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  username: vine.string(),
  email: vine.string().email(),
})

// highlight-start
const messages = {
  required: 'The {{ field }} field is required',
  string: 'The value of {{ field }} field must be a string',
  email: 'The value is not a valid email address',
}
// highlight-end

const data = {}

await vine.validate({
  schema,
  data,
  // highlight-start
  messages,
  // highlight-end
})
```

In the above example, we have defined error messages for validation rules that will be applied to all the fields.

However, you may prefix the field name to the validation rule to define field-specific error messages. For example:

```ts
const messages = {
  'username.required': 'Please choose a username for your account. This will be your public handle',
  'email.required': 'Please enter an email address.'
}
```

## Targeting nested fields

You may define custom error messages for nested fields using the dot-separator `(.)`. For example:

```ts
const schema = vine.schema({
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

For fields inside arrays, you must use the wildcard `(*)` expression to target array children elements.

```ts
const schema = vine.schema({
  contacts: vine.array(vine.object({
    email: vine.string().email()
  }))
})

const messages = {
  'contacts.*.email.required': 'Contact email is required'
}
```

## Using a messages provider
The messages provider allows you to build a custom workflow for defining validation error messages. For example, if you have a multi-lingual web-app, then you might want to create a messages provider that integrates with your translations workflow.

:::note

Using a custom messages provider will disable the default messages provider, hence everything we covered so far in this guide will not be relevant anymore.

:::


```ts
import vine from '@vinejs/vine'
import { MessagesProviderContact } from '@vinejs/vine/types'

class CustomMessagesProvider implements MessagesProviderContact {
  #messages: Record<string, string> = {}

  constructor(messages: Record<string, string>) {
    this.#messages = messages
  }
  
  getMessage(rawMessage: string, rule: string, ctx: FieldContext) {
    // return message as a string
  }
}
```

You may define a custom messages provider to the `vine.validate` method, or configure it globally using the `vine.configure` method.

```ts
const errorReporter = new CustomMessagesProvider(
  vine.getMessagesProvider(messages)
)

await vine.validate({
  schema,
  data,
  errorReporter
})
```

```ts
vine.configure({
  messagesProvider: (messages) => new CustomMessagesProvider(
    messages
  )
})
```
