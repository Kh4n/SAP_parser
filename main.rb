def convert(e)
    precedences = {
        "!" => 4,
        "^" => 4,
        "/" => 3,
        "*" => 2,
        "+" => 1,
        "-" => 1,
        "=" => 0,
        "(" => -1,
    }
    precedences.default = 5
    operators = /(\^|\*|\/|\+|\-|\=)/
    postfixoperators = /!/
    constvar = /([+-]?\d+\.?(\d+)?|pi|[a-z]|[A-Z])/
    functions = /ln|log|sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|arcsec|arccsc|arccot|sqrt/
    e.tr!(" ", "")
    e.gsub!(/π/, "pi")
    input = e.scan(/(\/|\*|\^|\(|\)|\+|\-|=|!|ln|log|sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan|arcsec|arccsc|arccot|sqrt|pi|\d+\.?(\d+)?|[a-z]|[A-Z])/).map{|x| x[0]}
    stack = []
    output = []
    #return input
    tmpstack = []
    while input.length != 1
        a = input.pop
        if (a.match?(constvar) || a == "(") && ((input.last.match?(constvar) && !input.last.match?(functions)) || input.last == ")")
            tmpstack << a
            tmpstack << "*"
        elsif a == "-" && (input.last.match(operators) || input.last == "(")
            tmpstack << (a + tmpstack.pop)
        elsif a == "^" && input.last.match?(functions)
            tmpstack.delete_at(-2)
            tmpstack << "^"
        else
            tmpstack << a
        end
    end

    input = (tmpstack << input.pop).reverse
    #return input
    input.each{|curr|
        if curr.match?(functions)
            stack << curr
        elsif curr == "("
            stack << curr
        elsif curr == ")"
            while (a=stack.pop) != "("
                output << a
            end
            output << "()"
            if !stack.last.nil? && stack.last.match?(functions)
                output << stack.pop
            elsif !stack.last.nil? && !stack[-2].nil? && stack.last == "^" && stack[-2].match?(functions)
                exp = stack.pop
                func = stack.pop
                output << func << exp
            end
        elsif curr.match?(constvar)
            output << curr
        elsif curr == "^" && !stack.last.nil? && stack.last.match(functions)
            stack.push(curr)
        elsif curr.match?(operators) && curr.length == 1
            while stack.length != 0 && precedences[curr] <= precedences[stack.last]
                output << stack.pop
            end
            stack << curr
        elsif curr.match?(postfixoperators)
            output << curr
        else
            raise "invalid input"
        end
    }
    output += stack.reverse
    #return output.join(" ")
    output.reverse!
    stack.clear

    while output.length != 0
        a = output.pop
        if a == "/"
            divisor = stack.pop#.chomp(")").reverse.chomp("(").reverse
            dividend = stack.pop#.chomp(")").reverse.chomp("(").reverse
            stack << "@DIV{#{dividend};#{divisor}}"
        elsif a == "^"
            exp = stack.pop
            base = stack.pop
            if exp[0..6].match?(functions)
                stack << exp.insert(exp[0..6].match(functions)[0].length, "@Sup{#{base}}")
            else
                exp.chomp(")").reverse.chomp("(").reverse
                stack << "#{base}@Sup{#{exp}}"
            end
        elsif a == "sqrt"
            stack << "@RT{#{stack.pop[1..-2]}}"
        elsif a.match?(functions)
            stack << "#{a}#{stack.pop}"
        elsif a == "*"
            elemr = stack.pop
            eleml = stack.pop
            if (eleml[-1].match?(/\d/) && elemr[0].match?(/\d/))
                stack << "#{eleml}*#{elemr}"
            else
                stack << "#{eleml}#{elemr}"
            end
        elsif a == "()"
            stack << "(#{stack.pop})"
        elsif a.match?(postfixoperators)
            stack << "#{stack.pop}#{a}"
        elsif a.match?(operators) && a.length == 1
            elemr = stack.pop
            eleml = stack.pop
            stack << "#{eleml}#{a}#{elemr}"
        else
            stack << a
        end
    end
    return stack[0].gsub(/pi|PI/, "&pi;")
end

input = "34/5*3+2pi^4"
input2 = "34/(-5*3)+2pi^4"
inputhard1 = "34/(5 * 3)+ 2pi^3*4xsqrt(m)/y"
inputhard2 = "34/(5 * 3)+ 2pi^3*4xtan^-1(m)/y"
inputhard3 = "(π log(pi/(2.3 n)))/n = 2.12341 - π^2/(6 n^22.2) + ln^-0.3((1/n)^4)/cot(csc^-1(8pi/2))!"

puts convert inputhard3