import { Token, TokenT } from "../src/tokenizer";

export enum PrimaryT { NUMBER, STRING, IDENTIFIER }

export type Primary = { type: PrimaryT.NUMBER, value: number } 
                    | { type: PrimaryT.STRING, value: string } 
                    | { type: PrimaryT.IDENTIFIER, value: string } 

export type Proj =  "*" | Primary;

// ============ Clauses =============

export type Select = {
    projections: Array<Proj>,
    from: string              // This must be an identifier 
}
