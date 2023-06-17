import { Token, matchType, matchToken } from './token'
import { compilerError } from './error'

type SyntaxCheckContext = {
	location: string
	reference: {
		project: boolean
	}
}

function validateIf(token: Token, context: SyntaxCheckContext) {
	if (token.content.content.params.length > 1) {
		const unexpectedToken = token.content.content.params[1][0]
		if (typeof unexpectedToken.content == 'string') {
			compilerError(
				`Unexpected '${unexpectedToken.content}'`,
				unexpectedToken.lines.start,
				unexpectedToken.lines.end,
				unexpectedToken.columns.start,
				unexpectedToken.columns.end
			)
		} else {
			compilerError(
				`Unexpected ${unexpectedToken.type}`,
				unexpectedToken.lines.start,
				unexpectedToken.lines.end,
				unexpectedToken.columns.start,
				unexpectedToken.columns.end
			)
		}
	}

	if (token.content.content.params[0].length > 1) {
		const unexpectedToken = token.content.content.params[0][1]
		if (typeof unexpectedToken.content == 'string') {
			compilerError(
				`Unexpected '${unexpectedToken.content}'`,
				unexpectedToken.lines.start,
				unexpectedToken.lines.end,
				unexpectedToken.columns.start,
				unexpectedToken.columns.end
			)
		} else {
			compilerError(
				`Unexpected ${unexpectedToken.type}`,
				unexpectedToken.lines.start,
				unexpectedToken.lines.end,
				unexpectedToken.columns.start,
				unexpectedToken.columns.end
			)
		}
	}
}

function validateWhile(token: Token, context: SyntaxCheckContext) {
	if (token.content.content.params.length == 0)
		compilerError(
			`While statement expects bool`,
			token.lines.start,
			token.lines.end,
			token.columns.start,
			token.columns.end
		)

	if (token.content.content.params.length > 1) {
		const unexpectedToken = token.content.content.params[1][0]
		if (typeof unexpectedToken.content == 'string') {
			compilerError(
				`Unexpected '${unexpectedToken.content}'`,
				unexpectedToken.lines.start,
				unexpectedToken.lines.end,
				unexpectedToken.columns.start,
				unexpectedToken.columns.end
			)
		} else {
			compilerError(
				`Unexpected ${unexpectedToken.type}`,
				unexpectedToken.lines.start,
				unexpectedToken.lines.end,
				unexpectedToken.columns.start,
				unexpectedToken.columns.end
			)
		}
	}

	if (token.content.content.params[0].length > 1) {
		const unexpectedToken = token.content.content.params[0][1]
		if (typeof unexpectedToken.content == 'string') {
			compilerError(
				`Unexpected '${unexpectedToken.content}'`,
				unexpectedToken.lines.start,
				unexpectedToken.lines.end,
				unexpectedToken.columns.start,
				unexpectedToken.columns.end
			)
		} else {
			compilerError(
				`Unexpected ${unexpectedToken.type}`,
				unexpectedToken.lines.start,
				unexpectedToken.lines.end,
				unexpectedToken.columns.start,
				unexpectedToken.columns.end
			)
		}
	}
}

function validate(token: Token, context: SyntaxCheckContext) {
	if (
		(context.location == 'global' &&
			!['call', 'definition', 'assignment', 'if', 'while', 'import'].includes(token.type) &&
			!(token.type == 'sprite' && context.reference.project) &&
			!(token.type == 'costume' && !context.reference.project)) ||
		(context.location == 'function' &&
			!['call', 'definition', 'assignment', 'return', 'if', 'while'].includes(token.type))
	) {
		if (typeof token.content == 'string') {
			compilerError(
				`Unexpected '${token.content}'`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)
		} else {
			compilerError(
				`Unexpected ${token.type}`,
				token.lines.start,
				token.lines.end,
				token.columns.start,
				token.columns.end
			)
		}
	}

	if (matchType(token, 'if')) validateIf(token, context)

	if (matchType(token, 'while')) validateWhile(token, context)
}

function earlyValidate(token: Token, context: SyntaxCheckContext) {
	if (matchType(token, 'call')) {
		for (let paramIndex = 0; paramIndex < token.content.params.length; paramIndex++) {
			if (token.content.params[paramIndex].length == 0) {
				const previousToken =
					token.content.params[paramIndex - 1][token.content.params[paramIndex - 1].length - 1]

				compilerError(
					`Unexpected '${previousToken.content}'`,
					previousToken.lines.start,
					previousToken.lines.end,
					previousToken.columns.start,
					previousToken.columns.end
				)
			}
		}
	}
}

function syntaxCheckRecursive(token: Token, context: SyntaxCheckContext): Token {
	earlyValidate(token, context)

	if (matchType(token, 'assignment')) {
		token.content.content = syntaxCheckRecursive(token.content.content, {
			location: token.type,
			reference: context.reference,
		})
	}

	if (matchType(token, 'definition')) {
		token.content.value = syntaxCheckRecursive(token.content.value, {
			location: token.type,
			reference: context.reference,
		})

		if (matchToken(token.content.word, 'descriptor', 'function')) {
			const blockContent = token.content.value.content.content

			for (let i = 0; i < blockContent.length; i++) {
				token.content.value.content.content[i] = syntaxCheckRecursive(blockContent[i], {
					location: 'function',
					reference: context.reference,
				})
			}
		}
	}

	if (matchType(token, 'return')) {
		token.content = syntaxCheckRecursive(token.content, {
			location: token.type,
			reference: context.reference,
		})
	}

	if (matchType(token, 'operation')) {
		for (let i = 0; i < token.content.values.length; i++) {
			token.content.values[i] = syntaxCheckRecursive(token.content.values[i], {
				location: token.type,
				reference: context.reference,
			})
		}
	}

	if (matchType(token, 'call')) {
		token.content.name = syntaxCheckRecursive(token.content.name, {
			location: token.type,
			reference: context.reference,
		})

		for (let paramIndex = 0; paramIndex < token.content.params.length; paramIndex++) {
			token.content.params[paramIndex][0] = syntaxCheckRecursive(token.content.params[paramIndex][0], {
				location: token.type,
				reference: context.reference,
			})
		}
	}

	if (matchType(token, 'if')) {
		token.content.content.params[0][0] = syntaxCheckRecursive(token.content.content.params[0][0], {
			location: token.type,
			reference: context.reference,
		})

		const blockContent = token.content.content.content

		for (let i = 0; i < blockContent.length; i++) {
			token.content.content.content[i] = syntaxCheckRecursive(blockContent[i], {
				location: token.type,
				reference: context.reference,
			})
		}
	}

	if (matchType(token, 'while')) {
		token.content.content.params[0][0] = syntaxCheckRecursive(token.content.content.params[0][0], {
			location: token.type,
			reference: context.reference,
		})

		const blockContent = token.content.content.content

		for (let i = 0; i < blockContent.length; i++) {
			token.content.content.content[i] = syntaxCheckRecursive(blockContent[i], {
				location: token.type,
				reference: context.reference,
			})
		}
	}

	validate(token, context)

	return token
}

export function syntaxCheck(tree: Token[], project: boolean) {
	const context: SyntaxCheckContext = {
		location: 'global',
		reference: {
			project,
		},
	}

	for (let i = 0; i < tree.length; i++) {
		tree[i] = syntaxCheckRecursive(tree[i], context)
	}
}
