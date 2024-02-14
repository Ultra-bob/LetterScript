var WordToNumber = require( "word-to-number-node" );
var w2n = new WordToNumber();

const function_regex = /([A-Z]+) ([a-zA-Z ]+)/gm
const code = "ADD one PLUS twenty five"
const [_, fn_name, args_str]: RegExpExecArray = function_regex.exec(code)
const args = args_str.split(/ [A-Z]+ /gm).map((arg) => w2n.parse(arg) || arg)
console.log(`${fn_name}(${args})`)