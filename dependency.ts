import { Token, TokenType } from './token'

export function scanForDependencies(tree: Token[]): string[] {
    const dependencies: string[] = []
    
    for(const token of tree) {
        if(token.tokenType === TokenType.Sprite) {
            dependencies.push(token.content.content)
        }

        if(token.tokenType === TokenType.Use) {
            dependencies.push(token.content.content)
        }
    }

    return dependencies
}

export function resolveCompilationOrder(sources: { [key: string]: string[] }): string[] {
    const order: string[] = []
    const reversedGraph: { [key: string]: string[] } = {}

    for(const source of Object.keys(sources)) {
        if(!reversedGraph[source]) reversedGraph[source] = []
        
        for(const dependency of sources[source]) {
            if(reversedGraph[dependency]) {
                reversedGraph[dependency].push(source)
            } else {
                reversedGraph[dependency] = [ source ]
            }
        }
    }

    while(Object.keys(reversedGraph).length > 0) {
        const sources = Object.keys(reversedGraph)

        const target = sources.find(source => reversedGraph[source].length === 0)

        if(target === undefined) throw 'Cyclical dependency graph???!'

        order.unshift(target)

        delete reversedGraph[target]

        for(const source of Object.keys(reversedGraph)) {
            if(!reversedGraph[source].includes(target)) continue

            reversedGraph[source].splice(reversedGraph[source].indexOf(target), 1)
        }
    }
    
    return order
}