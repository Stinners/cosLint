export class Tokenizer {
    source: string;
    tokens: Array<Token> = [];
    start: number = 0;
    next: number = 0;
    line: number = 1;

    constructor(text: string) {
        this.source = text;
        this.tokenize();
    }

    private tokenize() {
        while (this.isNotAtEnd()) {
            this.start = this.next;
            this.scanToken();
        }
    }

    private addToken (type: TokenT, value: any = null): void {
        let text = this.span();
        let token = { start: this.start, end: this.next, value, text, type };
        this.start = this.next;
        this.tokens.push(token);
    }

    private addNumber() {
        let text = this.span();
        let value = Number(text);
        let token = { start: this.start, end: this.next, value, text, type: TokenT.NUMBER };
        this.tokens.push(token);
    }

    // Methods for controling the tokenizer state
    
    private isNotAtEnd = (): boolean => this.next < this.source.length;
    private advance = (): string => this.source[this.next++];
    private peek = (): string => this.isNotAtEnd() ? this.source[this.next] : "\0";
    private span = (): string => this.source.slice(this.start, this.next);

    private peekNext(): string {
        if (this.next + 1 > this.source.length) {
            return "\0";
        } else {
            return this.source[this.next+1];
        }

    }

    // Check the next char and advance on if it's a match
    private match(expected: string): boolean {
        if (this.isNotAtEnd() && this.source[this.next] == expected) {
            this.advance();
            return true;
        } else {
            return false;
        }
    }

    private matchOne(...expected: Array<string>): boolean {
        if (this.isNotAtEnd() && expected.includes(this.source[this.next])) {
            this.advance();
            return true;
        } else {
            return false;
        }
    }

    // Chars that can appear as the second or later character of an identifier
    private identifierInner = (c: string): boolean => /\w/.test(c);

    // Methods for testing tokens 
    
    // If c is the start of an operator, scan past it an returns true
    // if c is no the start if an operator, this does not advance the scanner
    private isOperator(c: string) {
        if (["<", ">", "!", "="].includes(c)) {
            this.match("=");
            return true;
        } else if (["+", "-", "/"].includes(c)) {
            return true;
        } else {
            return false;
        }
    }

    private isWhitespace(c: string) {
        return [" ", "\t", "\n"].includes(c);
    }

    scanWhile(predicate: (c:string) => boolean) {
        while (true) {
            const next = this.peek();
            if (!predicate(next)) {
                break;
            }
            this.advance();
        }
    }

    private isIdentifierStart = (c: string): boolean => /[a-zA-Z]|_/.test(c);

    private scanIdentifier(): TokenT {
        // Scan to the end of the identifier 
        this.scanWhile(this.identifierInner);

        // Check if it's a keyword
        let ident = this.span().toUpperCase();
        if (ident in Keywords) {
            return Keywords[ident];
        }
        else {
            return TokenT.IDENTIFIER;
        }
    }

    /// ======================== Scanning Numbers ===========================

    private isDigit = (c: string): boolean => /\d/.test(c);
    private isHexDigit = (c: string): boolean => /\d|[a-f]|[A-f]/.test(c);
    private isHexStart = (c: string): boolean => c == '0' && this.matchOne('X', 'x');

    private isNumberStart(c: string): boolean {
        if (this.isDigit(c)) {
            return true;
        }
        else if (c == "." && this.isDigit(this.peek())) {
            return true;
        }
        return false;
    }

    private scanNumber(c: string): void {
        if (this.isHexStart(c)) {
            this.advance();
            this.scanWhile(this.isHexDigit)
            return;
        }

        // Scan the first part of the number
        this.scanWhile(this.isDigit);
        // skip the dot if it's present
        this.match('.');

        // Skip the epxponent, but only if it's followed by another digit
        if (['e', 'E'].includes(this.peek()) && this.isDigit(this.peekNext())) {
            this.advance();
        }

        this.scanWhile(this.isDigit);
    }

    /// ======================== Scanning Strings ===========================
    
    private isQuote = (c: string): boolean => ['"', "'"].includes(c);

    private scanString(quote_type: string) {
        // Advance past the open quote
        this.advance();

        while (true) {
            let next = this.peek();
            if (next == "\0") {
                throw new Error("Encountered end of file while in string");
            }
            else if (next == quote_type) {
                break;
            }
            else if (next == "\\") {
                // Skip escaped characters 
                this.advance();
            }
            this.advance();
        }

        // Advance past the close quote
        this.advance();
    }

    //===========================================================================

    // Reads the next token
    private scanToken(): void {
        let c = this.advance();
        
        if (this.isWhitespace(c)) {
            return undefined;
        }
        else if (this.isNumberStart(c)) {
            this.scanNumber(c);
            this.addNumber();
        }
        else if (c in SingleCharTokens) {
            this.addToken(SingleCharTokens[c]);
        } 
        else if (this.isOperator(c)) {
            this.addToken(TokenT.OPERATOR);
        }
        else if (this.isQuote(c)) {
            this.scanString(c);
            this.addToken(TokenT.STRING);
        }
        else if (this.isIdentifierStart(c)) {
            let tokenType = this.scanIdentifier();
            this.addToken(tokenType);
        }
        else {
            this.addToken(TokenT.UNKNOWN);
        }
    }
}

export enum TokenT {
    // Clauses
    SELECT, FROM, WHERE, ORDER, GROUP, OFFSET, LIMIT, JOIN, IN,

    OPERATOR,

    // Single chatacter tokens
    // Note that STAR can function as an operator in arithmetic expressions
    STAR, LEFT_BRACE, RIGHT_BRACE, LEFT_PAREN, RIGHT_PAREN,
    DOUBLE_QUOTE, SINGLE_QUOTE, DOT, COMMA, SEMICOLON,

    // Literals
    NUMBER, STRING,

    IDENTIFIER ,

    UNKNOWN
}

const T = TokenT;

// Single character tokens, which cannot be the start of another token
const SingleCharTokens: Record<string, TokenT> = {
    "*": T.STAR,
    "{": T.LEFT_BRACE,
    "}": T.RIGHT_BRACE,
    "(": T.LEFT_PAREN,
    ")": T.RIGHT_PAREN,
    ".": T.DOT,
    ",": T.COMMA,
    ";": T.SEMICOLON,
}

// Note that keywords are case insensitive on cosmos
const Keywords: Record<string, TokenT> = {
    "SELECT": T.SELECT,
    "FROM": T.FROM,
    "WHERE": T.WHERE,
    "ORDER": T.ORDER,
    "GROUP": T.GROUP,
    "OFFSET": T.OFFSET,
    "LIMIT": T.LIMIT,
    "JOIN": T.JOIN,
    "IN": T.IN,
}


export type Token = {
    type: TokenT;
    text: string;
    value?: any;
    start: number;
    end: number;
}
