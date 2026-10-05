# Prettier Plugin

Prettier plugin that applies a more compact and opinionated formatting style.

## Formatting rules

- **No semicolons** at the end of statements unless they are syntactically required.
- **Maximum line width:** 120 characters.
- **Single quotes** are always preferred.
- **Tabs** are used for indentation.
- **No unnecessary trailing blank lines.**
- **Trailing commas are disabled.**
- **Arrow function parameters omit parentheses when possible.**

### Braces

Braces are removed when a control statement can be written safely without them:

```js
if (condition) doSomething()
```

When the statement does not fit on one line, it may be formatted across two lines:

```js
if (condition)
	doSomething()
```

When braces are required, blocks use a more expanded format with blank lines around their contents:

```js
if (condition) {

	doSomething()

}
```

The same style is applied to `for`, `for...in`, `for...of`, `while`, `do...while` and `with` statements where possible.

### Functions, methods and classes

Function and method bodies prefer a compact form when possible:

```js
function example() { doSomething() }
```

When the contents require more space, the block is expanded:

```js
function example() {

	doSomething()

}
```

Class bodies use the expanded format:

```js
class Example {

	method() {

		doSomething()

	}

}
```

Blank lines already present between statements are preserved.

### TypeScript type literals

Type literals can be kept compact when they fit on a line:

```ts
type Example = { foo: string, bar: number }
```

Otherwise they are expanded:

```ts
type Example = {
	foo: string
	bar: number
}
```

Type member semicolons are removed.

## Default options

The plugin uses the following defaults:

```json
{
	"printWidth": 120,
	"useTabs": true,
	"singleQuote": true,
	"jsxSingleQuote": true,
	"arrowParens": "avoid",
	"semi": false,
	"trailingComma": "none",
	"bracketSpacing": true
}
```

## Usage

Install the plugin alongside Prettier:

```bash
npm install -D prettier prettier-plugin-vlint
```

Then add it to your Prettier configuration:

```js
export default {
	plugins: ['prettier-plugin-vlint'],
}
```