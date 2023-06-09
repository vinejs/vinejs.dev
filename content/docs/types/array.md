---
summary: The Array data type is used to validate an array and its elements
---

# Array type

Ensure the value of a field is a valid JavaScript array. You must define the type of properties the array should contain. 

In the following example, we expect the value of `categories` to be an array of numbers.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  categories: vine.array(vine.number())
})
```

Using the following modifiers, you may mark the array as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  categories: vine
    .array(vine.number())
    .nullable()
}
```

```ts
{
  categories: vine
    .array(vine.number())
    .optional()
}
```

## Creating an array of objects

Since the `vine.array` method accepts any valid VineJS type, you may create an array of objects, as shown in the following example.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  contacts: vine.array(
    vine.object({
      id: vine.number(),
      is_primary: vine.boolean(),
    })
  ),
})
```

## Creating an array of unions

An array can also accept a union type. In the following example, each contact can be an email or phone contact.

See also: [Union type](./union.md)

```ts
/**
 * Re-usable helper to check if the field value
 * is an object and has a matching type
 */
function hasType(value: unknown, type: string) {
  return vine.helpers.isObject(value) && value.type === type
}

/**
 * Schema type for email contact
 */
const emailContact = vine.object({
  type: vine.literal('email'),
  email: vine.string().email()
})

/**
 * Schema type for phone contact
 */
const phoneContact = vine.object({
  type: vine.literal('phone'),
  phone: vine.string().mobile()
})

/**
 * Define a contact union with conditionals and
 * their associated schema
 */ 
const contact = vine.union([
  vine.union.if((value) => hasType(value, 'email'), emailContact),
  vine.union.if((value) => hasType(value, 'phone'), phoneContact)
])

const schema = vine.object({
  contacts: vine.array(contact)
})
```

In the above example, we have a union with two conditionals. 

- The first one checks for `type === 'email`.
- And the second one checks for `type === 'phone'`. 

However, the validation will pass if the `type` property is missing or has a different value. Therefore, specifying an `otherwise` clause and reporting an error is recommended. For example:

```ts
const contact = vine.union([
  vine.union.if((value) => hasType(value, 'email'), emailContact),
  vine.union.if((value) => hasType(value, 'phone'), phoneContact)
])
// highlight-start
.otherwise((_, ctx) => {
  ctx.report(
    'Invalid contact. Either provide an email or a phone number',
    'unknown_contact_type',
    ctx
  )
})
// highlight-end
```

The `ctx.report` method marks the field under validation as invalid and reports an error to the error reporter. It accepts the following arguments.

- The default error message.
- The error code. The code may be used to define custom error messages.
- And the field context.

## Defining error messages

You may define custom error messages for the following array-based rules.

```ts
const messages = {
  'array': 'The {{ field }} field must be an array',
  'array.minLength': 'The {{ field }} field must have at least {{ min }} items',
  'array.maxLength': 'The {{ field }} field must not have more than {{ max }} items',
  'array.fixedLength': 'The {{ field }} field must contain {{ size }} items',
  'notEmpty': 'The {{ field }} field must not be empty',
  'distinct': 'The {{ field }} field has duplicate values',
}
```

## Validations

Following is the list of validation rules you can apply on an array.

### minLength

Enforce the array to have the expected minimum length.

```ts
const schema = vine.object({
  categories: vine.array(
    vine.number()
  ).minLength(1)
})
```

### maxLength

Enforce the array to have the expected maximum length.

```ts
const schema = vine.object({
  categories: vine.array(
    vine.number()
  ).maxLength(10)
})
```

### fixedLength

Enforce the array to have a fixed length.

```ts
const schema = vine.object({
  categories: vine.array(
    vine.number()
  ).fixedLength(4)
})
```

### notEmpty

Ensure the array has one or more values.

```ts
const schema = vine.object({
  categories: vine.array(
    vine.number()
  ).notEmpty()
})
```

### distinct

Validate array children to have distinct/unique values. In the case of an array of objects, you may define the object property names to check for uniqueness.

In the following example, we expect the `categories` array to have unique category ids.

```ts
const schema = vine.object({
  categories: vine
    .array(
      vine.number()
    )
    // highlight-start
    .distinct()
    // highlight-end
})
```

In the following example, we expect users inside the array to have unique emails.

```ts
const schema = vine.object({
  users: vine
    .array(
      vine.object({
        email: vine.string(),
        password: vine.string()
      })
    )
    // highlight-start
    .distinct('email')
    // highlight-end
})
```

Finally, you may define composite keys to check for unique elements.

```ts
const schema = vine.object({
  users: vine
    .array(
      vine.object({
        email: vine.string(),
        company_id: vine.number(),
        password: vine.string()
      })
    )
    // highlight-start
    .distinct(['email', 'company_id'])
    // highlight-end
}
```

#### Treatment of `null` and `undefined` items

Array items with `null` and `undefined` values will be skipped during the uniqueness check. So, for example, the following array will pass the `distinct` validation.

```ts
/**
 * Null values will be ignored
 */
const categories = [1, 8, null, 12, null, 2]
```

#### Treatment of objects with missing keys
Similarly, in the case of an array of objects, the object item will be skipped if it does contain all the fields required for the uniqueness check. For example, the following array will pass the `distinct` validation.

```ts
const fields = ['email', 'company_id']
const users = [
  /**
   * Skipped because the object is missing the company_id
   */
  {
    email: 'foo@bar.com',
  },
  /**
   * Skipped because the object is missing the company_id
   */
  {
    email: 'foo@bar.com',
  },
]
```

## Mutations
 
Following is the list of mutations you can perform on an array. As the name suggests, mutations normalize or change the input value and do not perform any validations.

### compact

Remove `empty strings`, `null`, and `undefined` values from the array. Applying the `compact` mutation before the validation rules is recommended.

```ts
const schema = vine.object({
  categories: vine
    .array(
      vine.number()
    )
    .compact()
})
```
