---
summary: Learn how to extend VineJS by creating custom rules and extending schema classes
---

# Creating custom rules

VineJS allows you to create custom rules and use them either as standalone functions or add them as methods to existing schema classes.

A custom rule is a function that performs either validation or normalizes the value of a field. It receives the following parameters.

- The value of the field under validation. The value is `unknown`; therefore, you must check for its type before using it.
- The options accepted by the rule. If the rule accepts no options, the 2nd parameter will be `undefined`.
- Finally, it receives the [field context](../guides/field_context.md) as the 3rd parameter.

For demonstration, we will create a rule named `unique`, that queries the database to ensure the value is unique inside a table.

```ts
// title: rules/unique.ts
import { FieldContext } from '@vinejs/vine/types'

/**
 * Options accepted by the unique rule
 */
type Options = {
  table: string
  column: string
}

/**
 * Implementation
 */
async function unique(
  value: unknown,
  options: Options,
  field: FieldContext
) {
  /**
   * We do not want to deal with non-string
   * values. The "string" rule will handle the
   * the validation.
   */
  if (typeof value !== 'string') {
    return
  }
  
  const row = await db
   .select(options.column)
   .from(options.table)
   .where(options.column, value)
   .first()
   
  if (row) {
    field.report(
      'The {{ field }} field is not unique',
      'unique',
      field
    )
  }
}
```

With our `unique` rule implementation completed, we can convert this function to a VineJS rule using the `vine.createRule` method. 

The `createRule` method accepts the validation function and returns a new function you can use with any schema type.

```ts
// title: rules/unique.ts
import { FieldContext } from '@vinejs/vine/types'

/**
 * Options accepted by the unique rule
 */
type Options = {
  table: string
  column: string
}

/**
 * Implementation
 */
async function unique(
  value: unknown,
  options: Options,
  field: FieldContext
) {
  /**
   * We do not want to deal with non-string
   * values. The "string" rule will handle the
   * the validation.
   */
  if (typeof value !== 'string') {
    return
  }
  
  const row = await db
   .from(options.table)
   .select(options.column)
   .where(options.column, value)
   .first()
   
  if (row) {
    field.report(
      'The {{ field }} field is not unique',
      'unique',
      field
    )
  }
}

// insert-start
/**
 * Converting a function to a VineJS rule
 */
export const uniqueRule = vine.createRule(unique)
// insert-end
```

Let's use this rule inside a schema.

```ts
import vine from '@vinejs/vine'
import { uniqueRule } from './rules/unique.js'

const schema = vine.object({
  email: vine
    .string()
    // highlight-start
    .use(
      uniqueRule({ table: 'users', column: 'email' })
    )
    // highlight-end
})
```

## Extending schema classes

As a next step, you may extend the `VineString` class and a `unique` method to it. The method on the class will offer a chainable API for calling the `unique` rule, similar to how we apply `email` or `url` rules.

```ts
import { VineString } from '@vinejs/vine'
import { uniqueRule, Options } from './rules/unique.js'

VineString.macro('unique', function (this: VineString, options: Options) {
  return this.use(uniqueRule(options))
})
```

Since the `unique` method is added to the `VineString` class at runtime, we must inform TypeScript about it using [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html).

```ts
import { VineString } from '@vinejs/vine'
import { uniqueRule, Options } from './rules/unique.js'

// insert-start
declare module '@vinejs/vine' {
  interface VineString {
    unique(options: Options): this
  }
}
// insert-end

VineString.macro('unique', function (this: VineString, options: Options) {
  return this.use(uniqueRule(options))
})
```

