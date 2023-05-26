# Type-checking helpers

Since VineJS is a form data validation library, it has to handle [HTML forms serialization quirks](./html_forms_and_surprises.md) gracefully. To handle these quirks, we have created helpers you can access using the `vine.helpers` property and use them inside union conditionals or custom validation rules.

Following is the list of available helpers.

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