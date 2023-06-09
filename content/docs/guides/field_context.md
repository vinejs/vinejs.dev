---
summary: Complete reference to the Field context
---

# Field context

Field context refers to the `ctx` object you may access inside the validation functions, union conditionals, the `parse` method, or the `transform` method.

The `ctx` object provides information about the current field under validation and access to the global data object and parent objects/arrays (if any).

Following is the list of available properties.

```ts
type FieldContext = {
  value: unknown
  data: Record<string, any>
  meta: Record<string, any>
  wildCardPath: string
  isValid: boolean
  isDefined: boolean
  mutate(newValue: any, ctx: FieldContext): void
  report(
    message: string,
    rule: string,
    ctx: FieldContext,
    args?: Record<string, any>
  ): void
  parent: any
  fieldName: string | number
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

The nested path to the field is under validation. The value is represented using dot notation. For example: `profile.social.twitter`. In the case of an array, the `*` symbol is used for children elements.

## mutate

A function to `mutate` the value of the field. This function must be used by validation rules, not union conditionals or the `transform` method.

```ts
vine.createRule((value, options, ctx) => {
  /**
   * Mutate output value. Next validation rule will receive
   * the updated value
   */
  ctx.mutate(value.toUpperCase(), ctx)
})
```

## report

A method to report error messages for a specific field. The method accepts the following arguments.

- The default message to display when a custom error message is not defined.
- The name of the validation rule for which the validation failed.
- Reference to the current `ctx` object.
- Optional metadata to share with the [error reporter](./error_reporter.md). 

```ts
vine.createRule((value, options, ctx) => {
  ctx.report('error message', 'error_id', ctx, {
    key: 'value'
  })
})
```

## isValid

A boolean to know if the field is valid. It will be considered invalid if the field has failed one or more validations.

## isDefined

A boolean to know if the field is defined. Fields with `null` or `undefined` values are considered undefined.

## parent

Reference to the parent object or array (if the field is nested). Otherwise, the `parent` property refers to the `data` object.

## fieldName

The name of the field under validation. In the case of an array element, it will be the array index.

## isArrayMember

A boolean to know if the field is an array element. When set to `true`, the value of `fieldName` will be the array index, and the `parent` property will be an array (otherwise object).

```ts
vine.createRule((value, options, ctx) => {
  if (ctx.isArrayMember) {
    console.log(ctx.parent[ctx.fieldName])
  }
})
```
