# String type

Ensure the field's value is a valid `string`. Empty strings are allowed, and you must handle them using the `convertEmptyStringsToNull` configuration option.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  username: vine.string()
})
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  username: vine.string().nullable()
}
```

```ts
{
  username: vine.string().optional()
}
```

## Defining error messages

You may define custom error messages for the following string-based rules.

```ts
const messages = {
  string: 'The {{ field }} field must be a string',
  email: 'The {{ field }} field must be a valid email address',
  regex: 'The {{ field }} field format is invalid',
  url: 'The {{ field }} field must be a valid URL',
  activeUrl: 'The {{ field }} field must be a valid URL',
  alpha: 'The {{ field }} field must contain only letters',
  alphaNumeric: 'The {{ field }} field must contain only letters and numbers',
  minLength: 'The {{ field }} field must have at least {{ min }} characters',
  maxLength: 'The {{ field }} field must not be greater than {{ max }} characters',
  fixedLength: 'The {{ field }} field must be {{ size }} characters long',
  confirmed: 'The {{ field }} field and {{ otherField }} field must be the same',
  endsWith: 'The {{ field }} field must end with {{ substring }}',
  startsWith: 'The {{ field }} field must start with {{ substring }}',
  sameAs: 'The {{ field }} field and {{ otherField }} field must be the same',
  notSameAs: 'The {{ field }} field and {{ otherField }} field must be different',
  in: 'The selected {{ field }} is invalid',
  notIn: 'The selected {{ field }} is invalid',
  ipAddress: 'The {{ field }} field must be a valid IP address',
  uuid: 'The {{ field }} field must be a valid UUID',
}

const validate = vine.compile(schema)
await validate({
  data,
  messages
})
```

## Validations

Following is the list of validation rules you can apply on a string.

### email

Validate the field's value to be a valid email address. The validation is performed using the [validator.js](https://github.com/validatorjs/validator.js/) library, and you may pass all the options accepted by the [validator.isEmail](https://github.com/validatorjs/validator.js/#:~:text=isEmail(str%20%5B%2C%20options%5D)) method.

See also: [normalizeEmail](#normalizeemail)

```ts
vine.object({
  email: vine
    .string()
    .email(optionsGoesHere)
})
```

### regex

Validate the field's value against a pre-defined regular expression.

```ts
vine.object({
  username: vine
    .string()
    .regex(/^[a-zA-Z0-9]+$/)
})

vine.object({
  username: vine
    .string()
    .regex(new RegExp('^[a-zA-Z0-9]+$'))
})
```

### url

Validate the field's value to be a valid URL. The validation is performed using the [validator.js](https://github.com/validatorjs/validator.js/) library, and you may pass all the options accepted by the [validator.isURL](https://github.com/validatorjs/validator.js/#:~:text=isURL(str%20%5B%2C%20options%5D)) method.


```ts
vine.object({
  health_checks_url: vine
    .string()
    .url({
      require_protocol: true,
      protocols: ['http','https','ftp']
    })
})
```

### activeUrl

Ensure the URL value of a field has valid `A` or `AAAA` DNS records. The DNS lookup is performed using the [dnsPromises.resolve](https://nodejs.org/api/dns.html#dnspromisesresolvehostname-rrtype) method.

```ts
vine.object({
  health_checks_url: vine
    .string()
    .activeUrl()
})
```

### alpha

Validate the field's value only to contain letters, i.e.: `[a-z]` and `[A-Z]`. Optionally allow spaces, underscore, and dashes as well.

```ts
vine.object({
  username: vine
    .string()
    .alpha({
      allowSpaces: false,
      allowUnderscores: true,
      allowDashes: true,
    })
})
```

### alphaNumeric

Validate the field's value only to contain letters and numbers, i.e.: `[a-z]`, `[A-Z]`, and `[0-9]`. Optionally allow spaces, underscore, and dashes as well.

```ts
vine.object({
  username: vine
    .string()
    .alphaNumeric({
      allowSpaces: false,
      allowUnderscores: true,
      allowDashes: true,
    })
})
```

### minLength

Enforce the string to have the minimum pre-defined length.

```ts
vine.object({
  password: vine
    .string()
    .minLength(8)
})
```


### maxLength

Enforce the string to have the maximum pre-defined length.

```ts
vine.object({
  password: vine
    .string()
    .maxLength(32)
})
```

### fixedLength

Enforce the string to have a fixed length.

```ts
vine.object({
  pan_number: vine
    .string()
    .fixedLength(10)
})
```

### confirmed

Ensure the field under validation is confirmed by having another field with the same name and `_confirmation` suffix.

For example, You may use this rule to ensure the user confirms their password by typing it twice. If the field name is `password`, the confirmation field name must be `password_confirmation`.

```ts
const schema = vine.object({
  password: vine
    .string()
    .confirmed()
})

