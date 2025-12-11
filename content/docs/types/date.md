# Date type

Ensure the field's value is a string formatted as a date or datetime per the expected formats. The return value is an instance of the [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) class.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  published_at: vine.date()
})
```

By default, the input value should be formatted as a `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss` string. However, you may define custom formats as well. In the following example, we expect the input string to be valid per any of the mentioned formats.

:::note

You must check the Day.js documentation to [view the available formatting tokens](https://day.js.org/docs/en/parse/string-format#list-of-all-available-parsing-tokens).

:::

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  published_at: vine.date({
    formats: ['YYYY/DD/MM', 'x']
  })
})
```

To allow dates with [ISO-8601](https://en.wikipedia.org/wiki/ISO_8601) format, you may specify `iso8601` as a formats value.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  published_at: vine.date({
    formats: ['iso8601']
  })
})
```

You may mark the field as `optional` or `nullable` using the following modifiers.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  published_at: vine.date().nullable()
}
```

```ts
{
  published_at: vine.date().optional()
}
```


## Defining error message
You may define custom error messages for the following date-based rules.

```ts
const messages = {
  'date': 'The {{ field }} field must be a datetime value',
  
  'date.equals': 'The {{ field }} field must be a date equal to {{ expectedValue }}',
  'date.after': 'The {{ field }} field must be a date after {{ expectedValue }}',
  'date.before': 'The {{ field }} field must be a date before {{ expectedValue }}',
  'date.afterOrEqual': 'The {{ field }} field must be a date after or equal to {{ expectedValue }}',
  'date.beforeOrEqual': 'The {{ field }} field must be a date before or equal to {{ expectedValue }}',

  'date.sameAs': 'The {{ field }} field and {{ otherField }} field must be the same',
  'date.notSameAs': 'The {{ field }} field and {{ otherField }} field must be different',
  'date.afterField': 'The {{ field }} field must be a date after {{ otherField }}',
}

vine.messagesProvider = new SimpleMessagesProvider(messages)
```

## Transforming date objects globally

When working with date fields in your schemas, you often need to transform validated JavaScript `Date` objects into more useful formats. For example, if you use Luxon's `DateTime` throughout your application, you would need to manually transform every date field in every schema.

Without global transformations, you must repeat the same transformation logic across all your schemas:
```ts
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

const schema = vine.object({
  checkinDate: vine.date().transform((value) => DateTime.fromJSDate(value)),
  checkoutDate: vine.date().transform((value) => DateTime.fromJSDate(value)),
  bookingDate: vine.date().transform((value) => DateTime.fromJSDate(value))
})
```

VineJS allows you to define a global transformation for all date fields. You write the transformation logic once in a common file that loads before you perform any validations, and then all `vine.date()` fields automatically use that transformation.

```ts
import { DateTime } from 'luxon'
import { VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => {
  return DateTime.fromJSDate(value)
})
```

The `VineGlobalTransforms` interface declaration tells TypeScript that all date fields will now be `DateTime` instances instead of JavaScript `Date` objects. This ensures type safety throughout your application.

After setting up the global transformation, all schemas using `vine.date()` will automatically receive `DateTime` instances without any additional configuration:

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  checkinDate: vine.date(),
  checkoutDate: vine.date(),
  bookingDate: vine.date()
})

// All date fields are now DateTime instances automatically
```

## Comparing dates
You may use one of the following validation methods to compare the user input against a specific datetime value.

- `equals`: Ensure the input datetime value is the same as the expected datetime value.

- `after`: Ensure the input datetime value is after the expected datetime value.

- `afterOrEqual`: Same as the `after` method, but performs a greater than and equal to comparison.

- `before`: Ensure the input datetime value is before the expected datetime value.

- `beforeOrEqual`: Same as the `before` method, but performs a less than and equal to comparison.

```ts
// title: Example of equals
const schema = vine.object({
  enrollment_date: vine
    .date()
    .equals('2024-01-28')
})
```

```ts
// title: Example of after
const schema = vine.object({
  checkin_date: vine
    .date()
    .after('today')
})

const schema = vine.object({
  checkin_date: vine
    .date()
    .after('2024-01-01')
})
```

When using dynamic or computed values, you must use a callback function. Otherwise, the initial value will be cached forever with a [precompiled schema](../guides/getting_started.md#pre-compiling-schema).

```ts
// title: Lazily compute the expected value
const schema = vine.object({
  enrollment_date: vine
    .date()
    // highlight-start
    .afterOrEqual((field) => {
      return dayjs().add(2, 'day').format('YYYY-MM-DD')
    })
    // highlight-end
})
```

### How is the comparison performed?
Validation rules use the `compare` unit to compare the two dates. By default, the compare unit is set to `day`, which means the validation will compare the `day`, `month`, and the `year` values.

Similarly, if you set the compare unit to `minutes`, the validation will compare `minutes`, `hours`, `day`, `month` and the `year`.

:::tip

Under the hood, the comparison is performed using the [Days.js query methods](https://day.js.org/docs/en/query/is-before).

:::

```ts
vine
  .date()
  .equals('2024-01-28', {
    compare: 'month', // compares month and the year
  })
```

### Using a custom format
Validation rules assume the expected datetime format to be an ISO string. However, you may use the `format` option to specify a custom format.

```ts
vine
  .date()
  .equals('2024/28/01', {
    format: 'YYYY/DD/MM',
  })
```

## Comparing against other fields
Alongside performing [comparison against a fixed datetime value](#comparing-dates), you may also use the following validation methods to compare the input value against the value of another field.

- `sameAs`: Ensure the input datetime value is the same as the other field's value.

- `notSameAs`: Ensure the input datetime value is not the same as the other field's value.

- `afterField`: Ensure the input datetime value is after the other field's value.

- `afterOrSameAs`: Same as the `afterField` rule, but performs a greater than and equal to comparison.

- `beforeField`: Ensure the input datetime value is before the other field's value.

- `beforeOrSameAs`:  Same as the `beforeField` rule, but performs a less than and equal to comparison.

```ts
// title: Example of sameAs
const schema = vine.object({
  entry_date: vine.date(),
  exit_date: vine.date().sameAs('entry_date')
})
```

```ts
// title: Example of afterField
const schema = vine.object({
  checkin_date: vine.date(),
  checkout_date: vine.date().afterField('checkin_date')
})
```

You may specify the comparison unit and the format of the other field using the options object.

See also: [How is the comparison performed?](#how-is-the-comparison-performed)

```ts
const schema = vine.object({
  checkin_date: vine.date({
    formats: ['YYYY/MM/DD']
  }),
  checkout_date: vine.date().afterField('checkin_date', {
    compare: 'day',
    format: ['YYYY/MM/DD']
  })
})
```

## Other validation rules
Following is the list of other (non-comparison) validation rules.

### weekend
Ensure the date is a weekend.

```ts
const schema = vine.object({
  checkin_date: vine.date().weekend()
})
```

### weekday
Ensure the date is a weekday.

```ts
const schema = vine.object({
  event_date: vine.date().weekday()
})
```
