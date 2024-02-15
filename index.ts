import wordsToNumbers from 'words-to-numbers';
const fs = require( "fs" )

const Keywords = ["FN", "END", "DOES"]

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
    String = "Token.String",
    Number = "Token.Number",
    Block = "Block",
    Unknown = "Token.ParseError"
}

function whar(token: any): TokenType {
    if (Keywords.includes(token)) {
        return TokenType.Keyword
    } else if (token === token.toUpperCase()) {
        return TokenType.ArgumentName
    } else if (typeof token == "number") { //! this is goofy
        return TokenType.Number
    } else if (typeof token == "string") { //! this is still goofy
        return TokenType.String
    }
    return TokenType.Unknown
}

const code = fs.readFileSync("example.ls", "utf8")

function parse(code: string): Token[] {
    const words = code.split(/ ?([A-Z]+) ?/g).filter(match => match !== "")
    //console.log(words)
    let tokens = words.map(token => {
        let number = wordsToNumbers(token)
        if (typeof number === "number") { //! this is extremely goofy
            return new Token(TokenType.Number, number)
        } 
        return new Token(whar(token), token)
    });

    let startBlock = tokens.findIndex((token) => token.value === "FN")
    //@ts-expect-error
    let endBlock = tokens.findLastIndex(token => token.value === "END")
    console.log(`${startBlock} - ${endBlock}`)
    let block_tokens = tokens.splice(startBlock, endBlock - startBlock + 1)
    let Block = new Token(TokenType.Block, {
        type: block_tokens.shift().value,
        attrs: Object.fromEntries(block_tokens.map((token, index) => 
            token.type === TokenType.ArgumentName ? [token.value, block_tokens[index+1]] : null
        ).filter(element => element !== null))
    });
    tokens.splice(startBlock, 0, Block)

    return tokens
}

console.log(parse(code))