# Error reporter

VineJS uses error reporters to collect errors during the validation lifecycle. A reporter may store and return the errors in any shape. For example, you may create a JSON API reporter that returns errors as per the [JSON API spec](https://jsonapi.org/format/#errors).

## Using error reporters

By default, VineJS uses the [SimpleErrorReporter]() that collects errors as an array of objects. However, you may create and use a custom error reporter as shown in the following example.

```ts
import { errors } from '@vinejs/vine'
import {
  ErrorReporterContract,
  MessagesProviderContract,
} from '@vinejs/vine/types'

export type JSONAPIError = {
  code: string
  detail: string
  source: {
    pointer: string
  }
  meta: { args: any }
}

export class JSONAPIErrorReporter implements ErrorReporterContract {
  hasErrors: boolean = false
  errors: JSONAPIError[] = []
  
  constructor(
    public messagesProvider: MessagesProviderContract
  ) {}
  
  report(defaultMessage, rule, ctx, args) {
    const message = this.messagesProvider.getMessage(
      ...arguments
    )
  
    this.hasErrors = true

    this.errors.push({
      code: rule,
      detail: message,
      source: {
        pointer: ctx.wildCardPath
      }
      meta: { args }
    })
  }
  
  createError() {
    return new errors.E_VALIDATION_ERROR(this.errors)
  }
}
```

Once you have created the error reporter, you may pass it to the `validate` method.

```ts
import vine from '@vinejs/vine'
import { JSONAPIErrorReporter } from './jsonapi_reporter'

const messages = {}

await vine.validate({
  schema,
  data,
  reporter: new JSONAPIErrorReporter(
    vine.getMessagesProvider(messages)
  )
})
```

The error reporter can be configured globally using the `vine.configure` method.

```ts
vine.configure({
  errorReporter: (messagesProvider) => new JSONAPIErrorReporter(
    messagesProvider
  )
})
```
