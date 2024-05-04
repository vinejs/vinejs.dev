# Creating custom schema types

You might consider creating custom schema types to represent specific data types in your application. For example, if your application deals with financial information like payments, you might want to create a `money` schema type.

In this guide, we will create a `Money` data type using [Dinero.js](https://v2.dinerojs.com/docs).

## What is a schema type?

A schema type represents a JavaScript data type and a collection of validation rules wrapped in an easy-to-use chainable API.

The schema input and output values can be different. For example, you may accept the payment information as a number (in cents) and convert it to a value object post-validation.

## Step 1. Creating a validation rule 
The first step is to create a validation rule to perform the runtime validation for the data type we want to add. In our example, we want to validate the field's value as a number and then convert it to a [dinero amount object](https://v2.dinerojs.com/docs/core-concepts/amount).

:::note

If you follow this guide, install the `dinero.js` and `@dinero.js/currencies` packages from the npm registry.

:::

```ts
import vine from '@vinejs/vine'
import { dinero } from 'dinero.js'
import { USD } from '@dinero.js/currencies'
import { FieldContext } from '@vinejs/vine/types'

const isMoney = vine.createRule((value: unknown, _, field: FieldContext) => {
  /**
   * Convert string representation of a number to a JavaScript
   * Number data type.
   */
  const numericValue = vine.helpers.asNumber(value)

  /**
   * Report error, if the value is NaN post-conversion
   */
  if (Number.isNaN(numericValue)) {
    field.report(
      'The {{ field }} field value must be a number',
      'money',
      field
    )
    return
  }

  /**
   * Create amount type
   */
  const amount = dinero({ amount: numericValue, currency: USD })

  /**
   * Mutate the field's value
   */ 
  field.mutate(amount, field)
})
```

## Step 2. Creating VineMoney schema class
Schema data types are represented as classes and must extend the [BaseLiteralType](https://github.com/vinejs/vine/blob/develop/src/schema/base/literal.ts#L379) class.

```ts
import { dinero, Dinero } from 'dinero.js'
import vine, { BaseLiteralType } from '@vinejs/vine'
import { FieldOptions, Validation } from '@vinejs/vine/types'

type Money = Dinero<number>

export class VineMoney extends BaseLiteralType<string, Money, Money> {
  constructor(options?: FieldOptions, validations?: Validation<any>[]) {
    super(options, validations || [isMoney()])
  }

  clone() {
    return new VineMoney(
      this.cloneOptions(),
      this.cloneValidations()
    ) as this
  }
}
```

- The `BaseLiteralType` class accepts the static types the schema class will accept and output post-validation.
  - The first generic value is the input value.
  - The second generic value is the output type.
  - And the third generic value is the output type after applying the [camelCase modifier](../guides/schema_101.md#converting-the-output-to-camelcase). However, in this example, the types with and without the modifier will be the same.

- The class constructor accepts the initial options and an array of initial validation rules to apply.

- The `clone` method creates a new instance of the same class and provides the constructor a cloned copy of applied options and validations.

## Step 3. Using the VineMoney class
Let's use the `VineMoney` class directly inside a schema for demonstration.

```ts
import vine from '@vinejs/vine'
import { VineMoney } from './types/money.js'

const schema = vine.object({
  product_id: vine.string(),
  amount: new VineMoney(),
})
```

## Step 4. Extending the schema builder
Finally, extend the `Vine` class and add the `money` method. The method on the class will offer an API similar to `vine.string`, `vine.object`, and so on.

```ts
import vine, { Vine } from '@vinejs/vine'
import { VineMoney } from './types/money.js'

Vine.macro('money', function () {
  return new VineMoney()
})

/**
 * Informing TypeScript about the newly added method
 */
declare module '@vinejs/vine' {
  interface Vine {
    money(): VineMoney
  }
}
```

That's all. Now, you can use the `vine.money` method to represent a `Money` data type in your application that accepts a numeric value and outputs a dinero amount object.

Feel free to add methods to the `VineMoney` class to apply additional validations, like `minAmount`, `maxAmount`, and so on.

```ts
const schema = vine.object({
  product_id: vine.string(),
  amount: vine.money(),
})
```
