import wordsToNumbers from 'words-to-numbers';
const fs = require( "fs" )
const util = require('util')

const KEYWORDS = ["END", "FN", "LOOP", "FUNCTION", "RETURN", "IF", "CMP", "SET", "BREAK"]
const BLOCK_STARTERS = KEYWORDS.slice(1)

class Token {
    type: TokenType
    value: string | number | boolean | Block

    constructor(type, value) {
        this.type = type
        this.value = value
    }

    is_argument() {
        return this.type == TokenType.ArgumentName || (this.type == TokenType.Keyword && this.is_starter())
    }

    is_starter() {
        return BLOCK_STARTERS.includes(this.value as string)
    }

    is_value() {
        return VALUES.includes(this.type)
    }
}

interface Block {
    type: string
    attrs: Map<string, Token>
}

interface Function {
    name: string
    arguments: string[]
    definition: Block[]
}

enum TokenType {
    Keyword = "Token.Keyword",
    ArgumentName = "Token.ArgumentName",
    Boolean = "Token.Boolean",
    String = "Token.String",
    Number = "Token.Number",
    Block = "Block",
    Unknown = "Token.ParseError"
}

const VALUES = [TokenType.Number, TokenType.String, TokenType.Boolean]

function whar(token: any): TokenType {
    if (KEYWORDS.includes(token)) {
        return TokenType.Keyword
    } else if (token === token.toUpperCase()) {
        return TokenType.ArgumentName
    } else if (typeof token == "boolean") { //! this is goofy
        return TokenType.Boolean
    } else if (typeof token == "number") { //! this is goofy
        return TokenType.Number
    } else if (typeof token == "string") { //! this is still goofy
        return TokenType.String
    }
    return TokenType.Unknown
}

console.log(process.argv)

const code = fs.readFileSync(process.argv[2], "utf8")

function tokenize(code: string): Token[] {
    const words = code.split(/([A-Z]+)/g).map(match => match.trim()).filter(match => match !== "")
    //console.log(words)
    let tokens = words.map(token => {
        let number = wordsToNumbers(token)
        if (typeof number === "number") { //! this is extremely goofy
            return new Token(TokenType.Number, number)
        }
        if (["true", "false"].includes(token)) { //! this is extremely goofy
            return new Token(TokenType.Boolean, token === "true")
        }
        return new Token(whar(token), token)
    });

    return tokens
}

function get_blocklevels(tokens: Token[]) {
    let block_level = 0
    const block_levels = tokens.map(token => {
        if (token.is_starter()) {
            block_level++
        } else if (token.type == TokenType.Keyword && token.value == "END") {
            block_level--
        }
        return block_level
    })
    if(block_level !== 0) {
        console.error("ERROR! Missing END detected")
    }
    return block_levels
}

function make_blocks(tokens: Token[], block_levels: number[]): Block[] {
    let blocks: Block[] = [];
    let blocks_by_level: Block[] = []

    tokens.forEach((token, index) => {
        let level = block_levels[index]
        let last_level = block_levels[index - 1] ?? 0
        let last_token = tokens[index - 1]
        ////console.log(`${last_token?.type} - ${token?.type}`)
        if ( last_level == level - 1 ) {
            ////console.log(`Starting Block at level ${level}`)
            let block = {type: token.value as string, attrs: new Map()}
            
            if (last_token?.is_argument() || last_token?.value === "END" && last_level !== 0) {
                if(last_token.value === "END") {
                    let last_arg = Array.from(blocks_by_level[last_level].attrs.keys()).slice(-1)[0] as string
                    ////console.log(`setting array ${last_arg}`)
                    let blocks = blocks_by_level[last_level].attrs.get(last_arg as string)
                    if (Array.isArray(blocks)) blocks.push (block)
                    //@ts-expect-error
                    else if (blocks !== undefined) blocks_by_level[last_level].attrs.set(last_arg, [blocks, block])
                } else if (last_token?.is_argument()) {
                //@ts-expect-error
                blocks_by_level[last_level].attrs.set(last_token.value as string, block)
                }
            }
            blocks_by_level[level] = block
        } else if ( last_level == level + 1 ) {
            ////console.log(`Ending Block at level ${last_level}`)
            if (level == 0) blocks.push(blocks_by_level.splice(last_level, 1)[0])
        } else if ( token.is_value() && last_token.is_argument() ) {
            ////console.log(`Setting ${last_token.value} = ${token.value} on block ${level}`)
            blocks_by_level[level].attrs.set(last_token.value as string, token)
        }
    });
    return blocks
}

