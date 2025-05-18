---
summary: Defines file upload validation rules, such as type, size, and required status.
---

# File Type

The `file` schema type in VineJS enables you to validate uploaded files, whether they come from browser-based form submissions (`FormData`) or are handled as files on the server using Node.js. This type ensures that files meet specific criteria such as type, size, and presence, providing robust validation for both client and server environments.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
  avatar: vine.file()
})
```

Using the following modifiers, you may mark the field as `optional` or `nullable`.

See also: [Working with `undefined` and `null` values](../guides/schema_101.md#nullable-and-optional-modifiers)

```ts
{
  avatar: vine.file().nullable()
}
```

```ts
{
  avatar: vine.file().optional()
}
```

## Defining error message

You may define custom error messages for the following file-based rules.

```ts
const messages = {
    file: 'The {{ field }} field must be a valid file',
  'file.minSize': 'The {{ field }} field must be at least {{ min }} bytes in size',
  'file.maxSize': 'The {{ field }} field must not exceed {{ max }} bytes in size',
  'file.mimeTypes': 'The {{ field }} field must be one of the following mime types: {{ mimeTypes }}',
}

vine.messagesProvider = new SimpleMessagesProvider(messages)
```

## Validations

Following is the list of validation rules you can apply on a file.

### minSize
Enforces that the uploaded file must have a size greater than or equal to the specified minimum value (in bytes).

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
    avatar: vine.file().minSize(1024) // Minimum size: 1 KB
})
```

### maxSize
Enforces that the uploaded file must not exceed the specified maximum size (in bytes).

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
    avatar: vine.file().maxSize(1024 * 1024) // Maximum size: 1 MB
})
```

### mimeTypes
Restricts the uploaded file to specific MIME types. The `mimeTypes` method accepts an array of allowed MIME type strings.

```ts
import vine from '@vinejs/vine'

const schema = vine.object({
    avatar: vine.file().mimeTypes(['image/png', 'image/jpeg'])
})
```

In this example, only PNG and JPEG image files are accepted. If the uploaded file's MIME type does not match any value in the array, validation will fail.