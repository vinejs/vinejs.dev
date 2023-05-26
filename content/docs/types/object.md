# Object type

Ensure the value of a field is a valid JavaScript object literal. You may define a collection of properties you want to validate within the object.


:::note

The `vine.schema` is a superset of the `vine.object`  schema type. It defines a top-level object and exposes additional methods like [`toCamelCase`](../guides/schema_101.md#converting-the-output-to-camelcase).


:::

```ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  username: vine.string(),
  password: vine.string(),
})
```

## Nested objects

The nested objects are defined using the `vine.object` method. Like `vine.schema`, you may pass a collection of properties you want to validate within the object.

```ts
const schema = vine.schema({
  profile: vine.object({
    twitter_handle: vine.string(),
    github_username: vine.string(),
  })
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

const schema = vine.schema({
  username: vine.string(),
  password: vine.string(),
})

const data = {
  username: 'virk',
  password: 'secret',
  rememberMe: true,
  trackLogin: true,
}

const output = await vine.validate({ schema, data })
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

const schema = vine.schema({
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

const output = await vine.validate({ schema, data })
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
const schema = vine.schema({
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

In the following example, we validate a form to issue a monument ticket to a visitor. The visitor may optionally hire a guide, and if they do, we must validate the **guide id**, **hiring duration**, and the **paid amount**.

Before creating the validation schema, let's visualize the expected type we want for this schema.

```ts
/**
 * Just for visualization purposes. Not required by VineJS
 */
type VisitorDetails = {
  name: string
  groupSize: number
  phoneNumber: string
} & ({
  isHiringGuide: true,
  guideId: string,
  amount: number,
  startedAt: Date,
  endedAt: Date,
} | {
  isHiringGuide: false,
})
```

Instead of marking additional fields like `guideId` or `amount` optional, we create a union of types. **Unions provide great type safety when you perform type narrowing in TypeScript**. 

Alright, let's reproduce the `VisitorDetails` type using the VineJS schema API.

```ts
import vine from '@vinejs/vine'

const guideSchema = vine.group([
  vine.group.if(
    (data) => vine.helpers.isTrue(data.isHiringGuide),
    {
      isHiringGuide: vine.literal(true),
      guideId: vine.string(),
      amount: vine.number(),
      startedAt: vine.date(),
      endedAt: vine.date(),
    }
  ),
  vine.group.else({
    isHiringGuide: vine.literal(false),
  }),
])

const schema = vine.schema({
  name: vine.string(),
  groupSize: vine.number(),
  phoneNumber: vine.string()
})
.merge(guideSchema)
```

In the above example, we re-create the `VisitorDetails` type with a union of objects.

The `vine.group` method accepts an array of conditions and the schema to use if the condition is `true` at runtime. In our example, we have the following two conditions.

- We will use the first schema if the `data` has `isHiringGuide = true`.
- Otherwise, we will use the second schema inside the group array.

Finally, we merge the group with the object using the `object.merge` method. You may call the `merge` method multiple times, and each call will result in an [intersection type of unions](https://ultimatecourses.com/blog/use-intersection-types-to-combine-types-in-typescript).


:::note

It's okay if creating groups and merging them into the object initially feels complicated. You can learn more about them by [browsing examples]() (each example has an accompanying screencast with it).

:::


## Merging static properties

The `merge` method accepts only unions, and if you want to merge static properties inside an object, you may use the JavaScript spread syntax. For example:

```ts
const author = {
  name: vine.string(),
  email: vine.string().email()
}

const commentSchema = vine.object({
  body: vine.string(),
  ...author,
})

/**
 {
   body: string,
   name: string,
   email: string,
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
