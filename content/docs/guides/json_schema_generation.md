---
summary: Learn how to export VineJS validation schemas to JSON Schema format for API documentation, client-side validation, and tool integration.
---

# JSON Schema Generation

This guide covers JSON Schema generation in VineJS. You will learn how to:

- Convert VineJS validators to JSON Schema (Draft 7) format
- Map string, number, boolean, and enum types to their JSON Schema equivalents
- Work with arrays, tuples, objects, and records
- Handle nullable and optional modifiers
- Add custom metadata like descriptions and examples
- Extend custom validation rules with JSON Schema support
- Integrate generated schemas with external tools like Ajv

## Overview

VineJS validation schemas define how your application validates incoming data. However, these schemas live only within your TypeScript codebase. When you need to share validation rules with external systems, generate API documentation, or enable client-side validation, you need a portable format that other tools can understand.

The `toJSONSchema()` method converts any VineJS validator into a standard JSON Schema (Draft 7) object. This enables interoperability with the broader ecosystem of JSON Schema tools. You can feed the generated schema to documentation generators like OpenAPI, use it with client-side validators like Ajv, or share it with frontend teams building form validation that mirrors your backend rules.

## Basic usage

Call the `toJSONSchema()` method on any validator to get its JSON Schema representation.

```ts
import vine from '@vinejs/vine'

/**
 * Define your VineJS schema as usual.
 */
const schema = vine.object({
  name: vine.string(),
  email: vine.string().email(),
  age: vine.number().min(18)
})

/**
 * Create the validator, then export to JSON Schema.
 */
const validator = vine.create(schema)
const jsonSchema = validator.toJSONSchema()
```

The resulting `jsonSchema` object follows the JSON Schema Draft 7 specification:

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "number", "minimum": 18 }
  },
  "required": ["name", "email", "age"],
  "additionalProperties": false
}
```

You can serialize this object with `JSON.stringify()` to save it to a file, send it over HTTP, or pass it to any tool that accepts JSON Schema input.

## Supported schema types

VineJS maps each of its schema types to the corresponding JSON Schema constructs. The following sections cover each type and demonstrate how validation rules translate to schema properties.

### Strings

The `vine.string()` type maps to `{ "type": "string" }`. Validation methods add constraints and formats to the schema.

```ts title="app/validators/profile.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  /**
   * Basic string with length constraints.
   * Produces: { "type": "string", "minLength": 2, "maxLength": 100 }
   */
  username: vine.string().minLength(2).maxLength(100),

  /**
   * Email format adds the "format" keyword.
   * Produces: { "type": "string", "format": "email" }
   */
  email: vine.string().email(),

  /**
   * UUID validation uses the uuid format.
   * Produces: { "type": "string", "format": "uuid" }
   */
  apiKey: vine.string().uuid(),

  /**
   * Fixed length sets both min and max to the same value.
   * Produces: { "type": "string", "minLength": 8, "maxLength": 8 }
   */
  code: vine.string().fixedLength(8)
})
```

String methods that produce pattern-based validation generate a `pattern` property with the corresponding regular expression:

| VineJS Method | JSON Schema Output |
|---------------|-------------------|
| `.alpha()` | `{ "pattern": "^[a-zA-Z]+$" }` |
| `.alphaNumeric()` | `{ "pattern": "^[a-zA-Z0-9]+$" }` |
| `.ulid()` | `{ "pattern": "^[0-7][0-9A-HJKMNP-TV-Z]{25}$" }` |

Methods that map to standard JSON Schema formats use the `format` keyword:

| VineJS Method | JSON Schema Output |
|---------------|-------------------|
| `.email()` | `{ "format": "email" }` |
| `.uuid()` | `{ "format": "uuid" }` |
| `.ipAddress()` | `{ "format": "ipv4" }` |
| `.ipAddress(6)` | `{ "format": "ipv6" }` |

### Numbers

The `vine.number()` type maps to `{ "type": "number" }`. Range constraints translate to `minimum` and `maximum` keywords.

```ts title="app/validators/product.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  /**
   * Price with minimum value.
   * Produces: { "type": "number", "minimum": 0 }
   */
  price: vine.number().min(0),

  /**
   * Quantity with range constraint.
   * Produces: { "type": "number", "minimum": 1, "maximum": 1000 }
   */
  quantity: vine.number().range([1, 1000]),

  /**
   * Rating restricted to specific values.
   * Produces: { "type": "number", "enum": [1, 2, 3, 4, 5] }
   */
  rating: vine.number().in([1, 2, 3, 4, 5]),

  /**
   * Integer-only values change the type.
   * Produces: { "type": "integer" }
   */
  count: vine.number().withoutDecimals()
})
```

The `.positive()` method adds `{ "minimum": 0 }`, while `.negative()` adds `{ "exclusiveMaximum": 0 }` to ensure the value is strictly less than zero.

### Booleans

Boolean handling depends on whether you use strict mode:

```ts title="app/validators/settings.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  /**
   * Strict boolean only accepts true/false.
   * Produces: { "type": "boolean" }
   */
  isActive: vine.boolean({ strict: true }),

  /**
   * Non-strict boolean accepts truthy/falsy values like "1", "true", "on".
   * Produces: { "enum": [true, false, 1, 0, "1", "0", "true", "false", "on", "off"] }
   */
  newsletter: vine.boolean()
})
```

:::tip
Use strict mode when generating JSON Schema for external consumers. Non-strict mode produces an enum that may confuse tools expecting a standard boolean type.
:::

### Enums

Enum schemas produce a JSON Schema `enum` array containing all allowed values.

```ts title="app/validators/order.ts"
import vine from '@vinejs/vine'

