import { Token, matchType, matchToken, returnsValue, runInContexts } from './token'

export function buildCommands(tokens: Token[]) {
	for (let i = 0; i < tokens.length; i++) {
		if (!matchType(tokens[i], 'command')) continue

		if (
			!matchType(tokens[i + 1], 'string') &&
			['sprite', 'costume', 'import'].includes(tokens[i].content)
		)
			continue

		tokens.splice(i, 2, {
			type: tokens[i].content,
			content: tokens[i + 1],
			lines: {
				start: tokens[i].lines.start,
				end: tokens[i + 1].lines.end,
			},
			columns: {
				start: tokens[i].columns.start,
				end: tokens[i + 1].columns.end,
			},
		})
	}

	return tokens
}

export function buildCompoundNames(tokens: Token[]) {
	for (let i = 1; i < tokens.length; i++) {
		if (!matchToken(tokens[i], 'symbol', '.')) continue

		if (matchType(tokens[i - 1], 'name') && matchType(tokens[i + 1], 'name')) {
			tokens.splice(i - 1, 3, {
				type: 'name',
				content: tokens[i - 1].content + '.' + tokens[i + 1].content,
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	return tokens
}

export function buildBlocks(tokens: Token[]) {
	let foundPoses = []

	for (let i = 0; i < tokens.length; i++) {
		if (matchToken(tokens[i], 'symbol', '{')) {
			foundPoses.push(i)
		} else if (matchToken(tokens[i], 'symbol', '}') && foundPoses.length > 0) {
			let lastOpenPos = foundPoses[foundPoses.length - 1]

			if (!matchToken(tokens[lastOpenPos - 1], 'symbol', ')')) {
				foundPoses.pop()

				continue
			}

			let foundParenthesesPoses = []

			let parenthesisStart = -1
			let parenthesisFailed = true

			for (let j = lastOpenPos - 1; j >= 0; j--) {
				if (matchToken(tokens[j], 'symbol', ')')) {
					foundParenthesesPoses.push(j)
				} else if (matchToken(tokens[j], 'symbol', '(') && foundParenthesesPoses.length > 0) {
					let lastParenthesisClosePos = foundParenthesesPoses[foundParenthesesPoses.length - 1]

					foundParenthesesPoses.pop()

					if (foundParenthesesPoses.length == 0) {
						parenthesisStart = j
						parenthesisFailed = false

						break
					}
				}
			}

			if (parenthesisFailed) {
				foundPoses.pop()

				continue
			}

			const paramsTokens = tokens.slice(parenthesisStart + 1, lastOpenPos - 1)

			const params: (Token[] | Token)[] = []

			let parenthesisDepth = 0

			for (let j = 0; j < paramsTokens.length; j++) {
				if (matchToken(paramsTokens[j], 'symbol', '(')) {
					parenthesisDepth++
				} else if (matchToken(paramsTokens[j], 'symbol', ')') && parenthesisDepth > 0) {
					parenthesisDepth--
				} else if (matchToken(paramsTokens[j], 'symbol', ',') && parenthesisDepth == 0) {
					params.push(paramsTokens.slice(0, j))
					paramsTokens.splice(0, j + 1)

					j = 0
				}
			}

			if (paramsTokens.length > 0) params.push(paramsTokens)

			for (let paramIndex = 0; paramIndex < params.length; paramIndex++) {
				if ((<Token[]>params[paramIndex]).length != 2) continue

				if (!matchType((<Token[]>params[paramIndex])[0], 'type')) continue

				if (!matchType((<Token[]>params[paramIndex])[1], 'name')) continue

				params[paramIndex] = {
					type: 'param definition',
					content: {
						type: (<Token[]>params[paramIndex])[0],
						name: (<Token[]>params[paramIndex])[1],
					},
					lines: {
						start: (<Token[]>params[paramIndex])[0].lines.start,
						end: (<Token[]>params[paramIndex])[1].lines.end,
					},
					columns: {
						start: (<Token[]>params[paramIndex])[0].columns.start,
						end: (<Token[]>params[paramIndex])[1].columns.end,
					},
				}
			}

			const startingPoint = parenthesisStart

			tokens.splice(startingPoint, i - startingPoint + 1, {
				type: 'block',
				content: {
					params,
					content: tokens.slice(lastOpenPos + 1, i),
				},
				lines: {
					start: tokens[startingPoint].lines.start,
					end: tokens[i].lines.end,
				},
				columns: {
					start: tokens[startingPoint].columns.start,
					end: tokens[i].columns.end,
				},
			})

			i = startingPoint

			foundPoses.pop()
		}
	}

	return tokens
}

export function buildCasts(tokens: Token[]) {
	for (let i = 0; i < tokens.length; i++) {
		if (
			matchToken(tokens[i], 'symbol', '(') &&
			matchType(tokens[i + 1], 'type') &&
			matchToken(tokens[i + 2], 'symbol', ')')
		) {
			tokens.splice(i, 3, {
				content: tokens[i + 1].content,
				type: 'cast',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 2].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 2].columns.end,
				},
			})
		}
	}

	return tokens
}

export function buildOperators(tokens: Token[]) {
	for (let i = 0; i < tokens.length; i++) {
		if (matchToken(tokens[i], 'symbol', '&') && matchToken(tokens[i + 1], 'symbol', '&')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '|') && matchToken(tokens[i + 1], 'symbol', '|')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '=') && matchToken(tokens[i + 1], 'symbol', '=')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '!') && matchToken(tokens[i + 1], 'symbol', '=')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '>') && matchToken(tokens[i + 1], 'symbol', '=')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '<') && matchToken(tokens[i + 1], 'symbol', '=')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '+') && matchToken(tokens[i + 1], 'symbol', '=')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '-') && matchToken(tokens[i + 1], 'symbol', '=')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '+') && matchToken(tokens[i + 1], 'symbol', '+')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '-') && matchToken(tokens[i + 1], 'symbol', '-')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '/') && matchToken(tokens[i + 1], 'symbol', '=')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (matchToken(tokens[i], 'symbol', '*') && matchToken(tokens[i + 1], 'symbol', '=')) {
			tokens.splice(i, 2, {
				content: tokens[i].content + tokens[i + 1].content,
				type: 'operator',
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}

		if (
			matchType(tokens[i], 'symbol') &&
			['+', '-', '*', '/', '!', '%', '>', '<'].includes(tokens[i].content)
		) {
			tokens[i].type = 'operator'
		}
	}

	return tokens
}

