---
summary: Complete reference to the Field context
---

# Field context

Field context refers to the `field` object you may access inside the validation functions, union conditionals, the `parse` method, or the `transform` method.

The `field` object provides information about the current field under validation and access to the global data object and parent objects/arrays (if any).

Following is the list of available properties.

```ts
type FieldContext = {
  value: unknown
  data: any
  meta: Record<string, any>
  wildCardPath: string
  isValidDataType: boolean
  isValid: boolean
  isDefined: boolean
  getFieldPath(): string
  mutate(newValue: any, field: FieldContext): void
  report(
    message: string,
    rule: string,
    field: FieldContext,
    args?: Record<string, any>
  ): void
  parent: any
  name: string | number
  isArrayMember: boolean
}
```

## value

The value of the field under validation.

## data

The root data object under validation. This is a shared property across all the fields, so do not mutate the object.

## meta

The `meta` object is a shared property across all the fields. You may use this property to pass metadata across fields or rules.

## wildCardPath

The nested path to the field under validation. The value is represented using dot notation. For example: `profile.social.twitter`. In the case of an array, the `*` symbol is used for children elements.

## getFieldPath()
Returns the nested path to a field. This method is different from the `wildCardPath` property since, in the case of arrays, the `getFieldPath` method will return a complete path with the runtime value of the current index. For example:

```ts
// Given the following schema
const schema = vine.object({
  contacts: vine.array(
    vine.object({
      email: vine.string()
    })
  )
})

/**
 * The return value of "getFieldPath" will be
 * - "contacts.0.email"
 * - "contacts.1.email"
 * - and so on
 */

/**
 * The value of "wildCardPath" will be
 * - "contacts.*.email"
 */
```

## mutate()

A function to `mutate` the value of the field. This function must be used by validation rules, not union conditionals or the `transform` method.

```ts
vine.createRule((value, options, field) => {
  /**
   * Mutate output value. The next validation rule will receive
   * the updated value
   */
  field.mutate(value.toUpperCase(), field)
})
```

## report

A method to report error messages for a specific field. The method accepts the following arguments.

- The default message to display when a custom error message is not defined.
- The name of the validation rule for which the validation failed.
- Reference to the current `field` object.
- Optional metadata to share with the [error reporter](./error_reporter.md). 

```ts
vine.createRule((value, options, field) => {
  field.report('error message', 'error_id', field, {
    key: 'value'
  })
})
```

## isValid

A boolean to determine if the field is valid. It will be considered invalid if it has failed one or more validations.

## isValidDataType
A boolean that indicates whether the field's data type is valid.

For example:
- If a `string()` rule passes, `isValidDataType = true`
- If an `email()` rule fails, `isValid = false` but `isValidDataType = true`

## isDefined

A boolean to know if the field is defined. Fields with `null` or `undefined` values are considered undefined.

## parent

Reference to the parent object or array (if the field is nested). Otherwise, the `parent` property refers to the `data` object.

## name

The name of the field under validation. In the case of an array element, it will be the array index.

## isArrayMember

A boolean to know if the field is an array element. When set to `true`, the value of `name` will be the array index, and the `parent` property will be an array (otherwise object).

```ts
vine.createRule((value, options, field) => {
  if (field.isArrayMember) {
    console.log(field.parent[field.name])
  }
})
```
