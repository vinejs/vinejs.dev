# Pre-compiling schema

The performance benefits of using VineJS kick in when you pre-compile a schema. During the pre-compile phase, VineJS will convert your schema into an optimized JavaScript function that you can reuse to perform validations.

The schema compilation is handled by the [@vinejs/compiler](https://github.com/vinejs/compiler) package. Feel free to explore the source code if that interests you.

Let's create a schema and pre-compile it using the `vine.compile` method.

```ts
// title: schemas/user_registration.ts
import vine from '@vinejs/vine'

const schema = vine.schema({
  username: vine.string(),
  email: vine.string().email(),
  password: vine.string().min(8).max(32).confirmed()
})

export const validate = vine.compile(schema)
```

The `vine.compile` method returns a `validate` function you can use to perform validations. The data to validate, custom error messages, or the error reporter are provided to the `validate` method.

```ts
import { validate } from './schemas/user_registration.js'

const data = {
  username: 'virk',
  email: 'virk@example.com',
  password: 'secret',
  password_confirmation: 'secret',
}

const messages = {
  required: 'The {{ field }} field is required',
  string: 'The value of {{ field }} field must be a string',
  email: 'The value is not a valid email address',
}

await validate({
  data,
  messages
})
```

## Pre-compiling limitations

Like anything else in programming, pre-compiling has its trade-offs as well. The biggest trade-off is that your schema has to be static and cannot accept dynamic options.

Here's an example of validating the user state and the city. We want to limit the user selection of cities based on the `state` they have selected. However, we have no information about their selected state when compiling the schema.

```ts
import vine from '@vinejs/vine'

const states = getListOfStates()

const schema = vine.schema({
  state: schema.string().in(states),
  cities: schema.string().in(
    // highlight-start
    /* how to get cities? */
    // highlight-end
  )
})

export const validate = vine.compile(schema)
```

There are a few ways to work around this limitation.

### Creating specific rules

The first option is to create a custom rule that accepts a collection of all states and cities. Then, during validation, this rule will look up the user-selected state and narrow down the cities based on that.

Following is a simple implementation of the same.

```ts
const inCitiesList = vine.createRule((value, options, ctx) => {
  /**
   * Getting the user-selected state from
   * parent object
   */
  const state = ctx.parent.state

  /**
   * The rule options have all the cities
   */
  const allCities = options.cities

  /**
   * Narrow down cities based on user state
   * selection
   */
  const stateCities = allCities[state]
  
  /**
   * Perform validation
   */
  if (!stateCities.includes(value)) {
    ctx.report('Invalid city selection', 'includes', ctx)
  }
})
```

```ts
const states = getListOfStates()
const allCities = getListOfAllCities()

const schema = vine.schema({
  state: schema.string().in(states),
  cities: schema.string().inCitiesList(allCities)
})
```

As you can see, the `inCitiesList` rule accepts all the cities for all the states and internally narrow down the cities based on state selection.

### Giving up pre-compiling and using schema caching

Schema caching allows you to define the validation schema with dynamic options and cache its compiled output using a unique cache key.

We do not use the `vine.compile` method in the following example. Instead, we define a new schema every time and get a list of cities from the `data.state` property.

However, we tell VineJS to cache the compiled output using the `cacheKey` and provide it the dynamic options every time.

```ts
import vine from '@vinejs/vine'

// Get user input
const data = {}

const states = getListOfStates()
// insert-start
const cities = getListOfCities(data.state)
// insert-end

const schema = vine.schema({
  state: schema.string().in(states),
  cities: schema.string().in(cities)
})

await vine.validate({
  schema,
  data,
  // insert-start
  cacheKey: 'user_profile'
  // insert-end
})
```

:::tip

**Confused between pre-compiling and caching?**: Watch this screencast to learn more about the differences.

:::