/**
 * Array-based enum.
 * Produces: { "enum": ["pending", "processing", "shipped", "delivered"] }
 */
const statusSchema = vine.enum(['pending', 'processing', 'shipped', 'delivered'])

/**
 * TypeScript enum extracts the values.
 * Produces: { "enum": ["admin", "moderator", "user"] }
 */
enum Role {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user'
}

const roleSchema = vine.enum(Role)
```

### Arrays

Arrays translate to `{ "type": "array" }` with an `items` property describing the element type.

```ts title="app/validators/post.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  /**
   * Array of strings with minimum length.
   * Produces: { "type": "array", "items": { "type": "string" }, "minItems": 1 }
   */
  tags: vine.array(vine.string()).notEmpty(),

  /**
   * Array with uniqueness constraint.
   * Produces: { "type": "array", "items": { "type": "number" }, "uniqueItems": true }
   */
  categoryIds: vine.array(vine.number()).distinct(),

  /**
   * Array with max length.
   * Produces: { "type": "array", "items": { "type": "string" }, "maxItems": 5 }
   */
  attachments: vine.array(vine.string()).maxLength(5)
})
```

### Tuples

Tuples produce a fixed-length array schema with positional type definitions.

```ts title="app/validators/coordinates.ts"
import vine from '@vinejs/vine'

/**
 * A tuple of [latitude, longitude].
 * Produces:
 * {
 *   "type": "array",
 *   "items": [{ "type": "number" }, { "type": "number" }],
 *   "minItems": 2,
 *   "maxItems": 2,
 *   "additionalItems": false
 * }
 */
const coordinatesSchema = vine.tuple([
  vine.number().min(-90).max(90),
  vine.number().min(-180).max(180)
])
```

### Objects

Object schemas map to `{ "type": "object" }` with `properties` and `required` arrays.

```ts title="app/validators/user.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  name: vine.string(),
  bio: vine.string().optional()
})

/**
 * Produces:
 * {
 *   "type": "object",
 *   "properties": {
 *     "name": { "type": "string" },
 *     "bio": { "type": "string" }
 *   },
 *   "required": ["name"],
 *   "additionalProperties": false
 * }
 */
```

By default, VineJS sets `additionalProperties` to `false`, rejecting any properties not defined in the schema. Call `.allowUnknownProperties()` to change this:

```ts title="app/validators/flexible.ts"
import vine from '@vinejs/vine'

