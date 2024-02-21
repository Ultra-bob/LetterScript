FUNCTION fizzbuzz WITH number DOES
    SET result TO nothing END
    NEXT
    IF CMP FN MOD number DIV three END IS zero END THEN
        SET result TO FN ADD result CONCAT fizz END END
    END
    NEXT
    IF CMP FN MOD number DIV five END IS zero END THEN
        SET result TO FN ADD result CONCAT buzz END END
    END
    NEXT
    IF CMP result IS nothing END THEN
        RETURN number END
    ELSE
        RETURN result END
    END
END

SET counter TO one END
LOOP
IF CMP counter IS twenty END THEN BREAK END END
NEXT
FN PRINT FN fizzbuzz WITH counter END END
NEXT
SET counter TO FN ADD counter PLUS one END END
END