let functions: Map<string, Function> = new Map()
let variables: Map<string, Token> = new Map()
let return_value = null
let break_flag = false

function evaluate(block: Block | Token) {
    //console.debug("Evaluating...", util.inspect(block, {depth: 3, colors: true}))

    if(!block) {
        //console.error(`EVALUATION ERROR! Undefined token encountered`)
        return
    }

    if(Array.isArray(block)) {
        return block.map(x => evaluate(x)).slice(-1)[0]
    }

    if(block.type == "FUNCTION") {
        const values = Array.from(block.attrs.values())
        const name = evaluate(values[0])
        const args = values.slice(1, -1).map(x => evaluate(x))
        functions.set(name, {
            name: name,
            arguments: args,
            //@ts-expect-error
            definition: Array.from(block.attrs.values()).slice(-1) //TODO This is stupid and i'll fix it later
        })
        return
    }

    if(block.type == "IF") {
        if (evaluate(block.attrs.get("IF")) === true) {
            return evaluate(block.attrs.get("THEN"))
        } else if (evaluate(block.attrs.get("ELIF")) === true) {
            return evaluate(block.attrs.get("DO"))
        } else if (block.attrs.get("ELSE")) {
            return evaluate(block.attrs.get("ELSE"))
        }
    }

    if (block.type == "SET") {
        //@ts-expect-error
        variables.set(block.attrs.get("SET").value, evaluate(block.attrs.get("TO")))
        return
    }

    if (block.type == "RETURN") {
        return_value = evaluate(block.attrs.values().next().value)
        return null
    }
    if (block.type == "BREAK") {
        break_flag = true
    }

    if (block.type == "LOOP") {
        //console.log("Starting Loop...")
        while(true) {
            evaluate(block.attrs.get("LOOP"))
            if (break_flag) {
                break_flag = false
                break
            }
        }
    }
    

    //console.log("Evaluating")
    //console.log(block)
    if (block.type == "FN") {
        let fn_name = block.attrs.keys().next().value
        let custom_fn_name = evaluate(block.attrs.values().next().value) //! this enables cursed shenaninagnes
        let args = Array.from(block.attrs.values())
        if (fn_name == "PRINT") console.log(evaluate(args[0]))
        if (fn_name == "MOD") return evaluate(args[0]) % evaluate(args[1])
        if (fn_name == "ADD") return evaluate(args[0]) + evaluate(args[1])
        if (fn_name == "SUBTRACT") return evaluate(args[0]) - evaluate(args[1])
        if (fn_name == "MULTIPLY") return evaluate(args[0]) * evaluate(args[1])
        if (fn_name == "DIVIDE") return evaluate(args[0]) / evaluate(args[1])
        else if (functions.get(custom_fn_name) !== undefined) {
            ////console.log(`Calling ${custom_fn_name}`)
            let fn = functions.get(custom_fn_name)
            Array.from(block.attrs.values()).slice(1).forEach((x, idx) => variables.set(fn.arguments[idx], evaluate(x)))
            fn.definition.some(block => evaluate(block) === null)
            return return_value
        }
    } else if (block.type == "CMP") {
        let operator = Array.from(block.attrs.keys())[1]
        //console.log(operator)
        let [a, b] = Array.from(block.attrs.values())
        a = evaluate(a)
        b = evaluate(b)
        if (operator == "IS") return a == b
        else if (operator == "LESS") return a < b
        else if (operator == "GREATER") return a > b
        else if (operator == "AND") return a && b
    }
    
    //@ts-expect-error
    if (Array.from(variables.keys()).includes(block.value)) {
        //@ts-expect-error
        return variables.get(block.value)
    }
    //@ts-expect-error
    if (block.value == "nothing") {
        return ""
    }

    //@ts-expect-error
    return block.value
}

const debug = process.argv[3] && process.argv[3] === '--debug'

if (!/^[a-zA-Z\n ]+$/g.test(code)) console.log("ERROR! Non-letter characters used")
const tokens = tokenize(code)
/////console.log(util.inspect(tokens, {depth: null, colors: true}))
const ast = make_blocks(tokens, get_blocklevels(tokens))
////console.log(util.inspect(ast, {depth: null, colors: true}))
if (debug) console.log("EVALUATING\n----------------")
ast.forEach(block => evaluate(block))
if (debug) console.log("SCOPE\n----------------")
if (debug) console.log(functions)
if (debug) console.log(variables)