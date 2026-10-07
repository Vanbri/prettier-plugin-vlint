import { expect, it } from 'vitest'
import format from './format'

it('removes braces from a simple if', async () => {
	const input = `
if (condition) {
	doSomething()
}
`
	const expected = `if (condition) doSomething()
`

	expect(await format(input)).toBe(expected)
})

it('removes braces from if / else', async () => {
	const input = `
if (condition) {
	doSomething()
} else {
	doSomethingElse()
}
`
	const expected = `if (condition) doSomething()
else doSomethingElse()
`

	expect(await format(input)).toBe(expected)
})

it('removes braces from else if chains', async () => {
	const input = `
if (condition1) {
	doSomething()
} else if (condition2) {
	doSomethingElse()
} else {
	doSomethingElseAgain()
}
`
	const expected = `if (condition1) doSomething()
else if (condition2) doSomethingElse()
else doSomethingElseAgain()
`

	expect(await format(input)).toBe(expected)
})

it('keeps braces when removing them would create a dangling else', async () => {
	const input = `
if (condition1) {
	if (condition2) {
		doSomething()
	}
} else {
	doSomethingElse()
}
`
	const expected = `if (condition1) {

	if (condition2) doSomething()

} else doSomethingElse()
`

	expect(await format(input)).toBe(expected)
})

it('keeps braces when the body contains multiple statements', async () => {
	const input = `
if (condition) {
	doSomething()
	doSomethingElse()
}
`
	const expected = `if (condition) {

	doSomething()
	doSomethingElse()

}
`

	expect(await format(input)).toBe(expected)
})

it('removes braces from for statements', async () => {
	const input = `
for (let i = 0; i < 10; i++) {
	doSomething(i)
}
`
	const expected = `for (let i = 0; i < 10; i++) doSomething(i)
`

	expect(await format(input)).toBe(expected)
})

it('removes braces from for-in statements', async () => {
	const input = `
for (const key in object) {
	doSomething(key)
}
`
	const expected = `for (const key in object) doSomething(key)
`

	expect(await format(input)).toBe(expected)
})

it('removes braces from for-of statements', async () => {
	const input = `
for (const value of values) {
	doSomething(value)
}
`
	const expected = `for (const value of values) doSomething(value)
`

	expect(await format(input)).toBe(expected)
})

it('removes braces from while statements', async () => {
	const input = `
while (condition) {
	doSomething()
}
`
	const expected = `while (condition) doSomething()
`

	expect(await format(input)).toBe(expected)
})