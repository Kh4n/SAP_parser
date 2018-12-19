start
  = expr

expr
  = d:divexpr is:infixopexpr* {return d + is.join('');}

divexpr
  = p:expon ps:('/' pr:(divexpr / expon) {return pr;})* 
    {
      if (ps.length == 0)
        return p;
      return `@DIV{${p};${ps.join('')}}`;
    }

expon
  = p:primary ps:('^' pr:(expon / primary) {return pr;})*
    {
      if (ps.length == 0)
        return p;
      return `${p}@Sup{${ps.join('')}}`;
    }

infixopexpr
  = i:(infixop)* d:divexpr {return i + d;}

primary
  = postfixop / parenexpr / prefixopexpr / constant / integer / variable

parenexpr
  = '(' e:expr ')' {return '(' + e + ')';}

prefixopexpr
  = p:prefixop '(' e:expr ')' {return p + '(' + e + ')';} /
    p:prefixop '^' i:integer '(' e:expr ')' {return `${p}@Sup{${i}}(${e})`;}

postfixop
  = n:(prefixopexpr / parenexpr / constant / integer / variable) '!' {return n + '!'}

integer
  = s:'-'? dec:[0-9]+ frac:('.' ifrac:[0-9]+ {return '.' + ifrac.join('');})?
    {return (s||'') + dec.join('') + (frac||'');}

infixop
  = [*+-] /
    '=' / "<=" {return "&le;";} / ">=" {return "&ge;";}

prefixop
  = "sqrt" {return "@RT";} /
    "log" / "ln" /
    "sin" / "cos" / "tan" / "csc" / "sec" / "cot" /
    "arcsin" / "arccos" / "arctan" / "arccsc" / "arcsec" / "arccot"

constant
 = ("pi"i / 'π') {return "&pi;";}

variable
  = ([a-z]) / ([A-Z]) / 'θ' {return "&theta;";}