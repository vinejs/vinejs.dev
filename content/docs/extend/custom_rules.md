# Creating custom rules

VineJS enables you to create custom rules and use them as standalone functions or add them as rules to existing schema types.

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
  ctx: FieldContext
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
    ctx.report(
      'The {{ field }} field is not unique',
      'unique',
      ctx
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
  ctx: FieldContext
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
    ctx.report(
      'The {{ field }} field is not unique',
      'unique',
      ctx
    )
  }
}

// insert-start
/**
 * Converting function to a VineJS rule
 */
export const uniqueRule = vine.createRule(unique)
// insert-end
```

Let's use this rule inside inside a schema.

```ts
import vine from '@vinejs/vine'
import { uniqueRule } from './rules/unique.js'

const schema = vine.schema({
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

VineString.macro('unique', function (options: Options) {
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

VineString.macro('unique', function (options: Options) {
  return this.use(uniqueRule(options))
})
```

That's all. Now, we can use the `unique` method as follows.

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  email: vine
    .string()
    .unique({
      table: 'users',
      column: 'email'
    })
})
```

Like `VineString`, you may add macros to the following classes.

- [VineBoolean]()
- [VineNumber]()
- [VineAccepted]()
- [VineEnum]()
- [VineObject]()
- [VineArray]()
- [VineRoot]()
- [VineRecord]()
- [VineTuple]()
- [VineDate]()
- [VineAny]()
- [VineLiteral]()

## Guarding against invalid values

VineJS stops the validations pipeline after a rule reports an error. For example, if a field fails the `string` validation rule, VineJS will not run the `unique` validation rule.

However, this behavior can be changed by disabling the [bail mode](../guides/schema_101.md#bail-mode). With bail mode disabled, the `unique` rule will be executed, even when the value is not a string.

However, you can find if the field has failed a validation using the `ctx.isValid` property and do not perform the SQL query.

```ts
async function unique(
  value: unknown,
  options: Options,
  ctx: FieldContext
) {
  if (typeof value !== 'string') {
    return
  }
  
  // highlight-start
  if (!ctx.isValid) {
    return
  }
  // highlight-end
  
  const row = await db
   .select(options.column)
   .from(options.table)
   .first()
   
  if (row) {
    ctx.report(
      'The value of {{ field }} field is not unique',
      'unique',
      ctx
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
  implicit: true,
  async: true,
})
```
