import { Block, Reference, Stack, FloorBlock } from './scratch'
import { Token } from './token'

export class CompilerType {
    signature(): string {
        throw new Error('Not Implemented!')
    }

    fromSignature(signature: string): CompilerType {
        throw new Error('Not Implemented!')
    }
    
    canCastFrom(type: CompilerType): boolean {
        throw new Error('Not Implemented!')
    }
    
    castFrom(value: string | Block | Reference, type: CompilerType, stack: Stack): string | Block | Reference  {
        throw new Error('Not Implemented!')
    }
}

export class VOID extends CompilerType {
    signature = () => 'void'
    fromSignature = () => new VOID()
        
    canCastFrom(type: CompilerType){
        return false
    }

    castFrom(value: string | Block | Reference, type: CompilerType, stack: Stack): string | Block | Reference {
        throw new Error('Tried to castFrom to void!')
    }
}

export class INT extends CompilerType {
    signature = () => 'int'
    fromSignature = () => new INT()
        
    canCastFrom(type: CompilerType){
        if(type instanceof INT) return true
        
        if(type instanceof FLOAT) return true
        if(type instanceof STRING) return true
        
        return false
    }
    
    castFrom(value: string | Block | Reference, type: CompilerType, stack: Stack): string | Block | Reference {
        if(type instanceof FLOAT) return new FloorBlock(value)
        
        return value
    }
}

export class FLOAT extends CompilerType {
    signature = () => 'float'
    fromSignature = () => new FLOAT()
        
    canCastFrom(type: CompilerType){
        if(type instanceof FLOAT) return true
        
        if(type instanceof INT) return true
        if(type instanceof STRING) return true
        
        return false
    }

    castFrom(value: string | Block | Reference, type: CompilerType, stack: Stack): string | Block | Reference {
        return value
    }
}

export class BOOL extends CompilerType {
    signature = () =>  'bool'
    fromSignature = () => new BOOL()
        
    canCastFrom(type: CompilerType){
        if(type instanceof BOOL) return true
        
        if(type instanceof STRING) return true
        
        return false
    }

    castFrom(value: string | Block | Reference, type: CompilerType, stack: Stack): string | Block | Reference {
        return value
    }
}

export class STRING extends CompilerType {
    signature = () => 'string'
    fromSignature = () => new STRING()
        
    canCastFrom(type: CompilerType){
        if(type instanceof STRING) return true
        
        if(type instanceof BOOL) return true
        if(type instanceof INT) return true
        if(type instanceof FLOAT) return true
        
        return false
    }

    castFrom(value: string | Block | Reference, type: CompilerType, stack: Stack): string | Block | Reference {
        return value
    }
}

export class FUNCTION extends CompilerType {
    returnType: CompilerType = new VOID()
    paramTypes: CompilerType[] = []
    
    constructor(returnType: CompilerType, paramTypes: CompilerType[]) {
        super()

        this.returnType = returnType
        this.paramTypes = paramTypes
    }
        
    signature() {
        let value = 'function<'

        value += this.returnType.signature()

        for(let paramTypeIndex = 0; paramTypeIndex < this.paramTypes.length; paramTypeIndex++){
            value += ', ' + this.paramTypes[paramTypeIndex].signature()
        }
        
        value += '>'

        return value
    }

    fromSignature(signature: string) {
        let readTypes: CompilerType[] = []

        let typeStart = 'function<'.length
        let contextsIn = 1

        for(let characterIndex = 'function<'.length; characterIndex < signature.length; characterIndex++){
            if(signature[characterIndex] == '<') contextsIn++

            if(signature[characterIndex] == '>') contextsIn--

            if(signature.substring(characterIndex, characterIndex + 2) != ', ' && signature[characterIndex] != '>') continue

            if(contextsIn > 1) continue
            
            readTypes.push(getCompilerType(signature.substring(typeStart, characterIndex)))
            
            typeStart = characterIndex + 2
        }

        return new FUNCTION(readTypes[0], readTypes.slice(1))
    }

    canCastFrom(type: CompilerType){
        return false
    }

    castFrom(value: string | Block | Reference, type: CompilerType, stack: Stack): string | Block | Reference {
        throw new Error('Tried to castFrom to function!')
    }
}

export function getCompilerType(signature: string): CompilerType {
    if(signature.startsWith('int')) return new INT().fromSignature()
    if(signature.startsWith('float')) return new FLOAT().fromSignature()
    if(signature.startsWith('bool')) return new BOOL().fromSignature()
    if(signature.startsWith('string')) return new STRING().fromSignature()
    if(signature.startsWith('function')) return new FUNCTION(new VOID(), []).fromSignature(signature)

    return new VOID()
}