const data = {
  password: 'secret',
  password_confirmation: 'secret'
}

const validate = vine.compile(schema)
await validate({ data })
```

You may modify the confirmation field name as follows.

```ts
const schema = vine.object({
  password: vine
    .string()
    .confirmed({
      confirmationField: 'passwordConfirmation'
    })
})
```

### endsWith

Ensure the field's value ends with the pre-defined substring.

```ts
vine.object({
  email: vine
    .string()
    .endsWith('client_app.com')
})
```

### startsWith

Ensure the field's value starts with the pre-defined substring.

```ts
vine.object({
  email: vine
    .string()
    .startsWith('+91')
})
```

### sameAs

Ensure the field's value under validation is the same as the other field's value.

```ts
vine.object({
  password: vine.string(),
  password_confirmation: vine
    .string()
    .sameAs('password'),
})
```

### notSameAs

Ensure the field's value under validation is different from another field's value.

```ts
vine.object({
  old_email: vine.string().email(),
  email: vine
    .string()
    .email()
    .notSameAs('old_email')
})
```

### in

Ensure the field's value under validation is a subset of the pre-defined list.

See also: [Enum data type for better type inference](./enum.md)

```ts
vine.object({
  role: vine
    .string()
    .in(['admin', 'moderator', 'writer'])
})
```

You may defer computing the list values by registering a callback. The callback must return an array of values.

```ts
vine.object({
  state: vine.string().in(statesList()),
  city: vine
    .string()
    .in((ctx) => {
      return citiesList(ctx.parent.state)
    })
})
```

### notIn

Ensure the field's value under validation is not inside the pre-defined list.

```ts
vine.object({
  username: vine
    .string()
    .notIn(['admin', 'root', 'superuser'])
})
```

Like the `in` validation, you may defer computing the list values by registering a callback.

```ts
vine.object({
  username: vine
    .string()
    .notIn(() => {
      return ['admin', 'root', 'superuser']
    })
})
```

### ipAddress

Validate the field's value to be a valid IP Address. Optionally, you may enforce the IP version as `v4` or `v6`.  Both `ipv4` and `ipv6` values are allowed by default.

```ts
vine.object({
  ip: vine
    .string()
    .ipAddress({ version: 'v4' })
})
```

### uuid

Ensure the field's value to be a valid `uuid`. You may optionally enforce a specific uuid version.

```ts
vine.object({
  id: vine
    .string()
    .uuid({ version: 'v4' })
})
```

### ascii
Ensure the value contains ASCII characters only.

```ts
vine.object({
  greeting: vine
    .string()
    .ascii()
})
```

### ccNumber
Ensure the field's value is a valid credit card number. Optionally, you can define an array of providers from the following list.

- amex
- dinersclub
- discover
- jcb
- mastercard
- unionpay
- visa

```ts
vine.object({
  credit_card: vine
    .string()
    .ccNumber()
})

