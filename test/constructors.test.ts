import { expect, it } from 'vitest'
import format from './format'

it('adds spaces inside empty constructor bodies', async () => {
	const input = `class Example {

	constructor() {}

}
`
	const expected = `class Example {

	constructor() { }

}
`

	expect(await format(input)).toBe(expected)
})

it('formats short constructor parameters on one line', async () => {
	const input = `class Example {

	constructor(
		name1: string,
		name2: number
	) { }

}
`
	const expected = `class Example {

	constructor(name1: string, name2: number) { }

}
`

	expect(await format(input)).toBe(expected)
})

it('formats short constructor parameters on one line when input wraps', async () => {
	const input = `class Example {

	constructor(name1: string,
		name2: number) { }

}
`
	const expected = `class Example {

	constructor(name1: string, name2: number) { }

}
`

	expect(await format(input)).toBe(expected)
})

it('wraps long constructor parameters', async () => {
	const input = `class Example {

	constructor(veryLongParameterNameOne: string, veryLongParameterNameTwo: number, veryLongParameterNameThree: object, veryLongParameterNameFour: string) { }

}
`
	const expected = `class Example {

	constructor(
		veryLongParameterNameOne: string,
		veryLongParameterNameTwo: number,
		veryLongParameterNameThree: object,
		veryLongParameterNameFour: string
	) { }

}
`

	expect(await format(input)).toBe(expected)
})

it('adds blank lines around class members', async () => {
	const input = `class Example {
	constructor(name: string, age: number) { }
}
`
	const expected = `class Example {

	constructor(name: string, age: number) { }

}
`

	expect(await format(input)).toBe(expected)
})

it('indents constructor bodies with tabs', async () => {
	const input = `class Example {

constructor(name: string, age: number) { }

}
`
	const expected = `class Example {

	constructor(name: string, age: number) { }

}
`

	expect(await format(input)).toBe(expected)
})