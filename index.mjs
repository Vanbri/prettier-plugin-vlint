import * as prettierEstree from 'prettier/plugins/estree'
import * as prettier from 'prettier'

const basePrinter = prettierEstree.printers.estree

const {
	conditionalGroup: conditionalGroupBuilder,
	dedent: dedentBuilder,
	group: groupBuilder,
	hardline: hardlineBuilder,
	indent: indentBuilder,
	join: joinBuilder,
	line: lineBuilder,
	softline: softlineBuilder,
} = prettier.doc.builders

const contextByOptions = new WeakMap()

function getContext(options) {
	let context = contextByOptions.get(options)

	if (!context) {
		context = {
			unbracedBodies: new Set(),
			expandedControlBodies: new Set(),
			methodBodies: new Set(),
		}

		contextByOptions.set(options, context)
	}

	return context
}

function withNodes(options, collectionName, nodes, callback) {
	if (nodes.length === 0) return callback()

	const collection = getContext(options)[collectionName]

	for (const node of nodes) collection.add(node)

	try {
		return callback()
	} finally {
		for (const node of nodes) collection.delete(node)
	}
}

function getSingleBlockStatement(block) {
	if (block?.type !== 'BlockStatement' || block.body.length !== 1) return null

	return block.body[0]
}

function getNodeStart(node) {
	return node?.start ?? node?.range?.[0]
}

function getNodeEnd(node) {
	return node?.end ?? node?.range?.[1]
}

function getOriginalText(options) {
	return options.originalText?.replace(/\r\n?/g, '\n')
}

function canBeUnbracedStatement(statement) {
	if (!statement) return false

	switch (statement.type) {
		case 'ExpressionStatement':
		case 'ReturnStatement':
		case 'ThrowStatement':
		case 'BreakStatement':
		case 'ContinueStatement':
		case 'DebuggerStatement':
		case 'EmptyStatement':
		case 'LabeledStatement':
		case 'ForStatement':
		case 'ForInStatement':
		case 'ForOfStatement':
		case 'WhileStatement':
		case 'DoWhileStatement':
		case 'WithStatement':
			return true

		case 'VariableDeclaration':
			return statement.kind === 'var'

		case 'IfStatement':
			return statement.alternate == null

		default:
			return false
	}
}

function canUnbrace(block, avoidDanglingElse = false) {
	const statement = getSingleBlockStatement(block)

	if (
		avoidDanglingElse &&
		statement?.type === 'IfStatement' &&
		statement.alternate == null
	) {
		return false
	}

	return Boolean(statement && canBeUnbracedStatement(statement))
}

function getControlBodies(node) {
	const bodies = []

	if (node.type === 'IfStatement') {
		if (canUnbrace(node.consequent, node.alternate != null)) {
			bodies.push(node.consequent)
		}
		if (canUnbrace(node.alternate)) bodies.push(node.alternate)

		return bodies
	}

	if (
		node.type === 'ForStatement' ||
		node.type === 'ForInStatement' ||
		node.type === 'ForOfStatement' ||
		node.type === 'WhileStatement' ||
		node.type === 'DoWhileStatement' ||
		node.type === 'WithStatement'
	) {
		if (canUnbrace(node.body)) bodies.push(node.body)
	}

	return bodies
}

function hasBlankLineBetween(firstNode, secondNode, options) {
	const source = getOriginalText(options)

	if (!source) return false

	const firstEnd = getNodeEnd(firstNode)
	const secondStart = getNodeStart(secondNode)

	if (firstEnd == null || secondStart == null) return false

	const text = source.slice(firstEnd, secondStart)

	const lines = text.split('\n')

	if (lines.length <= 2) return false

	return lines
		.slice(1, -1)
		.some(line => line.trim() === '')
}

function joinNodes(nodes, docs, options) {
	const result = []

	for (let index = 0; index < docs.length; index++) {
		if (index > 0) {
			const separator = hasBlankLineBetween(
				nodes[index - 1],
				nodes[index],
				options,
			)
				? [hardlineBuilder, hardlineBuilder]
				: hardlineBuilder

			result.push(separator)
		}

		result.push(docs[index])
	}

	return result
}

function removeTypeMemberSemicolon(doc) {
	if (typeof doc === 'string') {
		return doc === ';' ? '' : doc
	}

	if (Array.isArray(doc)) {
		return doc.map(removeTypeMemberSemicolon)
	}

	if (!doc || typeof doc !== 'object') {
		return doc
	}

	if (doc.type === 'if-break') {
		return {
			...doc,
			breakContents: removeTypeMemberSemicolon(doc.breakContents),
			flatContents: removeTypeMemberSemicolon(doc.flatContents),
		}
	}

	const result = { ...doc }

	for (const key of Object.keys(result)) {
		if (
			key === 'type' ||
			key === 'id' ||
			key === 'groupId'
		) {
			continue
		}

		const value = result[key]

		if (Array.isArray(value)) {
			result[key] = value.map(removeTypeMemberSemicolon)
		} else if (value && typeof value === 'object') {
			result[key] = removeTypeMemberSemicolon(value)
		}
	}

	return result
}

function printExpandedBlock(nodes, contents, options) {
	return [
		'{',
		indentBuilder([
			hardlineBuilder,
			hardlineBuilder,
			joinNodes(nodes, contents, options),
		]),
		hardlineBuilder,
		hardlineBuilder,
		'}',
	]
}

