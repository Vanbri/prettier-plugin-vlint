import { expect, it } from 'vitest'
import format from './format'

it('formats short type literals on one line', async () => {
	const input = `type Example = {
	first: string;
	second: number,
}
`
	const expected = `type Example = { first: string, second: number }
`

	expect(await format(input)).toBe(expected)
})

it('formats long type literals across multiple lines', async () => {
	const input = `type Example = {
	firstLongParam: string;
	secondLongParam: number;
	thirdLongParam: boolean;
	fourthLongParam: object,
	fifthLongParam: object,
	sixthLongParam: object,
	seventhLongParam: object,
	eighthLongParam: object;
}
`
	const expected = `type Example = {

	firstLongParam: string
	secondLongParam: number
	thirdLongParam: boolean
	fourthLongParam: object
	fifthLongParam: object
	sixthLongParam: object
	seventhLongParam: object
	eighthLongParam: object

}
`

	expect(await format(input)).toBe(expected)
})