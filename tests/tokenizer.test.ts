import { Tokenizer, Token, TokenT } from "../src/tokenizer"; 

function getTokenTs(text: string): Array<TokenT> {
    const tokenizer = new Tokenizer(text);
    return tokenizer.tokens.map(t => t.type);
}

function expectToken(text: string, token_type: TokenT, value: any = undefined) {
    let tokenizer = new Tokenizer(text);
    let tokens = tokenizer.tokens;

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(token_type);

    if (value != undefined) {
        expect(tokens[0]).toStrictEqual(value);
    }
}

function expectNumber(text: string) {
    let tokenizer = new Tokenizer(text);
    let token = tokenizer.tokens[0];

    expect(tokenizer.tokens).toHaveLength(1);
    expect(token.text).toBe(text);
    expect(token.value).toBe(Number(text)); // This could cause problems with floats
}


describe("Tokenizer Tests", () => {
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


    // TODO write tests for these
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

    test("Simple Select Query", () => {
        let tokens = getTokenTs("SELECT * FROM c");
        expect(tokens).toStrictEqual([TokenT.SELECT, TokenT.STAR, TokenT.FROM, TokenT.IDENTIFIER]);
    })

    test("Simple Select Query", () => {
        let tokens = getTokenTs("SELECT * FROM c");
        expect(tokens).toStrictEqual([TokenT.SELECT, TokenT.STAR, TokenT.FROM, TokenT.IDENTIFIER]);
    })
})
