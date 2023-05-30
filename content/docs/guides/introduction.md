---
summary: VineJS is a form data validation library for Node.js. You may use it to validate the HTTP request body in your backend applications
---

# Introduction

VineJS is a form data validation library for Node.js. You may use it to validate the HTTP request body in your backend applications.

- VineJS is one of the fastest validation libraries in the Node.js ecosystem. [See benchmarks](#benchmarks).

- It provides both runtime and static type safety.

- Built for validating form data and JSON payloads. [Learn more](#built-for-validating-form-data-and-json-payloads).

- Has first-class support for defining custom error messages and formatting errors.

- Comes with an extensive suite of **52+ validation rules** and **13 schema types**.

- Extensible. You can add custom rules and schema types to VineJS.

---

:::codegroup

```ts
// title: Basic example
import vine from '@vinejs/vine'

const schema = vine.schema({
  email: vine.string().email(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .confirmed()
})

const data = getDataToValidate()
await vine.validate({ schema, data })
```

```ts
// title: Arrays and Objects
import vine from '@vinejs/vine'

const schema = vine.schema({
  sku: vine.string(),
  price: vine.number().positive(),
  // highlight-start
  variants: vine.array(
    vine.object({
      name: vine.string(),
      type: vine.enum(['size', 'color']),
      value: vine.string(),
    })
  )
  // highlight-end
})

const data = getDataToValidate()
await vine.validate({ schema, data })
```

```ts
// title: Unions
import vine from '@vinejs/vine'

const schema = vine
  .schema({
    // highlight-start
    health_check: vine.unionOfTypes([
      vine.literal(false),
      vine.string().url().activeUrl()
    ])
    // highlight-end
  })

const data = getDataToValidate()
await vine.validate({ schema, data })
```

```ts
// title: Conditional groups
import vine from '@vinejs/vine'

// highlight-start
/**
 * Conditional schema when hiring or not hiring
 * a guide
 */
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

const schema = vine
  .schema({
    visitor_name: vine.string(),
  })
  // highlight-start
  .merge(guideSchema)
  // highlight-end

const data = getDataToValidate()
await vine.validate({ schema, data })
```

:::

## Benchmarks

VineJS is one of the fastest validation libraries in the Node.js ecosystem. Following are the benchmarks  comparing VineJS with other popular alternatives.

*The code for the benchmarks is on Github. Feel free to clone the repo and run them locally.*

## Built for validating form data and JSON payloads

Serializing an HTML form to FormData or a ‌JSON object comes with [its own set of quirks](./html_forms_and_surprises.md). For example:

- Numbers and booleans are serialized as strings
- Checkboxes are not booleans
- And empty fields are represented as empty strings

VineJS handles all these quirks natively, and you never have to perform manual normalization in your codebase.

## What's next?

- Read the [installation and basic usage](./getting_started.md) guide.
- Watch [screencasts]().
- Watch the [introduction live stream]().

## FAQs

### Why should I use VineJS over Zod?

The primary goals of Zod and VineJS are slightly different, and therefore one might be a better fit over the other for a specific use case.

In the case of validating the HTTP request body, VineJS has the following advantages.

- The performance is 5x-10x better than Zod.
- VineJS handles many [HTML form serialization quirks](./html_forms_and_surprises.md) (which Zod does not).
- Offers a better workflow for defining custom error messages and formatting errors.

### What are the trade-offs of using VineJS?

VineJS is not a generic validation library; therefore, you cannot use it to validate JavaScript data types like Functions, Maps, or Sets.

### Can I use VineJS in a front-end application?

VineJS is meant to be used in the backend environment within Node.js runtime. Therefore, you cannot run it inside the browser.

However, if you use Remix or React server components (aka RSC), you can use VineJS as part of your server-side actions.

### Who maintains VineJS?

VineJS is an independent open-source project originally created by [Harminder Virk](http://twitter.com/amanvirk1) and maintained by the AdonisJS core team.

VineJS is an improved version of the existing AdonisJS validator codebase, released as a standalone library to work with any Node.js project.

### How can I sponsor VineJS?

The project is funded through Github Sponsors. If you or your business benefit from VineJS, consider [sponsoring us to support the project development](https://github.com/sponsors/thetutlage).

