# TODO
- Add negative number support
- Change assignments to use value
- Contexts include a path not a location
- compute checks for import exists

## How packages might be handled
- Before full compute is run, import messages are looked for and their exports are read and stored
- Then when a dot operator that has the based be a package, the name being accessed can be looked up from where the package exports are stored and the type infired from there
- Compute will return these exports
- Compile will use the computed exports to then compile the proper code. They will be compiled with the module name as part of the path. That way if overlapping function names are used it won't cause confusion.
- In the future we can remove exports that are never used to save compilation time and project space

# ALL BELOW THIS SHOULD BE DISREGARDED AS OBSOLETE

# Big Ideas
- Every thing should return a value. If something does not explicitly return then it returns void. This applys if proper grammar does exist. If a symbol is left on its own, it won't return a value because that makes no sense and will instead cause a compiler error. This means that technically things like ifs and loops can return values, which will have to be explored.

# Data Handling
## Unmanaged
The `Unmanaged Stack` and `Type Stack` work together to hold the type and value of variales individually. When a variable enters scope, the data is appeneded to their respective stacks. Once a variable leaves scope it is removed.

### Type Stack
Holds a string representation of the type. Ex: `string` `int` `bool` 

### Unmanaged Stack
This holds the serialized value of the variable. For variables with managed types, this value points to an index on the managed stacks (`Dirty Stack` and `Managed Pointer Stack`).

## Managed
These stacks work with the unmanaged stacks to control managed types such as `array` and classes.

### Dirty Stack
This stack hold a true or false value of whether the `managed pointer` linked to this element is no longer in use.

### Managed Pointer Stack
This value points to a position on the `Managed Bucket` where the managed data type begins.

### Managed Bucket
This is the bucket that stores all the values of a managed value.

### Managed Value Cleanup
Once a variable that is a managed variable pointer is popped of the stack, the value on the `Dirty Stack` and `Managed Pointer Stack` are removed and the data containing the old managed value on the `Managed Bucket` is removed. If the previous value on the `Dirty Stack` is also dirty then we run this cleanup step on it recursively.

# Language Gramar OUTDATED!!!

## Symbol
Symbols are a category of pretty much anything that isn't text or numbers. These can provide a variety of functions such as being operators or defining syntax

### Operator
Operators are a subset of `symbol`s which return a value or modify a name based on 1 or 2 inputs. Examples include `+ - ! += --`

### Indexer
This is a specific set of symbols `[ ]` that take in a single `expression` allowing you to index an `array` or `object`

### Contexter
The `.` symbol. Functionally equivealtent to an `indexer` but just takes a hardcoded value.

~~### Line Break
This is the `;` symbol which specifies a line break~~ **Removed**

### Code Block
This is a set of `{ }` symbols which lines are included in and grouped for things like a `function` or a `control`

### Call
This is a set of `()` with any amount of values each seperated by a `,`. These can be used with a `control` or `function`
<br>Syntax: `([value], ... )`

## Value
These are raw hardcoded values such as a `string`, `float`, `bool`, or `integer`. This also includes more complex types such as `object`s or `array`s. `Name`s are also a `value` if not used in something like a `statement`

## Key Word
These are predefined words such as `if` or `function`.

### Verb
A `keyWord` that builds a `control`. Ex: `if`, `while`, and `for`

### Tag
A `keyWord` that describes how an `assignment` will function. Ex: `function`, `const`, and `var`

### Descriptor
A type of `tag` that bundles a piece of the tree into a value of a specific type. For example `function`. These also function as `tags` but are more specific.

## Statement
A statement modifies the state or data of the application. It can not be contained within another token besides a `block`.

### Asignment
A `statement` which modifies the data of an application. It takes in a `tag`, `name`, and `value`.
<br>Syntax: `[tag] [name] = [value]`

### Control
A `statement` which starts with a `verb` that changes the state or flow of the code.
<br>Syntax: `[verb] [call] [block]`

## Expression
An expression is a tree of tokens that returns a value. This can be used on it's own in the case of a single `function` `call` or it can be nested into other tokens like an `operator`.

# Features

## Operators
`+ - / * ! % && || == != > < >= <= += -= ++ -- /= *=`

Order:
* `!`
* `%`
* `* /`
* `+ -`
* `>= <= > <`
* `== !=`
* `&&`
* `||`
* `++ -- += -= /= *=`

# Token Structure

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
content: '+', '-', '*', '/'...

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