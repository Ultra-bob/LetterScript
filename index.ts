const function_regex = /([A-Z]+) ([a-zA-Z ]+)/gm
const code = "ADD one PLUS one"
const [_, fn_name, args_str]: RegExpExecArray = function_regex.exec(code)
const args = args_str.split(/ [A-Z]+ /gm)
console.log(`${fn_name}(${args})`)