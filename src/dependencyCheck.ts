import { type } from 'os'
import { Token, matchType } from './token'
import path from 'path'

export type DependencyCheckResult = {
	dependencies: string[]
	sprites: string[]
	costumes: string[]
}

export function dependencyCheck(tree: Token[], filePath: string): DependencyCheckResult {
	const directoryPath = path.dirname(filePath)

	let dependencies: string[] = []
	let sprites: string[] = []
	let costumes: string[] = []

	for (let i = 0; i < tree.length; i++) {
		if (matchType(tree[i], 'import')) {
			dependencies.push(path.join(directoryPath, tree[i].content.content + '.mao'))
		}

		if (matchType(tree[i], 'sprite')) {
			sprites.push(path.join(directoryPath, tree[i].content.content + '.mao'))
			dependencies.push(path.join(directoryPath, tree[i].content.content + '.mao'))
		}

		if (matchType(tree[i], 'costume')) {
			costumes.push(path.join(directoryPath, tree[i].content.content))
		}
	}

	return {
		dependencies,
		sprites,
		costumes,
	}
}
