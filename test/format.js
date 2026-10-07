import * as prettier from 'prettier'
import plugin from '../index.mjs'

export default async function format(source)
	{ return prettier.format(source, { parser: 'typescript', plugins: [plugin] }) }