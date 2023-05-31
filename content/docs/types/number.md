# Number type

Ensure the field's value is a valid `number` or a string representation of a number. The string values are converted to a number using the [`Number` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
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
vine.schema({
  age: vine.number().min(18)
})
```

### max

Enforce the value to be less than the pre-defined minimum value.

```ts
vine.schema({
  age: vine
    .number()
    .min(18)
    .max(60)
})
```

### range

Enforce the value to be under the range of minimum and maximum values.

```ts
vine.schema({
  age: vine
    .number()
    .range([18, 60])
})
```

### positive

Enforce the value to be a positive number.

```ts
vine.schema({
  marks: vine
    .number()
    .positive()
})
```

### negative

Enforce the value to be a negative number.

```ts
vine.schema({
  freezing_tempature: vine
    .number()
    .negative()
})
```

### decimal

Enforce the value to be a number with decimal values. You can define fixed decimal places or give a minimum and maximum range.

```ts
vine.schema({
  price: vine
    .number()
    .decimal([0, 2]) // 9.99 or 9
})
```
