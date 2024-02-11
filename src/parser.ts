import { Token, TokenT, Tokenizer } from "../src/tokenizer";
import * as ast from "../src/ast";

const StreamEnd: Token = { type: TokenT.UNKNOWN, text: "<END OF TOKENS>", start: -1, end: -1 };

class ParserError extends Error {
    constructor(expected: string, got: string) {
        let msg = `Expected: ${expected}, got: ${got}`
        super(msg);
        Object.setPrototypeOf(this, ParserError.prototype);
    }
}

class Parser {
    text: string
    tokens: Array<Token>;

    next: number = 1 

    constructor(text: string, tokens: Array<Token>) {
        this.text = text;
        this.tokens = tokens;
    }

    public parse(): ast.Select {
        return this.parseSelect();
    }

    public static parse_text(text: string) {
        let tokenizer = new Tokenizer(text);
        let tokens = tokenizer.tokens;
        let parser = new Parser(text, tokens);
        parser.parse();
    }

    private isNotAtEnd = (): boolean => this.next < this.tokens.length;
    private advance = (): Token => this.tokens[this.next++];
    private peek = (): Token => this.isNotAtEnd() ? this.tokens[this.next] : StreamEnd;

    private match(type: TokenT): Token | undefined {
        let token = this.peek();
        if (token.type != type) {
            return undefined;
        }
        this.advance();
        return token;
    }

    private expect(type: TokenT): Token {
        let token = this.match(type);
        if (token == undefined) {
            throw new ParserError(TokenT[type], this.peek().text);
        }
        return token;
    }

    //=============== Parsing Expressions ====================
    
    private parsePrimary(): ast.Primary {
        let token = this.peek();
        let { type, value } = token;

        if (type == TokenT.STRING) {
            return { type: ast.PrimaryT.STRING, value: token.text }
        } 
        else if (type == TokenT.IDENTIFIER) {
            return { type: ast.PrimaryT.STRING, value: token.text }
        }
        else if (type == TokenT.NUMBER) {
            return { type: ast.PrimaryT.NUMBER, value }
        }
        else {
            throw new ParserError("Number, String or Identifier", token.text);
        }

    }


    //=============== Parsing Clauses ======================

    private parseProj(): ast.Proj {
        if (this.match(TokenT.STAR)) {
            return "*";
        }
        return this.parsePrimary();
    }
    

    private parseSelect(): ast.Select {
        this.expect(TokenT.SELECT);

        let projections: ast.Proj[] = [];
        while (true) {
            try {
                let proj = this.parseProj();
                projections.push(proj);
                this.match(TokenT.COMMA);
            }
            catch (Exception) {
                break;
            }
        }

        this.expect(TokenT.FROM);
        let from = this.expect(TokenT.IDENTIFIER);

        return { projections, from: from.text };
    }
}