// Only allow mastercard credit cards
vine.object({
  credit_card: vine
    .string()
    .ccNumber({ provider: ['mastercard'] })
})
```

You may define a callback function to compute the credit card options at runtime lazily. 

```ts
vine.object({
  credit_card: vine
    .string()
    .ccNumber((ctx) => {
      if (ctx.parent.country_code === 'IN') {
        return { provider: ['mastercard', 'amex', 'visa'] }
      }
    })
})
```

### hexCode
Ensure the value is a valid hex code for a color.

```ts
vine.object({
  primary_color: vine.string().hexCode()
})
```

### iban
Ensure the value is a valid IBAN (International Bank Account Number).

```ts
vine.object({
  iban: vine.string().iban()
})
```

### jwt
Ensure the value is formatted as a valid JWT (JSON Web Token).

```ts
vine.object({
  authorization: vine.string().jwt()
})
```

### coordinates
Ensure the value is a string with latitude and longitude coordinates.

```ts
vine.object({
  delivery_location: vine
    .string()
    .coordinates()
})
```

### mobile
Ensure the field's value is a valid mobile number.  The validation is performed using the [validator.js](https://github.com/validatorjs/validator.js/) library, and you may pass all the options accepted by the [validator.isMobilePhone](https://github.com/validatorjs/validator.js/#:~:text=MIME%20type%20format.-,isMobilePhone(str,-%5B%2C%20locale%20%5B%2C%20options%5D%5D)) method.

```ts
vine.object({
  contact_number: vine
    .string()
    .mobile()
})
```

You may define a callback function to compute the options at runtime lazily. 

```ts
vine.object({
  contact_number: vine
    .string()
    .mobile((ctx) => {
      const countryCode = ctx.parent.country_code
      if (vine.helpers.mobileLocales.includes(countryCode)) {
        return {
          locales: [countryCode],
          strictMode: true,
        }
      }
    })
})
```

### passportNumber
Ensure the field's value is formatted as a valid passport number. Optionally, you can define an array of country codes as well.

```ts
vine.object({
  passport: vine
    .string()
    .passportNumber()
})

vine.object({
  passport: vine
    .string()
    .passportNumber({
      countryCodes: ['IN', 'US', 'GB']
    })
})
```

You may define a callback function to compute the options at runtime lazily. 

```ts
vine.object({
  passport: vine
    .string()
    .passportNumber((ctx) => {
      if (ctx.parent.country_code) {
        return {
          countryCodes: [ctx.parent.country_code]
        }
      }
    })
})
```

### postalCode
Ensure the field's value is formatted as a valid postal code. Optionally, you can define an array of country codes as well.

```ts
vine.object({
  postal_code: vine
    .string()
    .postalCode({ countryCodes: ['IN'] })
})
```

You may define a callback function to compute the options at runtime lazily.

```ts
vine.object({
  postal_code: vine
    .string()
    .postalCode((ctx) => {
      if (ctx.parent.country_code) {
        return {
          countryCodes: [ctx.parent.country_code]
        }
      }
    })
})
```

## Mutations

Following is the list of mutations you can apply to a string value.  As the name suggests, mutations normalize or change the input value and do not perform any validations.

### trim

Trim whitespaces from the value.

```ts
vine.object({
  email: vine
    .string()
    .trim()
    .email()
})
```

### normalizeEmail

The `normalizeEmail` method normalizes the email address. The normalization is performed using the [validator.js](https://github.com/validatorjs/validator.js/) library, and you may pass all the options accepted by the [validator.normalizeEmail](https://github.com/validatorjs/validator.js/#:~:text=normalizeEmail(email%20%5B%2C%20options%5D)) method.

```ts
vine.object({
  email: vine
    .string()
    .normalizeEmail({
      all_lowercase: true,
      gmail_remove_dots: true,
    })
})
```

### normalizeUrl

The `normalizeUrl` method normalizes a URL value. The normalization is performed using the [normalize-url](https://github.com/sindresorhus/normalize-url#options) package, and you may pass all the options accepted by the package.

```ts
vine.object({
  health_checks_url: vine
    .string()
    .normalizeUrl({
      normalizeProtocol: true,
      forceHttps: true,
      stripHash: true,
    })
})
```

### escape/encode

The `escape` method escapes HTML entities inside the string value. Under the hood, we use the [he](https://www.npmjs.com/package/he) package, and you may go through its README to learn more about the escaping process.

```ts
vine.object({
  about: vine
    .string()
    .escape()
})
```

You may use the `encode` method to [encode non-ASCII symbols](https://www.npmjs.com/package/he#heescapetext).

```ts
vine.object({
  about: vine
    .string()
    .encode({
      allowUnsafeSymbols: true,
    })
    .escape()
})
```

### toUpperCase

Convert the field value to all uppercase.

```ts
vine.object({
  role: vine
    .string()
    .toUpperCase()
})
```

### toSnakeCase

Convert the field value to snake case.

```ts
vine.object({
  role: vine
    .string()
    .toSnakeCase()
})
```

### toCamelCase

Convert the field value to camel case.

```ts
vine.object({
  role: vine
    .string()
    .toCamelCase()
})
```

### toLowerCase

Convert the field value to lowercase.

```ts
vine.object({
  username: vine
    .string()
    .toLowerCase()
})
```
