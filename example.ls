FUNCTION fizzbuzz WITH number DOES
    IF CMP FN MOD number DIV three END IS zero END THEN
        RETURN fizz END
    END
    NEXT
    IF CMP FN MOD number DIV five END IS zero END THEN
        RETURN buzz END
    END
    NEXT
    RETURN number END
END

SET counter TO zero
LOOP
IF CMP counter IS one hundred THEN
    BREAK END
END
NEXT
FN PRINT FN fuzzbuzz WITH counter END END
END