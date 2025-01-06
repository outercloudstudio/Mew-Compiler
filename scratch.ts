import { randomUUID } from 'crypto'

export class Block {
    id: string
    parent: Block | null = null
    next: Block | null = null

    constructor(id?: string) {
        this.id = id || randomUUID()
    }

    convert() : any {
        throw new Error('Convert has not been implemented yet!')
    }
}

export class Reference {
    name: string

    constructor(name: string) {
        this.name = name
    }
}

export class Stack {
    blocks: Block[] = []

    add<BlockType extends Block>(block: BlockType): BlockType {
        if(this.blocks.length > 0) {
            this.blocks[this.blocks.length - 1].next = block
            block.parent = this.blocks[this.blocks.length - 1]
        }

        this.blocks.push(block)

        return block
    }

    join(stack: Stack): Stack {
        if(stack.blocks.length == 0) return stack

        if(this.blocks.length > 0) {
            this.blocks[this.blocks.length - 1].next = stack.blocks[0]
            stack.blocks[0].parent = this.blocks[this.blocks.length - 1]
        }

        this.blocks = this.blocks.concat(stack.blocks)

        return stack
    }

    convert() : any {
        let convertedBlocks: object = {}

        for(const block of this.blocks) {
            convertedBlocks = {
                ...convertedBlocks,
                ...(block.convert())
            }
        }

        return convertedBlocks
    }
}

function handleInputConvert(value: string | number | Block | Reference | Stack, target: { [key:string]: any }, parent: Block) : object {
    if(value instanceof Block) {
        value.parent = parent

        target = {
            ...target,
            ...(value.convert())
        }
    }

    if(value instanceof Stack) {
        if(value.blocks.length > 0) value.blocks[0].parent = parent

        target = {
            ...target,
            ...(value.convert())
        }
    }

    return target
}

function convertInput(value: string | number | Block | Reference | Stack, type?: number | null) {
    if(value instanceof Block) {
        return [
            3,
            value.id,
            [
                type,
                'unset'
            ]
        ]
    }

    if(value instanceof Reference) {
        return [
            3,
            [
                12,
                value.name,
                value.name
            ],
            [
                type,
                'unset'
            ]
        ]
    }

    if(value instanceof Stack) {
        return [
            2,
            value.blocks.length > 0 ? value.blocks[0].id : null
        ]
    }

    return [
        1,
        [
            type,
            value
        ]
    ]
}

export class DefinitionBlock extends Block {
    name: string

    constructor(name: string, id?: string) {
        super(id)

        this.name = name
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target[this.id] = {
            opcode: 'procedures_definition',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                custom_block: [
                    1,
                    'prototype-' + this.id
                ]
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        target['prototype-' + this.id] = {
            opcode: 'procedures_prototype',
            next: null,
            parent: this.id,
            inputs: {},
            fields: {},
            shadow: true,
            topLevel: this.parent == null,
            mutation: {
                tagName: 'mutation',
                children: [],
                proccode: this.name,
                argumentids: '[]',
                argumentnames: '[]',
                argumentdefaults: '[]',
                warp: 'false'
            }
        }

        return target
    }
}

export class SetVariableBlock extends Block {
    variableName: string
    value: string | Block | Reference

