import { expect, it } from 'vitest'
import format from './format'

it('avoids parentheses around a single arrow parameter', async () => {
	const input = `const example = (value) => value
`
	const expected = `const example = value => value
`

	expect(await format(input)).toBe(expected)
})

it('uses single quotes', async () => {
	const input = `const value = "hello"
`
	const expected = `const value = 'hello'
`

	expect(await format(input)).toBe(expected)
})

it('keeps syntactically necessary semicolons', async () => {
	const input = `const value = 1
;[1, 2, 3].forEach(item => console.log(item))
`
	const expected = `const value = 1
;[1, 2, 3].forEach(item => console.log(item))
`

	expect(await format(input)).toBe(expected)
})
