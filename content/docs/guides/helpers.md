---
summary: A complete reference to available VineJS helpers
---

# Helpers

Following is the list of helpers used internally by VineJS to perform type-checking or sometimes narrow down the types. You might want to use them inside your custom rules or union conditionals.

:::note

Helpers are created by keeping the [HTML forms serialization](./html_forms_and_surprises.md) behavior in mind.

:::

## isTrue

Returns `true` when the value is one of the following.

- `true`
- `1`
- `"1"`
- `"true"`
- `"on"`

```ts
vine.helpers.isTrue(true) // true
vine.helpers.isTrue(1) // true
vine.helpers.isTrue("1") // true
vine.helpers.isTrue("true") // true
vine.helpers.isTrue("on") // true
```

## isFalse

Returns `true` when the value is one of the following.

- `false`
- `0`
- `"0"`
- `"false"`

```ts
vine.helpers.isFalse(false) // true
vine.helpers.isFalse(0) // true
vine.helpers.isFalse("0") // true
vine.helpers.isFalse("false") // true
```

## isString

Check if the field value is a valid string. The method narrows down the type of value to `string`.

```ts
vine.helpers.isString(value) // value is 'string'
```

## isObject

Check if the field value is a plain JavaScript object. The method filters out `null` and `Arrays` and does not consider them as Objects.

```ts
vine.helpers.isObject(value) // value is Record<string, unknown>

vine.helpers.isObject<number>(value) // value is Record<string, number>
```

## isArray

Check if the field value is an Array.

```ts
vine.helpers.isArray(value) // value is unknown[]
vine.helpers.isArray<string>(value) // value is string[]
```

## isNumeric

Check if the value is a number or a string representation of a number.

```ts
vine.helpers.isNumeric(32) // true
vine.helpers.isNumeric('32') // true
vine.helpers.isNumeric('121.09') // true
vine.helpers.isNumeric('49.00') // true
```

## hasDecimals

Check if a number value has a fixed or a range of decimal places. The `hasDecimals` method accepts a `number` data type for the value input.

```ts
vine.helpers.hasDecimals(32.12, [0, 2]) // true
vine.helpers.hasDecimals(32, [0, 2]) // true
vine.helpers.hasDecimals(32, [2]) // false
vine.helpers.hasDecimals(32.101, [2]) // false
```

## asNumber

Casts the value to a number using the `Number` method. Returns `NaN` when unable to cast.

```ts
vine.helpers.asNumber('32') // 32
vine.helpers.asNumber('32.12') // 32.12
vine.helpers.asNumber('32.00') // 32
vine.helpers.asNumber('foo') // NaN
```

## asBoolean

Casts the value to a boolean. 

- `[true, 1, "1", "true", "on"]` will be converted to `true`.
- `[false, 0, "0", "false"]` will be converted to `false`.
- Everything else will return `null`. So make sure to handle that case.

```ts
vine.helpers.asBoolean('true') // true
vine.helpers.asBoolean('on') // true
vine.helpers.asBoolean('false') // false
vine.helpers.asBoolean('foo') // null

const output = vine.helpers.asBoolean(value)
if (output !== null) {
}
```

## Validator.js validators
Alongside the VineJS helpers, you may also use the `vine.helpers` object to access the following methods exported by the [validator.js](https://github.com/validatorjs/validator.js/) library.

- `isEmail`
- `isURL`
- `isAlpha`
- `isAlphaNumeric`
- `isIP`
- `isUUID`
- `isAscii`
- `isCreditCard`
- `isIBAN`
- `isJWT`
- `isLatLong`
- `isMobilePhone`
- `isPassportNumber`
- `isPostalCode`
- `isSlug`
- `isDecimal`
- `mobileLocales`
- `postalCodeLocales`
- `isHexColor`

```ts
vine.helpers.isEmail('foo@bar.com', {
  allow_ip_domain: false,
})

vine.helpers.isURL('https://foo.com', {
  require_protocol: true,
  allow_query_components: false,
})

vine.helpers.isPassportNumber('passport-number', {
  countryCode: 'IN'
})
```
