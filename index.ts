import wordsToNumbers from 'words-to-numbers';
const fs = require( "fs" )

const Keywords = ["FN", "END"]

class Token {
    type: TokenType
    value: string | number

    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

enum TokenType {
    Keyword = "Token.Keyword",
    ArgumentName = "Token.ArgumentName",
    String = "Token.String",
    Number = "Token.Number",
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
    const words = code.split(/ ?([A-Z]+) ?/g).filter((match) => match !== "")
    //console.log(words)
    return words.map(token => {
        let number = wordsToNumbers(token)
        if (typeof number === "number") { //! this is extremely goofy
            return new Token(TokenType.Number, number)
        } 
        return new Token(whar(token), token)
    });
}

console.log(parse(code).map((token) => token))