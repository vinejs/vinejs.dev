---
summary: The Object data type is used to validate an object and its properties
---

# Object type
Ensure the value of a field is a valid JavaScript object literal. You may define a collection of properties you want to validate within the object.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  username: vine.string(),
  password: vine.string(),
})
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  profile: vine.object({
    twitter_handle: vine.string(),
    github_username: vine.string(),
  })
  .nullable()
}
```

```ts
{
  profile: vine.object({
    twitter_handle: vine.string(),
    github_username: vine.string(),
  })
  .optional()
}
```

## Allowing unknown properties

The unknown properties in the `data` object are ignored during the validation, and the validated output only contains the known properties.

However, you may allow unknown properties using the `allowUnknownProperties` method. In this case, VineJS will validate the known properties and copy (using `deepClone`) the rest of the properties to the output.


:::codegroup

```ts
// title: Without unknown properties
import vine from '@vinejs/vine'

const schema = vine.object({
  username: vine.string(),
  password: vine.string(),
})

const data = {
  username: 'virk',
  password: 'secret',
  rememberMe: true,
  trackLogin: true,
}

const validate = vine.compile(schema)
const output = await validate({ data })
/**
{
  username: 'virk',
  password: 'secret'
}
*/
```


```ts
// title: Allow unknown properties
import vine from '@vinejs/vine'

const schema = vine.object({
  username: vine.string(),
  password: vine.string(),
})
// insert-start
.allowUnknownProperties()
// insert-end

const data = {
  username: 'virk',
  password: 'secret',
  rememberMe: true,
  trackLogin: true,
}

const validate = vine.compile(schema)
const output = await validate({ data })
/**
{
  username: 'virk',
  password: 'secret',
  // insert-start
  rememberMe: true,
  trackLogin: true,  
  // insert-end
}
*/
```

:::

You can use the `allowUnknownProperties` with nested objects as well.

```ts
const schema = vine.object({
  profile: vine
    .object({
      twitter_handle: vine.string(),
      github_username: vine.string(),
    })
    .allowUnknownProperties()
})
```

## Object groups

Object groups allow you to validate additional properties based on a condition. Each group can have multiple conditions, and each condition has an associated schema.

In the following example, we validate a form to issue a monument ticket to a visitor. The visitor may optionally hire a guide, and if they do, we must validate the **guide id**, **started at/ended at dates**, and the **paid amount**.

Before creating the validation schema, let's visualize the expected type we want for this schema.

```ts
/**
 * Just for visualization purposes. Not required by VineJS
 */
type VisitorDetails = {
  name: string
  group_size: number
  phone_number: string
} & ({
  is_hiring_guide: true,
  guide_id: string,
  amount: number,
  started_at: Date,
  ended_at: Date,
} | {
  is_hiring_guide: false,
})
```

Instead of marking additional fields like `guide_id` or `amount` optional, we create a union of types. **Unions provide great type safety when you perform type narrowing in TypeScript**. 

Let's reproduce the `VisitorDetails` type using the VineJS schema API.

```ts
import vine from '@vinejs/vine'

// highlight-start
const guideSchema = vine.group([
  vine.group.if(
    (data) => vine.helpers.isTrue(data.is_hiring_guide),
    {
      is_hiring_guide: vine.literal(true),
      guide_id: vine.string(),
      amount: vine.number(),
      started_at: vine.date(),
      ended_at: vine.date(),
    }
  ),
  vine.group.else({
    is_hiring_guide: vine.literal(false),
  }),
])
// highlight-end

const schema = vine.object({
  name: vine.string(),
  group_size: vine.number(),
  phone_number: vine.string()
})
// highlight-start
.merge(guideSchema)
// highlight-end
```

The `vine.group` method accepts an array of conditions and the schema to use if the condition is `true` at runtime. In our example, we have the following two conditions.

- We will use the first schema if the `data` has `is_hiring_guide = true`.
- Otherwise, we will use the second schema inside the group array.

Finally, we merge the group with the object using the `object.merge` method. You may call the `merge` method multiple times, and each call will result in an [intersection type of unions](https://ultimatecourses.com/blog/use-intersection-types-to-combine-types-in-typescript).

### group.if
The `vine.group.if` method accepts a callback as the first argument and the schema to use as the second argument. The schema will be used for the validation if the callback returns `true`. Otherwise, the group will move to the next condition.

```ts
vine.group.if((data, ctx) => {
  return true
}, {
})
```

### group.else
The `vine.group.else` method defines a fallback schema when none of the `if` conditions match. The `else` condition must last in the `vine.group` array.

```ts
vine.group.else({
  // fallback schema
})
```

### group.otherwise
If you do not have a fallback schema, you must define an `otherwise` callback to report an error when none of the conditions are matched. For example:

```ts
vine.group([
  vine.group.if((data) => 'username' in data, {
    username: vine.string()
  }),
  vine.group.if((data) => 'email' in data, {
    email: vine.string().email()
  })
])
// highlight-start
.otherwise((ctx) => {
  ctx.report(
    'You must provide username or email to login',
    'email_or_username',
    ctx
  )
})
// highlight-end
```

<!--
:::note

It's okay if creating groups and merging them into the object initially feels complicated. You can learn more about them by [browsing examples]() (each example has an accompanying screencast with it).

:::

!-->


## Adding properties to the object
You may add new properties to the object using the [JavaScript spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

```ts
const author = vine.object({
  name: vine.string(),
  email: vine.string().email()
})

const commentSchema = vine
  .object({
    ...author.getProperties(),
    body: vine.string(),
  })

/**
 {
   name: string,
   email: string,
   body: string,
 }
 */
```

## Defining error message

You may define the custom error message using the `object` rule name.

```ts
const messages = {
  object: 'The {{ field }} field must be an object'
}
```