function printBlockStatement(path, options, print) {
	const node = path.node
	const parent = path.getParentNode()
	const directives = node.directives
		? path.map(print, 'directives')
		: []

	const statements = path.map(print, 'body')
	const contents = [...directives, ...statements]
	const nodes = [...(node.directives ?? []), ...node.body]

	if (contents.length === 0) {
		return '{ }'
	}

	if (getContext(options).expandedControlBodies.has(node)) {
		return printExpandedBlock(nodes, contents, options)
	}

	if (
		getContext(options).methodBodies.has(node) ||
		(parent?.body === node &&
			(parent.type === 'FunctionDeclaration' ||
				parent.type === 'FunctionExpression' ||
				parent.type === 'ArrowFunctionExpression'))
	) {
		const expanded = printExpandedBlock(nodes, contents, options)

		if (contents.length > 1) return expanded

		const inline = groupBuilder([
			'{ ',
			contents[0],
			' }',
		])

		const nextLine = indentBuilder([
			hardlineBuilder,
			inline,
		])

		return conditionalGroupBuilder([
			inline,
			nextLine,
			expanded,
		])
	}

	if (contents.length === 1) {
		return conditionalGroupBuilder([
			groupBuilder([
				'{ ',
				contents[0],
				' }',
			]),
			printExpandedBlock(nodes, contents, options),
		])
	}

	return printExpandedBlock(nodes, contents, options)
}
function printClassBody(path, options, print) {
	const node = path.node
	const members = path.map(print, 'body')

	if (members.length === 0) return '{ }'

	return [
		'{',
		indentBuilder([
			hardlineBuilder,
			hardlineBuilder,
			joinNodes(node.body, members, options),
		]),
		dedentBuilder([
			hardlineBuilder,
			hardlineBuilder,
			'}',
		]),
	]
}

function printTypeLiteral(path, print) {
	const members = path.map(
		memberPath => removeTypeMemberSemicolon(print(memberPath)),
		'members',
	)

	if (members.length === 0) return '{ }'

	const compact = groupBuilder([
		'{ ',
		joinBuilder([',', lineBuilder], members),
		' }',
	])

	const expanded = [
		'{',
		indentBuilder([
			hardlineBuilder,
			joinBuilder([',', hardlineBuilder], members),
		]),
		dedentBuilder([
			hardlineBuilder,
			'}',
		]),
	]

	return conditionalGroupBuilder([
		compact,
		expanded,
	])
}

function isEmptyConstructor(node) {
	return (
		node.type === 'MethodDefinition' &&
		node.kind === 'constructor' &&
		node.value?.body?.type === 'BlockStatement' &&
		node.value.body.body.length === 0
	)
}

function printEmptyConstructor(path, print) {
	const node = path.node
	const params = node.value.params ?? []
	const parameterDocs = params.map((_, index) =>
		print(['value', 'params', index]),
	)
	const accessibility = node.accessibility
		? `${node.accessibility} `
		: ''

	return groupBuilder([
		accessibility,
		print('key'),
		'(',
		indentBuilder([
			softlineBuilder,
			joinBuilder([',', lineBuilder], parameterDocs),
		]),
		softlineBuilder,
		') { }',
	])
}

function print(path, options, print) {
	const node = path.node
	const context = getContext(options)

	if (isEmptyConstructor(node)) {
		return printEmptyConstructor(path, print)
	}

	if (
		node.type === 'MethodDefinition' &&
		node.value?.body?.type === 'BlockStatement'
	) {
		return withNodes(
			options,
			'methodBodies',
			[node.value.body],
			() => basePrinter.print(path, options, print),
		)
	}

	if (node.type === 'BlockStatement') {
		if (context.unbracedBodies.has(node)) {
			const statement = node.body[0]

			if (canBeUnbracedStatement(statement)) {
				return print(['body', 0])
			}
		}

		return printBlockStatement(path, options, print)
	}

	if (node.type === 'IfStatement') {
		const unbracedBodies = getControlBodies(node)
		const expandedBodies = []

		if (
			node.consequent?.type === 'BlockStatement' &&
			!unbracedBodies.includes(node.consequent)
		) {
			expandedBodies.push(node.consequent)
		}

		if (
			node.alternate?.type === 'BlockStatement' &&
			!unbracedBodies.includes(node.alternate)
		) {
			expandedBodies.push(node.alternate)
		}

		const consequentKeepsBraces =
			node.consequent?.type === 'BlockStatement' &&
			!unbracedBodies.includes(node.consequent)

		return withNodes(
			options,
			'unbracedBodies',
			unbracedBodies,
			() =>
				withNodes(
					options,
					'expandedControlBodies',
					expandedBodies,
					() => [
						groupBuilder([
							'if (',
							print('test'),
							')',
							consequentKeepsBraces
								? [' ', print('consequent')]
								: indentBuilder([
									lineBuilder,
									print('consequent'),
								]),
						]),
						node.alternate
							? [
								hardlineBuilder,
								'else ',
								print('alternate'),
							]
							: '',
					],
				),
		)
	}

	if (
		node.type === 'ClassBody' ||
		node.type === 'TSInterfaceBody'
	) {
		return printClassBody(path, options, print)
	}

	if (node.type === 'TSTypeLiteral') {
		return printTypeLiteral(path, print)
	}

	return withNodes(
		options,
		'unbracedBodies',
		getControlBodies(node),
		() => basePrinter.print(path, options, print),
	)
}

export const printers = {
	estree: {
		...basePrinter,
		print,
	},
}

export const defaultOptions = {
	printWidth: 120,
	useTabs: true,
	singleQuote: true,
	jsxSingleQuote: true,
	arrowParens: 'avoid',
	semi: false,
	trailingComma: 'none',
	bracketSpacing: true,
}

export default {
	printers,
	defaultOptions,
}