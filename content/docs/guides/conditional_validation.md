# Conditional validation

:::note

An alternative to `requiredIf` rules is the [**Vine.union**](../types/union.md) schema type that offers better type-safety at the cost of a verbose API.

:::

Sometimes, you may want to mark a field as required based on some runtime conditions. For example, you want to keep the `firstName` and `lastName` fields optional but mark them as required when any one of them is present.

In the following example, we use the `requiredIfExists` rule to mark the `firstName` field as required when the `lastName` field exists and vice-versa.

```ts
vine.object({
  firstName: vine.string().optional().requiredIfExists('lastName'),
  lastName: vine.string().optional().requiredIfExists('firstName'),
})
```

Alongside the `requiredIfExists` rule, you can use one of the following rules to mark an optional field required based upon certain runtime conditions. These methods only exist on the `optional` modifier.

## requiredWhen
The `requiredWhen` method is used to write comparison checks. The check could be an inline condition or a callback function (to express complex scenarios).

In the following example, we mark the `volleyballLevel` field as required when the selected `discipline` is `volleyball`.

```ts
vine.object({
  discipline: vine.enum(['volleyball', 'handball']),
  volleyballLevel: vine
    .enum(['senior', 'u21', 'u19', 'u17'])
    .optional()
    // highlight-start
    .requiredWhen('discipline', '=', 'volleyball')
    // highlight-end
})
```

The comparison operator can be one of the following.

- `in` accepts an array of values for comparison.
- `notIn` accepts an array of values for comparison.
- `=` accepts a literal value to perform an equality check.
- `!=` accepts a literal value to perform a non-equality check.
- `>` accepts a numeric value to compare two numbers.
- `<` accepts a numeric value to compare two numbers.
- `>=` accepts a numeric value to compare two numbers.
- `<=` accepts a numeric value to compare two numbers.

You may use a callback with the `requiredWhen` rule to express complex scenarios. Make sure to return `true` to mark the field as required and `false` to keep it optional.

```ts
vine.object({
  address: vine
    .string()
    // highlight-start
    .requiredWhen((field) => {
      if (field.parent.country !== 'USA') {
        return false
      }
      return 'state' in field.parent && 'city' in field.parent
    })
    // highlight-end
})
```

## requiredIfExists
The `requiredIfExists` method marks the field as required when the other field's value is not `undefined` or `null`.

```ts
vine.object({
  password: vine
    .string()
    .optional()
    // highlight-start
    .requiredIfExists('email')
    // highlight-end
})
```

You may also pass an array of field names to check if all the fields are defined before marking the current field as required.

```ts
vine.object({
  address: vine
    .string()
    .optional()
    // highlight-start
    .requiredIfExists(['state', 'city'])
    // highlight-end
})
```

## requiredIfExistsAny
The `requiredIfExistsAny` method marks the field as required when any of the expected fields are present with a value other than `undefined` or `null`.

```ts
vine.object({
  password: vine
    .string()
    .optional()
    // highlight-start
    .requiredIfExistsAny(['email', 'username'])
    // highlight-end
})
```

## requiredIfMissing
The `requiredIfMissing` method is the opposite of the `requiredIfExists` method. It marks the field as required when all the mentioned fields are missing.

```ts
vine.object({
  address: vine.string().optional(),
  pincode: vine
    .string()
    .optional()
    // highlight-start
    .requiredIfMissing('address')
    // highlight-end
})
```

## requiredIfMissingAny
The `requiredIfMissingAny` method marks the field as required when any of the expected fields are missing.

```ts
vine.object({
  username: vine.string().optional(),
  email: vine.string().optional(),
  legacyAccountId: vine
    .string()
    .optional()
    // highlight-start
    .requiredIfMissingAny(['email', 'username'])
    // highlight-end
})
```
