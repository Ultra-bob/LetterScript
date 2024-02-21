# LetterScript
LetterScript is a rather daft language where no characters other than the English alphabet (and whitespace!) are allowed anywhere in the code (Including strings!)
It's called LetterScript because there are only letters and it's my first time using TypeScript (or JavaScript)

## Syntax
FizzBuzz Example
```
FUNCTION fizzbuzz WITH number DOES
    IF CMP FN MOD number DIV three END IS zero END THEN
        RETURN fizz END
    END
    IF CMP FN MOD number DIV five END IS zero END THEN
        RETURN buzz END
    END
END

SET counter TO zero
LOOP
IF CMP counter IS one hundred THEN
    BREAK END
END
FN PRINT FN fuzzbuzz WITH counter END END
END
```

- Language keywords are always in UPPERCASE like SQL
- Function arguments have to be named after the first. Naming the first argument is not allowed
For example,  `ADD 1 PLUS 1`
is the same as `add(1, plus=1)` in Python
- Numbers are not allowed, so instead they are written like `twenty five point one two`
- Also there isn't any scoping so every variable is global
- No types lol