/**
 * Allows extra properties not defined in the schema.
 * Produces: { ... "additionalProperties": true }
 */
const schema = vine.object({
  id: vine.number()
}).allowUnknownProperties()
```

### Records

Records represent objects with dynamic keys where all values share the same type.

```ts title="app/validators/metadata.ts"
import vine from '@vinejs/vine'

/**
 * A record of string values with minimum entries.
 * Produces:
 * {
 *   "type": "object",
 *   "additionalProperties": { "type": "string" },
 *   "minProperties": 1
 * }
 */
const metadataSchema = vine.record(vine.string()).minLength(1)
```

### Literals

Literal types constrain a field to an exact value.

```ts title="app/validators/event.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  /**
   * Exact string value.
   * Produces: { "type": "string", "enum": ["user_created"] }
   */
  type: vine.literal('user_created'),

  /**
   * Exact numeric value.
   * Produces: { "type": "number", "enum": [1] }
   */
  version: vine.literal(1)
})
```

### Unions

Unions combine multiple possible schemas using the `anyOf` keyword.

```ts title="app/validators/contact.ts"
import vine from '@vinejs/vine'

/**
 * Accept either an email string or a contact object.
 * Produces:
 * {
 *   "anyOf": [
 *     { "type": "string", "format": "email" },
 *     {
 *       "type": "object",
 *       "properties": { "email": { "type": "string", "format": "email" } },
 *       "required": ["email"],
 *       "additionalProperties": false
 *     }
 *   ]
 * }
 */
const contactSchema = vine.union([
  vine.union.if(
    (value) => typeof value === 'string',
    vine.string().email()
  ),
  vine.union.if(
    (value) => typeof value === 'object',
    vine.object({ email: vine.string().email() })
  )
])
```

For simpler type unions without conditions, use `unionOfTypes`:

```ts title="app/validators/identifier.ts"
import vine from '@vinejs/vine'

/**
 * Accept either a string or number.
 * Produces: { "anyOf": [{ "type": "string" }, { "type": "number" }] }
 */
const identifierSchema = vine.unionOfTypes([vine.string(), vine.number()])
```

### Any

The `vine.any()` type produces a schema that accepts any JSON value.

```ts title="app/validators/payload.ts"
import vine from '@vinejs/vine'

/**
 * Accepts any value type.
 * Produces:
 * {
 *   "anyOf": [
 *     { "type": "string" },
 *     { "type": "number" },
 *     { "type": "boolean" },
 *     { "type": "array" },
 *     { "type": "object" }
 *   ]
 * }
 */
const payloadSchema = vine.any()
```

## Modifiers

### Nullable fields

The `.nullable()` modifier allows a field to accept `null` in addition to its base type.

```ts title="app/validators/profile.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  /**
   * String or null.
   * Produces: { "type": ["string", "null"] }
   */
  middleName: vine.string().nullable(),

  /**
   * Enum types use anyOf for nullable.
   * Produces: { "anyOf": [{ "enum": ["active", "inactive"] }, { "type": "null" }] }
   */
  status: vine.enum(['active', 'inactive']).nullable()
})
```

### Optional fields

The `.optional()` modifier removes the field from the parent object's `required` array. The field's type definition remains unchanged.

```ts title="app/validators/registration.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  email: vine.string().email(),
  phone: vine.string().optional()
})

/**
 * The "phone" field is not in the required array.
 * Produces:
 * {
 *   "type": "object",
 *   "properties": {
 *     "email": { "type": "string", "format": "email" },
 *     "phone": { "type": "string" }
 *   },
 *   "required": ["email"],
 *   "additionalProperties": false
 * }
 */
```

## Adding metadata

Use the `.meta()` method to add JSON Schema keywords like `description`, `examples`, `default`, and any other valid schema properties.

```ts title="app/validators/article.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  title: vine.string()
    .minLength(10)
    .maxLength(200)
    .meta({
      description: 'The article title displayed to readers',
      examples: ['Introduction to VineJS', '10 Tips for Better Validation']
    }),

  publishedAt: vine.string().optional().meta({
    description: 'ISO 8601 timestamp when the article goes live',
    format: 'date-time',
    default: null
  })
})
```

The properties you pass to `.meta()` merge directly into the generated JSON Schema for that field, making it straightforward to add documentation or override inferred values.

## Custom rules with JSON Schema support

When you create custom validation rules, you can define how they modify the generated JSON Schema by providing a `toJSONSchema` callback.

```ts title="app/validators/rules/slug.ts"
import { createRule } from '@vinejs/vine'

