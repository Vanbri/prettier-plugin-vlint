import { expect, it } from 'vitest'
import format from './format'

it('keeps a short function compact', async () => {
	const input = `
function example() {
	doSomething()
}
`
	const expected = `function example() { doSomething() }
`

	expect(await format(input)).toBe(expected)
})

it('keeps a short arrow function compact', async () => {
	const input = `
const example = () => {
	doSomething()
}
`
	const expected = `const example = () => { doSomething() }
`

	expect(await format(input)).toBe(expected)
})

it('uses expanded formatting for a function with multiple statements', async () => {
	const input = `
function example() {
	const value = getValue()
	doSomething(value)
}
`
	const expected = `function example() {

	const value = getValue()
	doSomething(value)

}
`

	expect(await format(input)).toBe(expected)
})

it('keeps a short method compact', async () => {
	const input = `
class Example {
	method() {
		doSomething()
	}
}
`
	const expected = `class Example {

	method() { doSomething() }

}
`

	expect(await format(input)).toBe(expected)
})

it('expands a method with multiple statements', async () => {
	const input = `
class Example {
	method() {
		const value = getValue()
		doSomething(value)
	}
}
`
	const expected = `class Example {

	method() {

		const value = getValue()
		doSomething(value)

	}

}
`

	expect(await format(input)).toBe(expected)
})