That's all. Now, we can use the `unique` method as follows.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  email: vine
    .string()
    .unique({
      table: 'users',
      column: 'email'
    })
})
```

Like `VineString`, you may add macros to the following classes.

- [VineBoolean](https://github.com/vinejs/vine/blob/4.x/src/schema/boolean/main.ts)
- [VineNumber](https://github.com/vinejs/vine/blob/4.x/src/schema/number/main.ts)
- [VineAccepted](https://github.com/vinejs/vine/blob/4.x/src/schema/accepted/main.ts)
- [VineEnum](https://github.com/vinejs/vine/blob/4.x/src/schema/enum/main.ts)
- [VineObject](https://github.com/vinejs/vine/blob/4.x/src/schema/object/main.ts)
- [VineArray](https://github.com/vinejs/vine/blob/4.x/src/schema/array/main.ts)
- [VineRecord](https://github.com/vinejs/vine/blob/4.x/src/schema/record/main.ts)
- [VineTuple](https://github.com/vinejs/vine/blob/4.x/src/schema/tuple/main.ts)
- [VineDate](https://github.com/vinejs/vine/blob/4.x/src/schema/date/main.ts)
- [VineAny](https://github.com/vinejs/vine/blob/4.x/src/schema/any/main.ts)
- [VineLiteral](https://github.com/vinejs/vine/blob/4.x/src/schema/literal/main.ts)
- [VineNativeFile](https://github.com/vinejs/vine/blob/4.x/src/schema/native_file/main.ts)

## Guarding against invalid values

VineJS stops the validations pipeline after a rule reports an error. For example, if a field fails the `email` validation rule, VineJS will not run the `unique` validation rule.

However, this behavior can be changed by turning off the [bail mode](../guides/schema_101.md#bail-mode). With bail mode disabled, the `unique` rule will be executed, even when the `email` validation has failed.

However, you can find if the field has failed a validation using the `field.isValid` property and do not perform the SQL query.

:::note
Disabling `bail` mode has no impact if a field has failed the data-type validation. For example, if the value of a field is not a `string`, then none of the validations will run.
:::

```ts
async function unique(
  value: unknown,
  options: Options,
  field: FieldContext
) {
  if (typeof value !== 'string') {
    return
  }
  
  // highlight-start
  if (!field.isValid) {
    return
  }
  // highlight-end
  
  const row = await db
   .select(options.column)
   .from(options.table)
   .first()
   
  if (row) {
    field.report(
      'The value of {{ field }} field is not unique',
      'unique',
      field
    )
  }
}
```

## Creating an implicit rule

As per the default behavior of VineJS, a rule is not executed if the field's value is `null` or `undefined`. However, if you want the rule to be executed regardless of the value, you must mark it as an `implicit` rule.

```ts
export const uniqueRule = vine.createRule(unique, {
  implicit: true
})
```

## Marking rule as async

Since VineJS is built with performance in mind, we do not `await` rules when they are synchronous.

If a rule uses the `async` keyword, we consider it async and make sure to `await` it. However, there are many ways to create async functions in JavaScript, which are tricky to detect.

Therefore, if you are creating an async function without the `async` keyword, make sure to notify the `createRule` method explicitly.

```ts
export const uniqueRule = vine.createRule(unique, {
  async: true,
})
```

## Testing rules
You may use the `validator` test factory to write unit tests for your custom validation rules. 

The `validator.executeAsync` method accepts the validation rule and the value to validate. The output is an instance of [ValidationResult](https://github.com/vinejs/vine/blob/main/factories/validator.ts#L19) you can use to write assertions.

```ts
import { validator } from '@vinejs/vine/factories'
import { uniqueRule } from '../src/rules/unique.js'

const value = 'foo@bar.com'
const unique = uniqueRule({ table: 'users', column: 'email' })

const validated = await validator.executeAsync(unique, value)

/**
 * Assert the validation succeeded.
 */
validated.assertSucceeded()
```

You may use the `assertErrorsCount` and `assertError` methods to ensure the validation fails with a given error message.

```ts
const value = 'foo@example.com'
const unique = uniqueRule({ table: 'users', column: 'email' })

const validated = await validator
  .withContext({
    fieldName: 'email'
  })
  .executeAsync(unique, value)

validated.assertErrorsCount(1)
validated.assertError('The email field is not unique')
```

### Available assertions
Following is the list of available assertion methods

```ts
/**
 * Assert the validation succeeded
 */
validated.assertSucceeded()

/**
 * Assert the value output after validation. You may
 * use this assertion if the rule mutates the field's
 * value.
 */
validated.assertOutput(expectedOutput)

/**
 * Assert the validation failed
 */
validated.assertFailed()

/**
 * Assert expected errors count
 */
validated.assertErrorsCount(1)

/**
 * Assert an error with the expected text is reported
 * during validation
 */
validated.assertError('The email field is not unique')
```

### Executing a chain of validations
Suppose your validation rule relies on other validation rules. In that case, you may pass an array of validations to the `executeAsync` method, and all the validations will be executed in the defined sequence.

```ts
import { VineString } from '@vinejs/vine'
import { uniqueRule } from '../src/rules/unique.js'

const email = VineString.rules.email()
const unique = uniqueRule({ table: 'users', column: 'email' })

const validated = await validator.executeAsync([
  email,
  unique,
], value)
```

### Defining custom field context
You may pass a custom [field context](../guides/field_context.md) using the `withContext` method. The context object will be merged with the default context created by the test factory.

```ts
await validator
  .withContext({
    fieldName: 'email',
    wildCardPath: 'profile.email'
  })
  .executeAsync(unique, value)
```

### Disabling bail mode
You may disable the [bail mode](../guides/schema_101.md#bail-mode) using the `bail` method.

```ts
await validator
  .bail(false)
  .executeAsync(unique, value)
```
