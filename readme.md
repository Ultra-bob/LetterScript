# LetterScript
LetterScript is a rather daft language where no characters other than the English alphabet (and whitespace!) are allowed anywhere in the code (Including strings!)
It's called LetterScript because there are only letters and it's my first time using TypeScript (or JavaScript)

## Syntax
FizzBuzz Example
```
FUNCTION fizzbuzz WITH number DOES
    SET result TO nothing END
    IF CMP FN MOD number DIV three END IS zero END THEN
        SET result TO FN ADD result CONCAT fizz END END
    END
    IF CMP FN MOD number DIV five END IS zero END THEN
        SET result TO FN ADD result CONCAT buzz END END
    END
    IF CMP result IS nothing END THEN
        RETURN number END
    ELSE
        RETURN result END
    END
END

SET counter TO one END
LOOP
IF CMP counter IS thirty END THEN BREAK END END
FN PRINT FN fizzbuzz WITH counter END END
SET counter TO FN ADD counter PLUS one END END
END
```
- The syntax is very flexible and some keywords can be changed to better enhance readability
- Language keywords are always in UPPERCASE like SQL
- Function arguments have to be named after the first. Naming the first argument is not allowed
For example,  `ADD one PLUS one END`
is the same as `add(1, plus=1)` in Python
- Numbers are not allowed, so instead they are written like `twenty five point one two`
- Also there isn't any scoping so every variable is global
- No types lol