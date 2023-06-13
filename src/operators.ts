import { Block as LegacyBlock, BlockTypes, Input } from './block'
import { Token } from './token'
import { getCompilerType, CompilerType, INT, FLOAT, STRING, VOID, BOOL } from './types'
import { Block, Stack, DefinitionBlock, SetVariableBlock, AddToListBlock, RemoveFromListBlock, LengthOfListBlock, ItemOfListBlock, AddBlock, SubtractBlock, Reference, LessThanBlock, MultiplyBlock } from './scratch'

export type OperationResult = {
    blocks: LegacyBlock[]
    inputBlocks: LegacyBlock[]
    root: any
}

export type Operator = {
    symbol: string,
    mono: boolean,
    canOperate(aType: CompilerType, bType: CompilerType) : boolean,
    returns(aType: CompilerType, bType: CompilerType) : CompilerType
    operate(aValue: Block | string | Reference, aType: CompilerType, bValue: Block | string | Reference, bType: CompilerType, stack: Stack): string | Block | Reference
}

export const ADD: Operator = {
    symbol: '+',
    mono: false,
    canOperate(aType: CompilerType, bType: CompilerType){
        if(aType.signature() == new INT().signature()) return aType.canCastFrom(bType)
        
        if(aType.signature() == new FLOAT().signature()) return aType.canCastFrom(bType)
        
        if(aType.signature() == new STRING().signature()) return aType.canCastFrom(bType)
        
        return false
    },
    returns(aType: CompilerType, bType: CompilerType){
        if(aType.signature() == new INT().signature()) return new INT()
        
        if(aType.signature() == new FLOAT().signature()) return new FLOAT()
        
        if(aType.signature() == new STRING().signature()) return new STRING()

        return new VOID()
    },
    operate(aValue: Block | string | Reference, aType: CompilerType, bValue: Block | string | Reference, bType: CompilerType, stack: Stack) {
        stack.add(new AddToListBlock('Operation Stack', aValue))
        stack.add(new AddToListBlock('Operation Stack', aType.castFrom(bValue, bType, stack)))
        
        stack.add(new SetVariableBlock(
            'Transfer Buffer',
            new AddBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(
                        new LengthOfListBlock('Operation Stack'),
                        '1'
                    )
                ),
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            ))
        )

        stack.add(new RemoveFromListBlock('Operation Stack', 'last'))
        stack.add(new RemoveFromListBlock('Operation Stack', 'last'))
        
        return new Reference('Transfer Buffer')
    }
}

export const SUBTRACT: Operator = {
    symbol: '-',
    mono: false,
    canOperate(aType: CompilerType, bType: CompilerType){
        if(aType.signature() == new INT().signature()) return aType.canCastFrom(bType)
        
        if(aType.signature() == new FLOAT().signature()) return aType.canCastFrom(bType)
        
        return false
    },
    returns(aType: CompilerType, bType: CompilerType){
        if(aType.signature() == new INT().signature()) return new INT()
        
        if(aType.signature() == new FLOAT().signature()) return new FLOAT()

        return new VOID()
    },
    operate(aValue: Block | string | Reference, aType: CompilerType, bValue: Block | string | Reference, bType: CompilerType, stack: Stack) {
        stack.add(new AddToListBlock('Operation Stack', aValue))
        stack.add(new AddToListBlock('Operation Stack', aType.castFrom(bValue, bType, stack)))
        
        stack.add(new SetVariableBlock(
            'Transfer Buffer',
            new SubtractBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(
                        new LengthOfListBlock('Operation Stack'),
                        '1'
                    )
                ),
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            ))
        )

        stack.add(new RemoveFromListBlock('Operation Stack', 'last'))
        stack.add(new RemoveFromListBlock('Operation Stack', 'last'))
        
        return new Reference('Transfer Buffer')
    }
}


export const LESS_THAN: Operator = {
    symbol: '<',
    mono: false,
    canOperate(aType: CompilerType, bType: CompilerType){
        if(aType.signature() == new INT().signature()) return aType.canCastFrom(bType)
        
        if(aType.signature() == new FLOAT().signature()) return aType.canCastFrom(bType)
        
        return false
    },
    returns(aType: CompilerType, bType: CompilerType){
        return new BOOL()
    },
    operate(aValue: Block | string | Reference, aType: CompilerType, bValue: Block | string | Reference, bType: CompilerType, stack: Stack) {
        stack.add(new AddToListBlock('Operation Stack', aValue))
        stack.add(new AddToListBlock('Operation Stack', aType.castFrom(bValue, bType, stack)))
        
       stack.add(new SetVariableBlock(
            'Transfer Buffer',
            new LessThanBlock(
                new ItemOfListBlock(
                    'Operation Stack',
                    new SubtractBlock(
                        new LengthOfListBlock('Operation Stack'),
                        '1'
                    )
                ),
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            ))
        )

        stack.add(new RemoveFromListBlock('Operation Stack', 'last'))
        stack.add(new RemoveFromListBlock('Operation Stack', 'last'))
        
        return new Reference('Transfer Buffer')
    }
}

export const INVERT: Operator = {
    symbol: 'invert',
    mono: true,
    canOperate(aType: CompilerType, bType: CompilerType){
        if(aType.signature() == new INT().signature()) return true
        
        if(aType.signature() == new FLOAT().signature()) return true
        
        return false
    },
    returns(aType: CompilerType, bType: CompilerType){
        if(aType.signature() == new INT().signature()) return new INT()
        
        if(aType.signature() == new FLOAT().signature()) return new FLOAT()

        return new VOID()
    },
    operate(aValue: Block | string | Reference, aType: CompilerType, bValue: Block | string | Reference, bType: CompilerType, stack: Stack) {
        stack.add(new AddToListBlock('Operation Stack', aValue))
        
        stack.add(new SetVariableBlock(
            'Transfer Buffer',
            new MultiplyBlock(
                '-1',
                new ItemOfListBlock(
                    'Operation Stack',
                    new LengthOfListBlock('Operation Stack')
                )
            ))
        )

        stack.add(new RemoveFromListBlock('Operation Stack', 'last'))
        
        return new Reference('Transfer Buffer')
    }
}


export function getOperator(symbol: string) {
    switch(symbol) {
        case '+':
            return ADD
        case '-':
            return SUBTRACT
        case '<': 
            return LESS_THAN
        case 'invert': 
            return INVERT
        default:
            throw new Error('Unkown operator ' + symbol)
    }
}