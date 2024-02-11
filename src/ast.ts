import { Token, TokenT } from "../src/tokenizer";

export enum PrimaryT { NUMBER, STRING, IDENTIFIER }

export type Primary = { type: PrimaryT.NUMBER, value: number } 
                    | { type: PrimaryT.STRING, value: string } 
                    | { type: PrimaryT.IDENTIFIER, value: string };

// TODO support arbitrary index expressions
export type PathExpr = Array<string | Number>;                    

export type Proj =  "*" | Primary | PathExpr;

// ============ Clauses =============

export type Select = {
    projections: Array<Proj>,
    from: string              // This must be an identifier 
}
