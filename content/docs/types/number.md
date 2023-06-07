# Number type

Ensure the field's value is a valid `number` or a string representation of a number. The string values are converted to a number using the [`Number` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

:::note

The number validation will fail when the input value is either [Number.POSITIVE_INFINITY](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/POSITIVE_INFINITY) or [Number.NEGATIVE_INFINITY](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/NEGATIVE_INFINITY).

:::

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  age: vine.number().withoutDecimals()
})
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  age: vine.number().withoutDecimals().nullable()
}
```

```ts
{
  age: vine.number().withoutDecimals().optional()
}
```

## Defining error message

You may define custom error messages for the following number based rules.

```ts
const messages = {
  number: 'The {{ field }} field must be a number',
  min: 'The {{ field }} field must be at least {{ min }}',
  max: 'The {{ field }} field must not be greater than {{ max }}',
  range: 'The {{ field }} field must be between {{ min }} and {{ max }}',
  positive: 'The {{ field }} field must be positive',
  negative: 'The {{ field }} field must be negative',
  decimal: 'The {{ field }} field must have {{ value }} decimal places',
  withoutDecimals: 'The {{ field }} field must not have decimal places',
}
```

## Strict mode

You may enable the strict mode to disallow the string representation of a number. The value's data type must be a valid JavaScript number in strict mode.

```ts
{
  age: vine.number().withoutDecimals().strict()
}
```

## Validations

Following is the list of validation rules you can apply on a string.

### min

Enforce the value to be greater than the pre-defined minimum value.

```ts
vine.object({
  age: vine.number().min(18)
})
```

### max

Enforce the value to be less than the pre-defined minimum value.

```ts
vine.object({
  age: vine
    .number()
    .min(18)
    .max(60)
})
```

### range

Enforce the value to be under the range of minimum and maximum values.

```ts
vine.object({
  age: vine
    .number()
    .range([18, 60])
})
```

### positive

Enforce the value to be a positive number.

```ts
vine.object({
  marks: vine
    .number()
    .positive()
})
```

### negative

Enforce the value to be a negative number.

```ts
vine.object({
  freezing_tempature: vine
    .number()
    .negative()
})
```

### decimal

Enforce the value to be a number with decimal values. You can define fixed decimal places or give a minimum and maximum range.

```ts
vine.object({
  price: vine
    .number()
    .decimal(2) // fixed: 9.99
})

vine.object({
  price: vine
    .number()
    .decimal([0, 2]) // range: 9.99 or 9
})
```

### withoutDecimals
Disallow numeric values with decimal places.

```ts
vine.object({
  age: vine.number().withoutDecimals()
})
```