    constructor(variableName: string, value: string | Block | Reference, id?: string) {
        super(id)

        this.variableName = variableName
        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'data_setvariableto',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                VALUE: convertInput(this.value, 10)
            },
            fields: {
                VARIABLE: [
                    this.variableName,
                    this.variableName
                ]
            },
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class AddToListBlock extends Block {
    listName: string
    value: string | Block | Reference

    constructor(listName: string, value: string | Block | Reference, id?: string) {
        super(id)

        this.listName = listName
        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'data_addtolist',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                ITEM: convertInput(this.value, 10)
            },
            fields: {
                LIST: [
                    this.listName,
                    this.listName
                ]
            },
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class RemoveFromListBlock extends Block {
    listName: string
    index: string | Block | Reference

    constructor(listName: string, index: string | Block | Reference, id?: string) {
        super(id)

        this.listName = listName
        this.index = index
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.index, target, this)

        target[this.id] = {
            opcode: 'data_deleteoflist',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                INDEX: convertInput(this.index, 7)
            },
            fields: {
                LIST: [
                    this.listName,
                    this.listName
                ]
            },
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class LengthOfListBlock extends Block {
    listName: string

    constructor(listName: string, id?: string) {
        super(id)

        this.listName = listName
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target[this.id] = {
            opcode: 'data_lengthoflist',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {},
            fields: {
                LIST: [
                    this.listName,
                    this.listName
                ]
            },
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class ItemOfListBlock extends Block {
    listName: string
    index: Block | string | Reference

    constructor(listName: string, index: Block | string | Reference, id?: string) {
        super(id)

        this.listName = listName
        this.index = index
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.index, target, this)

        target[this.id] = {
            opcode: 'data_itemoflist',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                INDEX: convertInput(this.index, 7)
            },
            fields: {
                LIST: [
                    this.listName,
                    this.listName
                ]
            },
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class AddBlock extends Block {
    value1: string | number | Block | Reference
    value2: string | number | Block | Reference

    constructor(value1: string | number | Block | Reference, value2: string | number | Block | Reference, id?: string) {
        super(id)

        this.value1 = value1
        this.value2 = value2
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_add',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                NUM1: convertInput(this.value1, 7),
                NUM2: convertInput(this.value2, 7)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class SubtractBlock extends Block {
    value1: string | number | Block | Reference
    value2: string | number | Block | Reference

    constructor(value1: string | number | Block | Reference, value2: string | number | Block | Reference, id?: string) {
        super(id)

        this.value1 = value1
        this.value2 = value2
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_subtract',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                NUM1: convertInput(this.value1, 7),
                NUM2: convertInput(this.value2, 7)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class MultiplyBlock extends Block {
    value1: string | Block | Reference
    value2: string | Block | Reference

    constructor(value1: string | Block | Reference, value2: string | Block | Reference, id?: string) {
        super(id)

        this.value1 = value1
        this.value2 = value2
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_multiply',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                NUM1: convertInput(this.value1, 7),
                NUM2: convertInput(this.value2, 7)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class DivideBlock extends Block {
    value1: string | Block | Reference
    value2: string | Block | Reference

    constructor(value1: string | Block | Reference, value2: string | Block | Reference, id?: string) {
        super(id)

        this.value1 = value1
        this.value2 = value2
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_divide',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                NUM1: convertInput(this.value1, 7),
                NUM2: convertInput(this.value2, 7)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class FloorBlock extends Block {
    value: string | Block | Reference

    constructor(value: string | Block | Reference, id?: string) {
        super(id)

        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'operator_mathop',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                NUM: convertInput(this.value, 7),
            },
            fields: {
                OPERATOR: [
                    'floor',
                    null
                ]
            },
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class LessThanBlock extends Block {
    value1: string | Block | Reference
    value2: string | Block | Reference

    constructor(value1: string | Block | Reference, value2: string | Block | Reference, id?: string) {
        super(id)

        this.value1 = value1
        this.value2 = value2
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_lt',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                OPERAND1: convertInput(this.value1, 10),
                OPERAND2: convertInput(this.value2, 10)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class GreaterThanBlock extends Block {
    value1: string | Block | Reference
    value2: string | Block | Reference

    constructor(value1: string | Block | Reference, value2: string | Block | Reference, id?: string) {
        super(id)

        this.value1 = value1
        this.value2 = value2
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_gt',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                OPERAND1: convertInput(this.value1, 10),
                OPERAND2: convertInput(this.value2, 10)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class EqualsBlock extends Block {
    value1: string | Block | Reference
    value2: string | Block | Reference

    constructor(value1: string | Block | Reference, value2: string | Block | Reference, id?: string) {
        super(id)

        this.value1 = value1
        this.value2 = value2
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_equals',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                OPERAND1: convertInput(this.value1, 10),
                OPERAND2: convertInput(this.value2, 10)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class ModuloBlock extends Block {
    value1: string | Block | Reference
    value2: string | Block | Reference

    constructor(value1: string | Block | Reference, value2: string | Block | Reference, id?: string) {
        super(id)

        this.value1 = value1
        this.value2 = value2
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_mod',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                NUM1: convertInput(this.value1, 7),
                NUM2: convertInput(this.value2, 7)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class ReplaceInListBlock extends Block {
    listName: string
    index: string | Block | Reference
    value: string | Block | Reference

    constructor(listName: string, index: string | Block | Reference, value: string | Block | Reference, id?: string) {
        super(id)

        this.listName = listName
        this.index = index
        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.index, target, this)
        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'data_replaceitemoflist',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                INDEX: convertInput(this.index, 7),
                ITEM: convertInput(this.value, 10)
            },
            fields: {
                LIST: [
                    this.listName,
                    this.listName
                ]
            },
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class RepeatUntilBlock extends Block {
    stack: Stack = new Stack()
    condition: string | Block | Reference

    constructor(condition: string | Block | Reference, id?: string) {
        super(id)

        this.condition = condition
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.condition, target, this)
        target = handleInputConvert(this.stack, target, this)

        target[this.id] = {
            opcode: 'control_repeat_until',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                CONDITION: convertInput(this.condition, 10),
                SUBSTACK: convertInput(this.stack)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class ForeverBlock extends Block {
    stack: Stack = new Stack()

    constructor(id?: string) {
        super(id)
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.stack, target, this)

        target[this.id] = {
            opcode: 'control_forever',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                SUBSTACK: convertInput(this.stack)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class IfBlock extends Block {
    stack: Stack = new Stack()
    condition: string | Block | Reference

    constructor(condition: string | Block | Reference, id?: string) {
        super(id)

        this.condition = condition
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.condition, target, this)
        target = handleInputConvert(this.stack, target, this)

        target[this.id] = {
            opcode: 'control_if',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                CONDITION: convertInput(this.condition, 10),
                SUBSTACK: convertInput(this.stack)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class CallBlock extends Block {
    name: string

    constructor(name: string, id?: string) {
        super(id)

        this.name = name
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target[this.id] = {
            opcode: 'procedures_call',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: this.parent == null,
            mutation: {
                tagName: 'mutation',
                children: [],
                proccode: this.name,
                argumentids: '[]',
                warp: 'true'
            }
        }

        return target
    }
}

export class StopThisBlock extends Block {
    constructor(id?: string) {
        super(id)
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target[this.id] = {
            opcode: 'control_stop',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {},
            fields: {
                STOP_OPTION: [ 'this script', null ]
            },
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class ChangeXBlock extends Block {
    value: string | Block | Reference

    constructor(value: string | Block | Reference, id?: string) {
        super(id)

        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'motion_changexby',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                DX: convertInput(this.value, 4)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class ChangeYBlock extends Block {
    value: string | Block | Reference

    constructor(value: string | Block | Reference, id?: string) {
        super(id)

        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'motion_changeyby',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                DY: convertInput(this.value, 4)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class GoToBlock extends Block {
    x: string | Block | Reference
    y: string | Block | Reference

    constructor(x: string | Block | Reference, y: string | Block | Reference, id?: string) {
        super(id)

        this.x = x
        this.y = y
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.x, target, this)
        target = handleInputConvert(this.y, target, this)

        target[this.id] = {
            opcode: 'motion_gotoxy',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                X: convertInput(this.x, 4),
                Y: convertInput(this.y, 4)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class KeyPressedBlock extends Block {
    value: string | Block | Reference

    constructor(value: string | Block | Reference, id?: string) {
        super(id)

        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'sensing_keypressed',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                KEY_OPTION: convertInput(this.value, 4)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class TouchingBlock extends Block {
    value: string | Block | Reference

    constructor(value: string | Block | Reference, id?: string) {
        super(id)

        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'sensing_touchingobject',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                TOUCHINGOBJECTMENU: convertInput(this.value, 4)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class FlagBlock extends Block {
    constructor(id?: string) {
        super(id)
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target[this.id] = {
            opcode: 'event_whenflagclicked',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class WaitBlock extends Block {
    value: string | Block | Reference

    constructor(value: string | Block | Reference, id?: string) {
        super(id)

        this.value = value
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'control_wait',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                DURATION: convertInput(this.value, 4)
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class XPositionBlock extends Block {
    constructor(id?: string) {
        super(id)
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target[this.id] = {
            opcode: 'motion_xposition',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class YPositionBlock extends Block {
    constructor(id?: string) {
        super(id)
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target[this.id] = {
            opcode: 'motion_yposition',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {},
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class OrBlock extends Block {
    value1: Stack = new Stack()
    value2: Stack = new Stack()

    constructor(value1: Block, value2: Block, id?: string) {
        super(id)

        this.value1.add(value1)
        this.value2.add(value2)
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_or',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                OPERAND1: convertInput(this.value1),
                OPERAND2: convertInput(this.value2),
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class AndBlock extends Block {
    value1: Stack = new Stack()
    value2: Stack = new Stack()

    constructor(value1: Block, value2: Block, id?: string) {
        super(id)

        this.value1.add(value1)
        this.value2.add(value2)
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value1, target, this)
        target = handleInputConvert(this.value2, target, this)

        target[this.id] = {
            opcode: 'operator_and',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                OPERAND1: convertInput(this.value1),
                OPERAND2: convertInput(this.value2),
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}

export class NotBlock extends Block {
    value: Stack = new Stack()

    constructor(value: Block, id?: string) {
        super(id)

        this.value.add(value)
    }

    convert(): object {
        let target: { [key:string]: any } = { }

        target = handleInputConvert(this.value, target, this)

        target[this.id] = {
            opcode: 'operator_and',
            next: this.next ? this.next.id : null,
            parent:  this.parent ? this.parent.id : null,
            inputs: {
                OPERAND: convertInput(this.value),
            },
            fields: {},
            shadow: false,
            topLevel: this.parent == null
        }

        return target
    }
}