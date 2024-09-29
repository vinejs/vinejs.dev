---
summary: Learn everything you need to know about schema composition
---

# Schema 101

The validation schema defines the shape and the format of the data you expect during the validation. We have divided the validation schema into three parts, i.e.

- **The shape of the top-level object** is defined using the `vine.object` method.
- **The data type for fields** is defined using the schema methods like `vine.string`, `vine.boolean`, and so on.
- **Additional validations and mutations** are applied using the rules available on a given schema type.

![](./vine_schema.jpeg)

## Creating schemas

The validation schema is created using the `vine.object` method. The method accepts a key-value pair, where the key is the field name, and the value is another schema type.


```ts
const schema = vine.object({
  username: vine.string()
})
```

## Re-using and composing schemas
The API for re-using schema types to compose new schemas is **intentionally underpowered in VineJS**. 

We believe, [writing some duplicate code](https://overreacted.io/the-wet-codebase/) to produce simple code can be beneficial over using complex APIs to split, extend, pick, and omit properties that are harder to reason about. You might hold different views, but this is how we want to build and maintain VineJS.

### Cloning schema types
VineJS schema APIs mutate the same underlying schema instance. Therefore, you may call the `clone` method to create a fresh instance of the same type and configure it separately. For example:

```ts
const userSchema = vine.object({
  username: vine.string()
})

const postSchema = vine.object({
  title: vine.string(),
  // highlight-start
  author: userSchema.clone().nullable()
  // highlight-end
})
```

### Using existing object properties
You can create a new object and copy properties from an existing object using the `object.getProperties` method. The `getProperties` method clones existing properties and returns them as a new object.

```ts
const userSchema = vine.object({
  username: vine.string()
})

const postSchema = vine.object({
  title: vine.string(),
  // highlight-start
  author: vine.object({
    ...userSchema.getProperties(),
    id: vine.number(),
  })
  // highlight-end
})
```

## Nullable and optional modifiers

See also: [HTML forms and surprises](./html_forms_and_surprises.md)

Throughout the documentation, you will find examples using the `nullable` or `optional` modifiers. These modifiers are used to mark fields as optional or null.

### Optional modifier

All the fields are required by default, and you may mark them as optional using the optional modifier. 

- An optional field may contain an `undefined` or `null` value.
- The field is removed from the output when it is `undefined` or `null`.

```ts
{
  name: vine.string().optional()
}

// input=foo; output=foo
// input=null; output=undefined
// input=undefined; output=undefined
```

### Nullable modifier
The nullable modifier expects the field under validation to exist, but its value can be `null`. Also, the field is always present in the output.

```ts
{
  name: vine.string().nullable()
}

// input=foo; output=foo
// input=null; output=null
// input=undefined; throws exception
```

### Using both the modifiers together

You end up with the following behavior when you use the `optional` and the `nullable` modifiers together.

- Both `null` and `undefined` values will be allowed.
- If the value is `null`, it will be written to the output.
- If the value is `undefined`, it will be removed from the output.

```ts
{
  name: vine.string().nullable().optional()
}

// input=foo; output=foo
// input=null; output=null
// input=undefined; output=undefined
```

## Schema types

Following is the list of available schema types supported by VineJS. We also support extending the schema API by [creating custom types](../extend/custom_schema_types.md).

- [String](../types/string.md)
- [Boolean](../types/boolean.md)
- [Number](../types/number.md)
- [Union](../types/union.md) (for expressing conditonals)
- [Array](../types/array.md)
- [Tuple](../types/tuple.md)
- [Object](../types/object.md)
- [Record](../types/record.md)
- [Enum](../types/enum.md)
- [Accepted](../types/accepted.md)
- [Any](../types/any.md)
- [Literal](../types/literal.md)
- [Date](../types/date.md)

## Validation metadata

Since VineJS schemas are pre-compiled, you cannot pass runtime options to them. For example, you want the user to enter a credit card number from a specific provider based upon the user's country saved in their profile.

```ts
const purchaseValidator = vine.compile(
  vine.object({
    credit_card: vine
      .string()
      .creditCard({
        // highlight-start
        provider: [] // SHOULD BE BASED ON USER PROFILE
        // highlight-end
      })
  })
)
```

Assuming you use the `purchaseValidator` validator during an HTTP request, you want to fetch the currently logged-in user profile and get the list of credit card providers. In short, you want to define `provider` at the time of validating and not at the time of defining the schema.

This is where the validation metadata can help you. You can pass the `provider` array as follows.

```ts
const user = req.auth.user
// Assuming the user model has the "getProviders" method
const ccProviders = user.getProviders()

await purchaseValidator.validate(req.body, {
  // highlight-start
  meta: {
    ccProviders
  }
  // highlight-end
})
```

Now, let's go to the schema and access the `meta.ccProviders` value inside the schema. First, we must pass a callback to the `creditCard` validation rule and lazily compute the validation options.

```ts
const purchaseValidator = vine.compile(
  vine.object({
    credit_card: vine
      .string()
      // delete-start
      .creditCard({
        provider: []
      })
      // delete-end
      // insert-start
      .creditCard((field) => {
        return {
          provider: field.meta.ccProviders
        }
      })
      // insert-end
  })
)
```

### Defining metadata static types
In our previous example, we cannot know that the `purchaseValidator` needs the `meta.ccProviders` array to be functional. However, we can fix that by defining the static types using the `vine.withMetaData` method.

Once you define the static types for the metadata, the TypeScript compiler will force you to provide the same metadata when using the validator.

```ts
// insert-start
import { CreditCardOptions } from '@vinejs/vine/types'

type PurchaseValidatorMetaData = {
  ccProviders: CreditCardOptions['provider']
}
// insert-end

const purchaseValidator = vine
  // insert-start
  .withMetaData<PurchaseValidatorMetaData>()
  // insert-end
  .compile(
    vine.object({
      credit_card: vine
        .string()
        .creditCard((field) => {
          return {
            provider: field.meta.ccProviders
          }
        })
    })
  )
```

```ts
// ❌ ERROR: Expected 2 arguments, but got 1.ts(2554)
await purchaseValidator.validate(req.body)

// ❌ ERROR: Property 'meta' is missing in type '{}' but required in type '{ meta: PurchaseValidatorMetaData; }'
await purchaseValidator.validate(req.body, {})

// ✅
await purchaseValidator.validate(req.body, {
  meta: {
    ccProviders: ['mastercard' as const]
  }
})
```

## Using functions as validation rules

You are not only limited to validation rules available via the schema API. You can also convert plain JavaScript functions to validation rules and use them with any schema type.

In the following example, we create a validation rule using the `vine.createRule` method and apply it to fields using the `schema.use` method.

See also: [Creating custom rules](../extend/custom_rules.md)

```ts
import vine from '@vinejs/vine'

const myRule = vine.createRule(async (value, options, field) => {
  // Implementation goes here
})

const schema = vine.object({
  username: vine.string().use(
    myRule()
  ),
  email: vine.string().email().use(
    myRule()
  )
})
```

## Bail mode

VineJS stops the validation chain when any validation fails for a given field. We call this behavior the `bail` mode. In other libraries, this feature is usually called **abort early**.

In the following example, if the field's value is not a `string`, VineJS will not perform the `email` and the `unique` validations. This is the behavior you would want most of the time.

```ts
const schema = vine.object({
  email: vine.string().email().use(
    unique({ table: 'users', column: 'email' })
  )
})
```

However, you may turn off the `bail` mode for a given field using the `bail` method (if needed).

```ts
const schema = vine.object({
  email: vine.string().email().use(
    unique({ table: 'users', column: 'email' })
  )
  // highlight-start
  .bail(false)
  // highlight-end
})
```

## Parsing input value

You may use the `parse` method on all the schema types to mutate the input value before the validation cycle begins. Since the `parse` method is called before the validation cycle, the field's value is unknown, and you must handle all the edge cases to avoid runtime exceptions.

The `parse` method receives the `value` as the first argument and the [field context](./field_context.md) as the second argument.

```ts
function assignDefaultRole(value: unknown) {
  if (!value) {
    return 'guest'
  }
  
  return value
}

const schema = vine.object({
  role: vine.string().parse(assignDefaultRole)
})
```

## Transforming output value

You may use the `transform` method on available schema types to mutate the output value. The `transform` method is not called in the following cases.

- When the field is invalid (it has failed one or more validations).
- When the field value is `undefined`.
- The `transform` method is not available for `array`, `object,` `record`, and `tuple` schema types. This is an intentional limitation, and we may re-consider it if there are enough valid use cases.

The `transform` method receives the `value` as the first argument and the [field context](./field_context.md) as the second argument. You may return a completely different data type from the `transform` method.

You can also use async functions in the `transform` method.
Just remember to pass the `shouldAwaitTransformers` option when calling the `validate` method if you want the awaited value.

:::codegroup
```ts
// title: Synchronous transform
const schema = vine.object({
  amount: vine.number().decimal([2, 4]).transform((value) => {
    return new Amount(value)
  })
})
```

```ts
// title: Asynchronous transform
const schema = vine.object({
  amount: vine.number().decimal([2, 4]).transform(async (value) => {
    return await new Amount(value)
  })
})

// When calling the validate method 
// pass the shouldAwaitTransformers option to get the awaited value
await vine.validate({ schema, data, shouldAwaitTransformers: true })

```


:::

## Converting the output to camelCase

VineJS transforms all field names from `snake_case` or `dash-case` to `camelCase` using the `object.toCamelCase` modifier. 

:::note

Considering the complexity of generating accurate static types, we will not add support for other modifiers.

:::

:::codegroup

```ts
// title: Without camelCase helper
const schema = vine.object({
  first_name: vine.string(),
  last_name: vine.string(),
  referral_code: vine.string().optional()
})

const validate = vine.compile(schema)

const {
 first_name,
 last_name,
 referral_code
} = await validate({ data })
```

```ts
// title: With camelCase helper
const schema = vine.object({
  first_name: vine.string(),
  last_name: vine.string(),
  referral_code: vine.string().optional()
})
// insert-start
.toCamelCase()
// insert-end

const validate = vine.compile(schema)

const {
 // delete-start
 first_name,
 last_name,
 referral_code
 // delete-end
 // insert-start
 firstName,
 lastName,
 referralCode
 // insert-end
} = await validate({ data })
```

:::
