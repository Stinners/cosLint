import { Tokenizer, Token, TokenT } from "../src/tokenizer"; 

function getTokenTs(text: string): Array<TokenT> {
    const tokenizer = new Tokenizer(text);
    return tokenizer.tokens.map(t => t.type);
}

function expectToken(text: string, token_type: TokenT): Token {
    let tokenizer = new Tokenizer(text);
    let tokens = tokenizer.tokens;

    expect(tokens.length).toBe(1);
    let token = tokens[0];
    expect(token.text).toBe(text);
    expect(token.type).toBe(token_type);
    return token;
}

function expectNumber(text: string) {
    let token = expectToken(text, TokenT.NUMBER);
    expect(token.value).toBe(Number(text)); // This could cause problems with floats
}


describe("Single Token Tests", () => {
    test("Can create tokenizer", () => {
        let tokenizer = new Tokenizer("");
        expect(tokenizer.tokens).toHaveLength(0);
    })

    test("Can Tokenize clauses", () => {
        expectToken("SELECT", TokenT.SELECT);
        expectToken("FROM", TokenT.FROM);
        expectToken("WHERE", TokenT.WHERE);
        expectToken("ORDER", TokenT.ORDER);
        expectToken("GROUP", TokenT.GROUP);
        expectToken("OFFSET", TokenT.OFFSET);
        expectToken("LIMIT", TokenT.LIMIT);
        expectToken("JOIN", TokenT.JOIN);
        expectToken("IN", TokenT.IN);

        expectToken("limit", TokenT.LIMIT);
        expectToken("joIN", TokenT.JOIN);
        expectToken("in", TokenT.IN);
    })

    test("Can Tokenize Single Character Tokens", () => {
        expectToken("*", TokenT.STAR);
        expectToken("{", TokenT.LEFT_BRACE);
        expectToken("}", TokenT.RIGHT_BRACE);
        expectToken("(", TokenT.LEFT_PAREN);
        expectToken(")", TokenT.RIGHT_PAREN);
        expectToken(".", TokenT.DOT);
        expectToken(",", TokenT.COMMA);
        expectToken(";", TokenT.SEMICOLON);
    })

    test("Can Tokenize identifiers", () => {
        expectToken("foo", TokenT.IDENTIFIER);
        expectToken("person", TokenT.IDENTIFIER);
        expectToken("awd242453", TokenT.IDENTIFIER);
        expectToken("_test", TokenT.IDENTIFIER);
    })

    test("Can Tokenize operators", () => {
        expectToken("<", TokenT.OPERATOR);
        expectToken("<=", TokenT.OPERATOR);
        expectToken("+", TokenT.OPERATOR);
        expectToken("-", TokenT.OPERATOR);
        expectToken("==", TokenT.OPERATOR);
        expectToken("/", TokenT.OPERATOR);
        expectToken("!", TokenT.OPERATOR);
    })

    // TODO verify that both types of strings are allowed
    test("Can tokenize strings", () => {
        expectToken('"test"', TokenT.STRING);
        expectToken("'test'", TokenT.STRING);
        expectToken("'test\n'", TokenT.STRING);
        expectToken("'test  test'", TokenT.STRING);
        expectToken("'test\\'test'", TokenT.STRING);
    })


    // TODO write tests invalid number types
    // Think about what these should actually tokenize as
    // Invalid numbers 
    // 1.0.0  Multiple decimal points 
    // 1e1.0 Decimal points after the e
    // 0b1 binary numbers
    // e1 Starting with exponent
    
    test("Can tokenize numbers", () => {
        expectNumber("1");           // Simple Number 
        expectNumber("1.0");         // Real Number
        expectNumber(".01");         // Real Number
        expectNumber("1e4");         // Exponent
        expectNumber("0x1");         // Hex Number
        expectNumber("0xabcdef");    // Hex Number
        expectNumber("0XABCDEF");    // Hex Number
    })

    test("Skips whitespace", () => {
        const tokenizer = new Tokenizer("  \t\n ");
        expect(tokenizer.tokens).toHaveLength(0);
    });
})


describe("Tokenizer phrase tests", () => {
    test("Simple Select Query", () => {
        let tokens = getTokenTs("SELECT * FROM c");
        expect(tokens).toStrictEqual([TokenT.SELECT, TokenT.STAR, TokenT.FROM, TokenT.IDENTIFIER]);
    })
})