export function buildParenths(tokens: Token[]) {
	let foundPoses = []

	for (let i = 0; i < tokens.length; i++) {
		if (
			matchToken(tokens[i], 'symbol', '(') &&
			!matchType(tokens[i - 1], 'name') &&
			!matchType(tokens[i - 1], 'verb')
		) {
			foundPoses.push(i)
		} else if (matchToken(tokens[i], 'symbol', ')') && foundPoses.length > 0) {
			let lastOpenPos = foundPoses[foundPoses.length - 1]

			tokens.splice(lastOpenPos, i - lastOpenPos + 1, {
				type: 'group',
				content: tokens.slice(lastOpenPos + 1, i),
				lines: {
					start: tokens[lastOpenPos].lines.start,
					end: tokens[i].lines.end,
				},
				columns: {
					start: tokens[lastOpenPos].columns.start,
					end: tokens[i].columns.end,
				},
			})

			i = lastOpenPos

			foundPoses.pop()
		}
	}

	return tokens
}

export function buildExpressions(tokens: Token[]) {
	for (let i = 0; i < tokens.length - 1; i++) {
		if (!matchType(tokens[i], 'operator')) continue

		if (tokens[i].content !== '-') continue

		if ((i === 0 || !returnsValue(tokens[i - 1])) && returnsValue(tokens[i + 1])) {
			tokens.splice(i, 2, {
				type: 'operation',
				content: {
					operator: {
						content: 'invert',
						type: 'operator',
						lines: tokens[i].lines,
						columns: tokens[i].columns,
					},
					values: [tokens[i + 1]],
				},
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}
	}

	for (let i = 0; i < tokens.length - 1; i++) {
		if (!matchType(tokens[i], 'cast')) continue

		if (returnsValue(tokens[i + 1])) {
			tokens.splice(i, 2, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i + 1]],
				},
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	for (let i = 0; i < tokens.length - 1; i++) {
		if (!matchToken(tokens[i], 'operator', '!')) continue

		if (returnsValue(tokens[i + 1])) {
			tokens.splice(i, 2, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i + 1]],
				},
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}
	}

	for (let i = 1; i < tokens.length - 1; i++) {
		if (!matchToken(tokens[i], 'operator', '%')) continue

		if (returnsValue(tokens[i - 1]) && returnsValue(tokens[i + 1])) {
			tokens.splice(i - 1, 3, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i - 1], tokens[i + 1]],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	for (let i = 1; i < tokens.length - 1; i++) {
		if (!(matchType(tokens[i], 'operator') && ['*', '/'].includes(tokens[i].content))) continue

		if (returnsValue(tokens[i - 1]) && returnsValue(tokens[i + 1])) {
			tokens.splice(i - 1, 3, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i - 1], tokens[i + 1]],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	for (let i = 1; i < tokens.length - 1; i++) {
		if (!(matchType(tokens[i], 'operator') && ['+', '-'].includes(tokens[i].content))) continue

		if (returnsValue(tokens[i - 1]) && returnsValue(tokens[i + 1])) {
			tokens.splice(i - 1, 3, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i - 1], tokens[i + 1]],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	for (let i = 1; i < tokens.length - 1; i++) {
		if (!(matchType(tokens[i], 'operator') && ['>', '<', '>=', '<='].includes(tokens[i].content)))
			continue

		if (returnsValue(tokens[i - 1]) && returnsValue(tokens[i + 1])) {
			tokens.splice(i - 1, 3, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i - 1], tokens[i + 1]],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	for (let i = 1; i < tokens.length - 1; i++) {
		if (!(matchType(tokens[i], 'operator') && ['==', '!='].includes(tokens[i].content))) continue

		if (returnsValue(tokens[i - 1]) && returnsValue(tokens[i + 1])) {
			tokens.splice(i - 1, 3, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i - 1], tokens[i + 1]],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	for (let i = 1; i < tokens.length - 1; i++) {
		if (!matchToken(tokens[i], 'operator', '&&')) continue

		if (returnsValue(tokens[i - 1]) && returnsValue(tokens[i + 1])) {
			tokens.splice(i - 1, 3, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i - 1], tokens[i + 1]],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	for (let i = 1; i < tokens.length - 1; i++) {
		if (!matchToken(tokens[i], 'operator', '||')) continue

		if (returnsValue(tokens[i - 1]) && returnsValue(tokens[i + 1])) {
			tokens.splice(i - 1, 3, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i - 1], tokens[i + 1]],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	for (let i = 1; i < tokens.length - 1; i++) {
		if (
			!(
				matchType(tokens[i], 'operator') &&
				['++', '--', '+=', '-=', '/=', '*='].includes(tokens[i].content)
			)
		)
			continue

		if (returnsValue(tokens[i - 1]) && returnsValue(tokens[i + 1])) {
			tokens.splice(i - 1, 3, {
				type: 'operation',
				content: {
					operator: tokens[i],
					values: [tokens[i - 1], tokens[i + 1]],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})

			i--
		}
	}

	return tokens
}

export function buildCalls(tokens: Token[]) {
	let foundPoses = []

	let lastSegmentEnd = []

	let segments: Token[][][] = []

	for (let i = 0; i < tokens.length; i++) {
		if (matchToken(tokens[i], 'symbol', '(') && matchType(tokens[i - 1], 'name')) {
			foundPoses.push(i)

			segments.push([])

			lastSegmentEnd.push(i)
		}

		if (matchToken(tokens[i], 'symbol', ',') && foundPoses.length > 0) {
			segments[segments.length - 1].push(
				tokens.slice(lastSegmentEnd[lastSegmentEnd.length - 1] + 1, i + 1)
			)

			lastSegmentEnd[lastSegmentEnd.length - 1] = i
		}

		if (matchToken(tokens[i], 'symbol', ')') && foundPoses.length > 0) {
			let lastOpenPos = foundPoses[foundPoses.length - 1]
			let thisSegments = segments[segments.length - 1]

			if (
				!(
					lastSegmentEnd[lastSegmentEnd.length - 1] == i - 1 &&
					matchToken(tokens[lastSegmentEnd[lastSegmentEnd.length - 1]], 'symbol', '(')
				)
			)
				thisSegments.push(tokens.slice(lastSegmentEnd[lastSegmentEnd.length - 1] + 1, i))

			tokens.splice(lastOpenPos - 1, i - lastOpenPos + 2, {
				type: 'call',
				content: {
					name: tokens[lastOpenPos - 1],
					params: thisSegments,
				},
				lines: {
					start: tokens[lastOpenPos - 1].lines.start,
					end: tokens[i].lines.end,
				},
				columns: {
					start: tokens[lastOpenPos - 1].columns.start,
					end: tokens[i].columns.end,
				},
			})

			i = lastOpenPos

			foundPoses.pop()
			segments.pop()
			lastSegmentEnd.pop()
		}
	}

	return tokens
}

export function buildAssignments(tokens: Token[]) {
	for (let i = 0; i < tokens.length; i++) {
		if (
			matchToken(tokens[i], 'symbol', '=') &&
			matchType(tokens[i - 1], 'name') &&
			returnsValue(tokens[i + 1])
		) {
			tokens.splice(i - 1, 3, {
				type: 'assignment',
				content: {
					name: tokens[i - 1],
					content: tokens[i + 1],
				},
				lines: {
					start: tokens[i - 1].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i - 1].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}
	}

	return tokens
}

export function buildReturns(tokens: Token[], context: string) {
	for (let i = 0; i < tokens.length; i++) {
		if (matchToken(tokens[i], 'verb', 'return') && returnsValue(tokens[i + 1])) {
			tokens.splice(i, 2, {
				type: 'return',
				content: tokens[i + 1],
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}
	}

	return tokens
}

export function buildDefinitions(tokens: Token[], context: string) {
	for (let i = 0; i < tokens.length; i++) {
		if (
			matchType(tokens[i], 'tag') &&
			matchType(tokens[i + 1], 'type') &&
			matchType(tokens[i + 2], 'name') &&
			matchToken(tokens[i + 3], 'symbol', '=') &&
			returnsValue(tokens[i + 4])
		) {
			tokens.splice(i, 5, {
				type: 'definition',
				content: {
					word: tokens[i],
					type: tokens[i + 1],
					name: tokens[i + 2],
					value: tokens[i + 4],
				},
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 4].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 4].columns.end,
				},
			})
		}
	}

	for (let i = 0; i < tokens.length; i++) {
		if (
			matchToken(tokens[i], 'descriptor', 'function') &&
			matchType(tokens[i + 1], 'type') &&
			matchType(tokens[i + 2], 'name') &&
			matchType(tokens[i + 3], 'block')
		) {
			tokens.splice(i, 4, {
				type: 'definition',
				content: {
					word: tokens[i],
					type: tokens[i + 1],
					name: tokens[i + 2],
					value: runInContexts(buildDefinitions, tokens[i + 3]),
				},
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 3].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 3].columns.end,
				},
			})
		}
	}

	return tokens
}

export function buildControls(tokens: Token[], context: string) {
	for (let i = 0; i < tokens.length; i++) {
		if (matchToken(tokens[i], 'verb', 'if') && matchType(tokens[i + 1], 'block')) {
			tokens.splice(i, 2, {
				type: 'if',
				content: runInContexts(buildControls, tokens[i + 1]),
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		} else if (matchToken(tokens[i], 'verb', 'while') && matchType(tokens[i + 1], 'block')) {
			tokens.splice(i, 2, {
				type: 'while',
				content: runInContexts(buildControls, tokens[i + 1]),
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		} else if (matchToken(tokens[i], 'verb', 'for') && matchType(tokens[i + 1], 'block')) {
			tokens.splice(i, 2, {
				type: 'for',
				content: runInContexts(buildControls, tokens[i + 1]),
				lines: {
					start: tokens[i].lines.start,
					end: tokens[i + 1].lines.end,
				},
				columns: {
					start: tokens[i].columns.start,
					end: tokens[i + 1].columns.end,
				},
			})
		}
	}

	return tokens
}

export function buildTree(tokens: Token[]) {
	tokens = buildCommands(tokens)

	tokens = buildCompoundNames(tokens)

	tokens = buildBlocks(tokens)

	tokens = <Token[]>runInContexts(buildCasts, tokens)

	tokens = <Token[]>runInContexts(buildParenths, tokens)

	tokens = <Token[]>runInContexts(buildOperators, tokens)

	tokens = <Token[]>runInContexts(buildCalls, tokens)

	tokens = <Token[]>runInContexts(buildExpressions, tokens)

	tokens = <Token[]>runInContexts(buildDefinitions, tokens)

	tokens = <Token[]>runInContexts(buildControls, tokens)

	tokens = <Token[]>runInContexts(buildAssignments, tokens)

	tokens = <Token[]>runInContexts(buildReturns, tokens)

	return tokens
}
