"use strict";

function convert(str) {
    var precedences = {
        "!" : 5,
        "^" : 5,
        "/" : 4,
        "*" : 3,
        "+" : 2,
        "-" : 2,
        "=" : 1,
        "<" : 1,
        ">" : 1,
        "<=": 1,
        "(" : -1,
    }; //default is 6
    const DEF = 6;
    var operators = /(\^|\*|\/|\+|\-|&le;|&ge;|<|>|=)/g;
    var postfixoperators = /!/g;
    var constvar = /([+-]?\d+\.?(\d+)?|&theta;|&pi;|[a-z]|[A-Z])/g;
    var functions = /ln|log|sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|arcsec|arccsc|arccot|sqrt/g;
    str = str.replace(/ /g, "");
    str = str.replace(/pi/gi, "&pi;").replace(/theta/g, "&theta;").replace(/π/g, "&pi;").replace(/θ/g, "&theta;");
    str = str.replace(/<=/g, "&le;").replace(/>=/g, "&ge;");
    var input = str.match(/(\/|\*|\^|\(|\)|\+|\-|&le;|&ge;|<|>|=|!|ln|log|sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|arcsec|arccsc|arccot|sqrt|&theta;|&pi;|\d+\.?(\d+)?|[a-z]|[A-Z])/g);
    var stack = [];
    var output = [];
    var tmpstack = [];

    while (input.length != 1) {
        var a = input.pop();
        if ( (a.match(constvar) || a === "(") && ((input.slice(-1)[0].match(constvar) && !input.slice(-1)[0].match(functions)) || input.slice(-1)[0] === ")") ) {
            tmpstack.push(a);
            tmpstack.push("*");
        }
        else if ( a === "-" && (input.slice(-1)[0].match(operators) || input.slice(-1)[0] === "(") ) {
            tmpstack.push(a + tmpstack.pop());
        }
        else if ( a === "^" && input.slice(-1)[0].match(functions) ) {
            tmpstack.splice(tmpstack.length-2, 1);
            tmpstack.push("^")
        }
        else {
            tmpstack.push(a)
        }
    }
    tmpstack.push(input.pop());
    input = tmpstack.reverse();

    input.forEach(curr => {
        if ( curr.match(functions) ) {
            stack.push(curr);
        }
        else if ( curr === "(" ) {
            stack.push(curr);
        }
        else if ( curr === ")" ) {
            var a = stack.pop()
            while ( a !== "(" ) {
                output.push(a);
                a = stack.pop();
                if (a === undefined) {
                    console.warn("MISMATCHED PARENTHESES, EXITING");
                    return null;
                }
            }
            output.push("()");
            if ( stack.slice(-1)[0] && stack.slice(-2)[0] && stack.slice(-1)[0] === "^^" ) {
                var exp = stack.pop();
                var func = stack.pop();
                output.push(func);
                output.push(exp);
            }
        }
        else if ( curr.match(constvar) ) {
            output.push(curr);
        }
        else if ( curr === "^" && stack.slice(-1)[0] && stack.slice(-1)[0].match(functions) ) {
            stack.push(curr + "^");
        }
        else if ( curr.match(operators) && curr.length <= 2 ) {
            while ( stack.length !== 0 && ((precedences[curr] || DEF) <= (precedences[stack.slice(-1)[0]] || DEF)) ) {
                output.push(stack.pop());
            }
            stack.push(curr);
        }
        else if ( curr.match(postfixoperators) ) {
            output.push(curr);
        }
        else {
            console.warn("INVALID INPUT");
            return null;
        }
    });
    output = output.concat(stack.reverse());
    output.reverse();
    stack = [];

    while ( output.length !== 0 ) {
        var a = output.pop();
        if ( a === "/" ) {
            var divisor = stack.pop();
            var dividend = stack.pop();
            stack.push(`@DIV{${dividend};${divisor}}`);
        }
        else if ( a === "^" ) {
            var exp = stack.pop();
            var base = stack.pop();
            stack.push(`${base}@Sup{${exp}}`);
        }
        else if ( a === "^^") {
            var exp = stack.pop();
            var base = stack.pop();
            stack.push(exp.slice(0, exp.match(functions)[0].length) + `@Sup{${base}}` + exp.slice(exp.match(functions)[0].length));
        }
        else if ( a === "sqrt" ) {
            stack.push(`@RT{${stack.pop().slice(1, -1)}}`);
        }
        else if ( a.match(functions) ) {
            stack.push(`${a}${stack.pop()}`)
        }
        else if ( a === "*" ) {
            var elemr = stack.pop();
            var eleml = stack.pop();
            if ( eleml.slice(-1)[0].match(/\d/g) && elemr[0].match(/\d/g) )
                stack.push(`${eleml}*${elemr}`);
            else
                stack.push(`${eleml}${elemr}`);
        }
        else if ( a === "()" ) {
            stack.push(`(${stack.pop()})`);
        }
        else if ( a.match(postfixoperators) ) {
            stack.push(`${stack.pop()}${a}`);
        }
        else if ( a.match(constvar) ) {
            stack.push(a);
        }
        else if ( a.match(operators) && a.length <= 2) {
            var elemr = stack.pop();
            var eleml = stack.pop();
            stack.push(`${eleml}${a}${elemr}`);
        }
        else {
            stack.push(a);
        }
    }
    return stack[0];
}

var input = "34/5*3+2pi^4";
var input2 = "34/(-5*3)+2pi^4";
var inputhard1 = "34/(5 * 3)+ 2pi^3*4xsqrt(m)/y";
var inputhard2 = "34/(5 * 3)+ 2pi^3*4xtan^-1(m)/y";
var inputhard3 = "(π log(pi/(2.3 n)))/n^(arccsc^2(2θ/2^2)) = 2.12341 >= 4 - π^2/(6 n^22.2) + ln^-0.3((1/n)^4)/cot(csc^-1(8pi/2))!";

console.log(convert("y = (7 sqrt(3) x)/2 - 13 sqrt(3)"));