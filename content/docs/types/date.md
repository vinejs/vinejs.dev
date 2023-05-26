# Date type

The date schema type validates the field's value to be a string formatted as a date. The output get's converted to an instance of [Luxon DateTime](https://moment.github.io/luxon/api-docs/index.html#datetime) class.

To use the `vine.date` method, you must install [luxon](https://moment.github.io/luxon/#/install) as your project dependency.

```sh
npm i luxon
```

Once installed, you may use the date schema type as follows.

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  dob: vine.date(),
})

const data = {
  dob: '1990-05-23'
}

const output = await vine.validate({ schema, data })

output.dob // DateTime
```

## Defining format and zone

The date values are validated against the `ISO` format by default. However, using the `format` option, you may define a custom format.

```ts
vine.date({ format: 'iso' })
vine.date({ format: 'sql' })
vine.date({ format: 'yyyy-MM-dd HH:mm:ss' })
```

You may use the following shorthand keywords or use any available [Luxon DateTime tokens](https://moment.github.io/luxon/#/parsing?id=table-of-tokens) to define the format.

- `iso`
- `sql`
- `rfc2822`
- `http`

Post validation, the DateTime instance is created in the local timezone of your server. However, you may [define an explicit zone](https://moment.github.io/luxon/#/zones?id=creating-datetimes-in-a-zone) using the `zone` property.

```ts
vine.date({
  zone: 'utc'
})
```

## Validations

Following is the list of validation rules you may apply on a date.

### equals
Ensure the value of date is same as the pre-defined value. The expected value must be an instance of the Luxon DateTime class.

```ts
const schema = vine.schema({
  enrollment_date: vine
    .date()
    .equals(DateTime.fromISO('2023-05-25'))
})
```

### notEquals
Ensure the value of date is not same as the pre-defined value. The expected value must be an instance of the Luxon DateTime class.

```ts
const schema = vine.schema({
  enrollment_date: vine
    .date()
    .notEquals(DateTime.fromISO('2023-05-25'))
})
```

### sameAs

### notSameAs

### after / afterOrEqual

Ensure the date is after a given interval. The `after` and `afterOrEqual` methods accepts the interval as the `first` argument and the unit as the `second` argument.

```ts
const schema = vine.schema({
  checkin_date: vine
    .date()
    .after(2, 'days')
})
```

Following is the list of available units.

```ts
vine.date().after(2, 'days')
vine.date().after(1, 'month')
vine.date().after(3, 'years')
vine.date().after(30, 'minutes')
vine.date().after(2, 'quarters')
```

For advanced use cases, you may pass an instance of the Luxon DateTime directly.

```ts
vine
  .date()
  .after(DateTime.utc(), 'days')
```

### afterField / afterOrSameAsField

The `afterField` and `afterOrSameAsField` methods enforce the date to be after the date value of the other field.

The `afterField` validation is skipped when the other field's value is not a valid date.

```ts
const schema = vine.schema({
  checkin_date: vine.date().inFuture({ unit: 'days' }),
  checkout_date: vine
    .date()
    .afterField('checkin_date'),
})
```

By default, the diff between two dates is calculated in minutes. However, you may define a custom diff unit via the options object.

```ts
const schema = vine.schema({
  checkin_date: vine.date().inFuture({ unit: 'days' }),
  checkout_date: vine
    .date()
    .afterField('checkin_date', { unit: 'days' }),
})
```


### before / beforeOrEqual

Ensure the date is before a given interval. The `before` and `beforeOrEqual` methods accept the interval as the `first` argument and the unit as the `second` argument.

```ts
const schema = vine.schema({
  dob: vine
    .date()
    .before(10, 'years')
})
```

Following is the list of available units.

```ts
vine.date().before(2, 'days')
vine.date().before(1, 'month')
vine.date().before(3, 'years')
vine.date().before(30, 'minutes')
vine.date().before(2, 'quarters')
```

For advanced use cases, you may pass an instance of the Luxon DateTime directly.

```ts
vine
  .date()
  .before(DateTime.utc().minus({ days: 1 }))
```

### beforeField / beforeOrSameAsField

The `beforeField` and `beforeOrSameAsField` methods enforce the date to be before the date value of the other field.

The `beforeField` validation is skipped when the other field's value is not a valid date.

```ts
const schema = vine.schema({
  checkin_date: vine.date(),
  documents_approved_at: vine
    .date()
    .beforeField('checkin_date')
})
```

By default, the diff between two dates is calculated in minutes. However, you may define a custom diff unit via the options object.

```ts
const schema = vine.schema({
  checkin_date: vine.date(),
  documents_approved_at: vine
    .date()
    .beforeField('checkin_date', { unit: 'days' })
})
```

### inFuture

### inPast

### weekday

### weekend
