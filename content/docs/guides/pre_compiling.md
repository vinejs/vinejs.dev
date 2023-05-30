# Pre-compiling schema

The performance benefits of using VineJS kick in when you pre-compile a schema. During the pre-compile phase, VineJS will convert your schema into an optimized JavaScript function that you can reuse to perform validations.

The schema compilation is handled by the [@vinejs/compiler](https://github.com/vinejs/compiler) package. Feel free to explore the source code if that interests you.

Let's create a schema and pre-compile it using the `vine.compile` method.

```ts
// title: schemas/user_registration.ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  username: vine.string(),
  email: vine.string().email(),
  password: vine.string().min(8).max(32).confirmed()
})

export const validate = vine.compile(schema)
```

The `vine.compile` method returns a `validate` function you must use to perform validations. The data to validate, custom error messages, and the validator options are provided directly to the `validate` method.

```ts
import { validate } from './schemas/user_registration.js'

const data = {
  username: 'virk',
  email: 'virk@example.com',
  password: 'secret',
  password_confirmation: 'secret',
}

const messages = {
  required: 'The {{ field }} field is required',
  string: 'The value of {{ field }} field must be a string',
  email: 'The value is not a valid email address',
}

await validate({
  data,
  messages
})
```

## Computing options from validation data
If your schema needs access to the validation data to compute validation options, then you will have to defer those 
