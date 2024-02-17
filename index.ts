import wordsToNumbers from 'words-to-numbers';
const fs = require( "fs" )
const util = require('util')

const KEYWORDS = ["END", "FN", "FUNCTION", "RETURN", "IF", "CMP"]
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

const code = fs.readFileSync("example.ls", "utf8")

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
            //@ts-expect-error
            if (last_token?.is_argument()) blocks_by_level[last_level].attrs.set(last_token.value as string, block)
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

function evaluate(block: Block | Token) {
    if(!block) {
        console.error(`EVALUATION ERROR! Undefined token encountered`)
    }

    //console.log("Evaluating")
    //console.log(block)
    if (block.type == "FN") {
        let fn_name = block.attrs.keys().next().value
        let args = Array.from(block.attrs.values())
        if (fn_name == "PRINT") console.log(evaluate(args[0]))
        if (fn_name == "MOD") return evaluate(args[0]) % evaluate(args[1])
    } else if (block.type == "CMP") {
        let operator = Array.from(block.attrs.keys())[1]
        //console.log(operator)
        let [a, b] = Array.from(block.attrs.values())
        a = evaluate(a)
        b = evaluate(b)
        if (operator == "IS") return a == b
        else if (operator == "LESS") return a < b
        else if (operator == "GREATER") return a > b
    }

    //@ts-expect-error | base case
    return block.value
}

if (!/^[a-zA-Z\n ]+$/g.test(code)) console.log("ERROR! Non-letter characters used")
const tokens = tokenize(code)
console.log(util.inspect(tokens, {depth: null, colors: true}))
const ast = make_blocks(tokens, get_blocklevels(tokens))
console.log(util.inspect(ast, {depth: null, colors: true}))
console.log("EVALUATING\n----------------")
ast.forEach(block => evaluate(block))