/**
 * Custom rule that validates URL-friendly slugs.
 */
export const slug = createRule(
  (value, options, field) => {
    if (typeof value !== 'string') {
      return
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugPattern.test(value)) {
      field.report('The {{ field }} must be a valid URL slug', 'slug', field)
    }
  },
  {
    /**
     * Define how this rule modifies the JSON Schema.
     * The schema object is mutated in place.
     */
    toJSONSchema(schema, options) {
      schema.pattern = '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      schema.description = 'URL-friendly slug containing lowercase letters, numbers, and hyphens'
    }
  }
)
```

Apply the custom rule to a field, and the JSON Schema will include your additions:

```ts title="app/validators/post.ts"
import vine from '@vinejs/vine'
import { slug } from './rules/slug.js'

const schema = vine.object({
  slug: vine.string().use(slug())
})

/**
 * The slug field's schema includes the custom pattern.
 * Produces:
 * {
 *   "type": "string",
 *   "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
 *   "description": "URL-friendly slug containing lowercase letters, numbers, and hyphens"
 * }
 */
```

## Integration with Ajv

A common use case for JSON Schema export is client-side validation with libraries like [Ajv](https://ajv.js.org/). You can generate the schema once and use it across your frontend and backend.

```ts title="scripts/generate_schemas.ts"
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import vine from '@vinejs/vine'

/**
 * Define your VineJS schema.
 */
const userSchema = vine.object({
  email: vine.string().email(),
  age: vine.number().min(18).max(120)
})

/**
 * Generate JSON Schema from VineJS.
 */
const validator = vine.create(userSchema)
const jsonSchema = validator.toJSONSchema()

/**
 * Set up Ajv with format support for email validation.
 */
const ajv = new Ajv()
addFormats(ajv)

/**
 * Compile the schema for validation.
 */
const validate = ajv.compile(jsonSchema)

/**
 * Validate data using the generated schema.
 */
const data = { email: 'user@example.com', age: 25 }
const isValid = validate(data)

if (!isValid) {
  console.error('Validation errors:', validate.errors)
}
```

:::tip
When using Ajv, install the `ajv-formats` package to support format validations like `email`, `uuid`, and `date-time`. Without it, Ajv will ignore format keywords by default.
:::

## Limitations

JSON Schema represents static validation rules. Several VineJS features cannot be fully represented in the generated schema.

**Data transformations are not included.** The `.parse()` method transforms values after validation, but JSON Schema only describes validation constraints, not transformation logic. If you use `.parse()` to convert strings to dates or trim whitespace, the generated schema will not reflect these transformations.

**Async rules cannot be represented.** Rules that perform database queries, API calls, or other asynchronous operations have no JSON Schema equivalent. A uniqueness check like `vine.string().unique()` validates against your database at runtime, but the generated schema can only describe the string type constraint.

**Context-dependent rules are static.** Rules that compare against request context (like the authenticated user) or other fields in the same object cannot express their dynamic nature in JSON Schema. The schema captures the structure but not the runtime conditions.

If you need to communicate these constraints to consumers of your JSON Schema, use the `.meta()` method to add descriptive text:

```ts title="app/validators/user.ts"
import vine from '@vinejs/vine'

const schema = vine.object({
  email: vine.string().email().unique().meta({
    description: 'Email address (must be unique in the system)'
  }),

  confirmedAt: vine.string().optional().parse((value) => new Date(value)).meta({
    description: 'ISO 8601 timestamp (transformed to Date object server-side)',
    format: 'date-time'
  })
})
```

See also: [Custom validation rules](../extend/custom_rules.md) for creating reusable validation logic with JSON Schema support.
