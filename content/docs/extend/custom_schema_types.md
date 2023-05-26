# Creating custom schema types

You might consider creating custom schema types to represent specific data types in your application. For example, if your application deals with monetary information like payments, you might want to create a `money` schema type for it.

## What is a schema type?

A schema type represents a JavaScript data type, along with a collection of validation rules wrapped in an easy-to-use chainable API.

The schema input and output values can be different. For example, you may accept the payment information as a number (in cents) and convert it to a value object post-validation.

## Creating money schema type

The best way to learn about custom schema types, is to create a schema type from scratch. Let's use [Dinero.js](https://v2.dinerojs.com/docs) to add `money` data-type to VineJS.

The first step is to visualize the API we want to use.

```ts
vine.schema({
  amount: vine.money()
})
```

TBD...
