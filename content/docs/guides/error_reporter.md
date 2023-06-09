---
summary: Learn how to format error messages using error reporters
---

# Error reporter

VineJS uses error reporters to collect errors during the validation lifecycle. A reporter decides the formatting of errors you will get after the `validate` method call. 

By default, VineJS uses the [SimpleErrorReporter](https://github.com/vinejs/vine/blob/main/src/reporters/simple_error_reporter.ts) and exposes an API to create and register custom error reporters.

## Creating an error reporter
An error reporter is represented as a class and must implement the `ErrorReporterContract` interface.

- The `hasError` flag is used to find if one or more errors have been reported by VineJS validation pipeline. You must set its value to `true` inside the `report` method.

- The `report` method is called by VineJS to report an error. The method receives the following arguments.
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
   * The report method is called by VineJS
   */
  report(
    message: string,
    rule: string,
    ctx: FieldContext,
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
        pointer: ctx.wildCardPath
      },
      ...(meta ? { meta } : {})
    })
  }

  /**
   * Creates and returns an instance of the
   * ValidationError class
   */
  createError() {
    return errors.E_VALIDATION_ERROR(this.errors)
  }
}
```

### Registering the error reporter

You may register the custom error reporter globally using the `vine.configure` method or pass it to the `validate` method.

```ts
// title: Configure globally
vine.configure({
  errorReporter: () => new JSONAPIErrorReporter()
})
```

```ts
// title: Define during validation
import { VineOptions } from '@vinejs/vine'

const options: Partial<VineOptions> = {
  errorReporter: () => new JSONAPIErrorReporter()
}

const validate = vine.compile(schema)
await validate({ data }, options)
```

