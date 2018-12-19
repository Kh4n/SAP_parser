"use strict";
var parser = require("./parser");

function convert(str) {
    str = str.replace(/ /g, "");
    return parser.parse(str);
}

var input = "34/5*3+2pi^4";
var input2 = "34/(-5*3)+2pi^4";
var inputhard1 = "34/(5 * 3)+ 2pi^3*4xsqrt(m)/y";
var inputhard2 = "34/(5 * 3)+ 2pi^3*4xtan^-1(m)/y";
var inputhard3 = "(π log(pi/(2.3 n)))/n^(arccsc^2(2θ/2^2)) = 2.12341 >= 4 - π^2/(6 n^22.2) + ln^-0.3((1/n)^4)/cot(csc^-1(8pi/2))!";

console.log(convert(inputhard2));