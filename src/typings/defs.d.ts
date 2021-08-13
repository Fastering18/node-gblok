declare class Token {
    constructor(tipe: string, value?: string, posisi_awal?: any, posisi_akhir?: any)
    tipe: string;
    value?: string;
    posisi_awal?: any;
    posisi_akir?: any;
}

export declare interface Tokens {
  hasil?: Array<Token>,
  error?: any
}

export class Lexer {
    constructor(name: string, script: string);
    buatToken(): Tokens; 
}