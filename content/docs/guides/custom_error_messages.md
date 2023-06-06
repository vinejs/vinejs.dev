# Custom error messages

VineJS has first-class support for defining custom error messages. You may specify a generic error message for a validation rule or define a specific one for a `field + rule` combination.

The error messages are supplied to the `validate` method as a key-value pair.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  username: vine.string(),
  email: vine.string().email(),
})

const data = {}

// highlight-start
const messages = {
  required: 'The {{ field }} field is required',
  string: 'The value of {{ field }} field must be a string',
  email: 'The value is not a valid email address',
}
// highlight-end

const validate = vine.compile(schema)
await validate({
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

For fields inside arrays, you must use the wildcard `(*)` expression to target array children elements.

```ts
const schema = vine.object({
  contacts: vine.array(vine.object({
    email: vine.string().email()
  }))
})

const messages = {
  'contacts.*.email.required': 'Contact email is required'
}
```

## Interpolation
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

## Field names substitution
The `{{ field }}` placeholder inside error messages gets replaced with the input field name. However, you may define a human-readable name for the fields as a key-value pair and supply it to the `validate` method.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  first_name: vine.string(),
  last_name: vine.string().email(),
})

const data = {}

const messages = { 
  required: 'The {{ field }} field is required',
}

// highlight-start
const fields = {
  first_name: 'first name',
  last_name: 'last name',
}
// highlight-end

const validate = vine.compile(schema)
await validate({
  data,
  messages,
  // highlight-start
  fields
  // highlight-end
})
```

## Creating a messages provider
The messages provider allows you to build a custom workflow for defining validation error messages. For example, if you have a multi-lingual web app, you might want to create a message provider that integrates with your translation workflow.

:::warning

Using a custom messages provider will disable the default messages provider. Hence, everything we covered in this guide will no longer be relevant.

:::

- A custom messages provider must implement the `MessagesProviderContact` interface.

- The provider receives the user-defined error messages and fields as constructor arguments.

- The `getMessage` method must return a string value.

```ts
import vine from '@vinejs/vine'
import { MessagesProviderContact } from '@vinejs/vine/types'

export class CustomMessagesProvider implements MessagesProviderContact {
  /**
   * Reference to user defined messages and fields.
   */
  #messages: Record<string, string>
  #fields: Record<string, string>

  constructor(
    messages: Record<string, string>,
    fields: Record<string, string>
  ) {
    this.#messages = messages
    this.#fields = fields
  }
  
  /**
   * Returns the error messages for a given rule id and field.
   */
  getMessage(defaultMessage: string, rule: string, ctx: FieldContext) {
  }
}
```

### Registering messages provider

You may register the custom messages provider globally using the `vine.configure` method or pass it to the `validate` method.

```ts
// title: Configure globally
vine.configure({
  messagesProvider: (messages, fields) => {
    return new CustomMessagesProvider(messages, fields)
  }
})
```

```ts
// title: Define during validation
import { VineOptions } from '@vinejs/vine'

const options: Partial<VineOptions> = {
  messagesProvider: (messages, fields) => {
    return new CustomMessagesProvider(messages, fields)
  }
}

const validate = vine.compile(schema)
await validate({ data }, options)
```
