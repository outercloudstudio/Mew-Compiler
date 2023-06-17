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
			const name = tree[i].content.content
			const dependencyPath = path.join(directoryPath, name + '.mao')

			dependencies.push(dependencyPath)
		}

		if (matchType(tree[i], 'sprite')) {
			sprites.push(tree[i].content.content)
		}

		if (matchType(tree[i], 'costume')) {
			costumes.push(tree[i].content.content)
		}
	}

	return {
		dependencies,
		sprites,
		costumes,
	}
}
