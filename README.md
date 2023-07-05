# Compiler Stages

## Stage 1

Checks for valid context placement of tokens

Finds dependencies like imports and sprites and costumes

## Stage 3

Proper type

## Order

Stage 1 and Stage 2 will run together
After all files have run stage 1 and 2, stage 3 is run from the bottom of the dependency tree up

# TODO

- ~Add negative number support~
- Change assignments to use value
- Contexts include a path not a location
- compute checks for import exists

## Sets

string type: 'int', 'float', 'bool', 'string'
verb: 'if', 'while', 'for'
tag: 'var', 'const'
descriptor string: 'function'
returns value: operation, name, value

## Statement

type: 'statement'
content:
word: verb, tag, descriptor string
type?: string type
content: assignment

## Assignment

type: 'assignment'
content:
name: name
content: returns value

## Operator

type: 'symbol'
content: '+', '-', '\*', '/'...

## Cast

type: 'cast'
content: type

## Type

type: 'type'
content: string type

## Operation

type: 'operation'
content:
operator: operator | cast
values: returns value[]

## Value

type: string type
content: string

## Block

type: 'block'
content: token[]

## Group

type: 'block'
content: token[]

## Call

type: 'call'
content: token[] []

## Name

type: 'name'
content: string

## Named Call

type: 'named call'
content:
name: name
call: call

## Descriptor

type: 'descriptor'
content: descriptor string

## Description (function)

type: 'description'
content:
word: descriptor
content:
name: name
params: {
type: type
content: name
}[]
returns: type
content: block

## Named Call

type: 'named call'
content
name: name
call: call

## Call

type: 'call'
content: token[]
