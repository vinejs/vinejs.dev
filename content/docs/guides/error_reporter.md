---
summary: Learn how to format error messages using error reporters
---

# Error reporter

VineJS uses error reporters to collect errors during the validation lifecycle. A reporter decides the formatting of errors you will get after the `validate` method call. 

By default, VineJS uses the [SimpleErrorReporter](https://github.com/vinejs/vine/blob/main/src/reporters/simple_error_reporter.ts) and exposes an API to create and register custom error reporters.

## The SimpleErrorReporter
The `SimpleErrorReporter` reporter is configured as the default error reporter; hence you do not have to configure it manually. The error reporter returns an array of messages with the following properties.

```ts
import vine, { errors } from '@vinejs/vine'

try {
  const validate = vine.compile(schema)
  const output = await validate({ data })
} catch (error) {
  if (error instanceof errors.E_VALIDATION_ERROR) {
    // array created by SimpleErrorReporter
    console.log(error.messages)
  }
}
```

- `field` - The name of the field under validation. Nested fields are represented with a dot notation. For example: `contact.email`.
- `message` - Error message.
- `rule` - The rule that reported the error.
- `index?` - Array element index for which the validation failed.
- `meta?` - Optional meta-data set by the validation rule when reporting the error.

## Creating a custom error reporter
An error reporter is represented as a class and must implement the `ErrorReporterContract` interface.

- The `hasError` flag is used to find if the VineJS validation pipeline has reported one or more errors. You must set its value to `true` inside the `report` method.

- VineJS call the `report` method to report an error. The method receives the following arguments.
  - The validation error message
  - The name of the rule
  - Current [field's context](./field_context.md)
  - And an optional meta-data to associate with the error. The meta-data is passed by the validation rules at the time of reporting
  the error.

- The `createError` method must return an instance of [ValidationError](https://github.com/vinejs/vine/blob/main/src/errors/validation_error.ts) class and pass it the error messages.

```ts
import { errors } from '@vinejs/vine'
import {
   FieldContext,
   ErrorReporterContract
} from '@vinejs/vine/types'

export class JSONAPIErrorReporter implements ErrorReporterContract {
  /**
   * A flag to know if one or more errors have been
   * reported
   */
  hasErrors: boolean = false

  /**
   * A collection of errors. Feel free to give accurate types
   * to this property
   */
  errors: any[] = []

  /**
   * VineJS call the report method
   */
  report(
    message: string,
    rule: string,
    field: FieldContext,
    meta?: any
  ) {
    this.hasErrors = true

    /**
     * Collecting errors as per the JSONAPI spec
     */
    this.errors.push({
      code: rule,
      detail: message,
      source: {
        pointer: field.wildCardPath
      },
      ...(meta ? { meta } : {})
    })
  }

  /**
   * Creates and returns an instance of the
   * ValidationError class
   */
  createError() {
    return new errors.E_VALIDATION_ERROR(this.errors)
  }
}
```

## Registering the error reporter
The error reporter can be defined globally, at the per-schema level, or when executing the `validate` method. 

Since VineJS creates a fresh instance of `errorReporter` for each validation cycle, you must register a factory function that returns an instance of the error reporter.

```ts
// title: Configure globally
import vine from '@vinejs/vine'

vine.errorReporter = () => new JSONAPIErrorReporter()
```

```ts
// title: Per schema level
import vine from '@vinejs/vine'

const validator = vine.compile(
  vine.object({})
)

validator.errorReporter = () => new JSONAPIErrorReporter()
```

```ts
// title: During validation call
import vine from '@vinejs/vine'
const validator = vine.compile(
  vine.object({})
)

validator.validate(data, {
  errorReporter: () => new JSONAPIErrorReporter()
})
```
