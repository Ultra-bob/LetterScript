import wordsToNumbers from 'words-to-numbers';
const fs = require( "fs" )
const util = require('util')

const Keywords = ["FN", "END", "FUNCTION", "RETURN", "IF"]
const BLOCK_STARTERS = ["FN", "FUNCTION", "IF", "RETURN"]

class Token {
    type: TokenType
    value: string | number | Block

    constructor(type, value) {
        this.type = type
        this.value = value
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
    if (Keywords.includes(token)) {
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
        if (token.type == TokenType.Keyword && BLOCK_STARTERS.includes(token.value as string)) {
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
            console.log(`Starting Block at level ${level}`)
            let block = {type: token.value as string, attrs: new Map()}
            if (last_token?.type == TokenType.ArgumentName) blocks_by_level[last_level].attrs[last_token.value as string] = block
            blocks_by_level[level] = block
        } else if ( last_level == level + 1 ) {
            console.log(`Ending Block at level ${last_level}`)
            blocks.push(blocks_by_level.splice(last_level, 1)[0])
        } else if ( VALUES.includes(token.type) && last_token.type == TokenType.ArgumentName ) {
            console.log(`Setting ${last_token.value} = ${token.value} on block ${level}`)
            blocks_by_level[level].attrs[last_token.value as string] = token
        }
    });
    return blocks
}

const tokens = tokenize(code)
console.log(util.inspect(make_blocks(tokens, get_blocklevels(tokens)), {depth: null, colors: true}))