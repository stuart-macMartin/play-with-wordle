import { NumberByString } from "./types";

const fs = require('fs');

export function readAltWords(): string[] {
  console.log("Using alternate dictionary for all words");
  const a = fs.readFileSync("dictionaries/5letterwords-grid.txt", 'utf8');
  const all = a.toString();
  const all1 = a.replaceAll('\n', ' ').split(' ').map((s: string) => s.toLowerCase());
  console.log(`Read ${all1.length}`);
  return all1; 
}


export function readAllWordleWords(): string[] {
  let a = fs.readFileSync("dictionaries/wordle_all_words.txt", 'utf8');
  const all = a.replaceAll('\r', ' ')
               .replaceAll('\n', ' ')
               .split(' ')
               .filter((s: string) => s !== '')
               .map((s: string) => s.toLowerCase());
  console.log(`${all.length} allowed guess words`);
  return all;
}


export function readSecretWordleWords(): string[] {
  const a = fs.readFileSync("dictionaries/wordle_secret_words.txt", 'utf8');
  const all = a.replaceAll('\r', ' ')
               .replaceAll('\n', ' ')
               .split(' ')
               .filter((s: string) => s !== '')
               .map((s: string) => s.toLowerCase());
  console.log(`${all.length} secrets`);
  return all;
}

//==========================================================================
// Score is:
// - 2 ("green") if exact match
// - 1 ("yellow") if secret word has the letter and not already counted
// - 0 otherwise
// Score is given by position, and we use as a key, so can just be a string
//==========================================================================
export function getWordleScore(guess: string, secret: string): string {
  let s = '00000';

  let localGuess = [...guess]; // Be sure it's a copy. Array easier to manipulate
  let localSecret = [...secret];

  // Find exact matches first
  localGuess.forEach((c: any, i: number) => {
    if (localSecret[i] === c) {
      s = setCharAt(s, i, '2');
      localGuess[i] = '_';
      localSecret[i] = '_';
    }
  });

  localGuess.forEach((c: any, i: number) => {
    if (s[i] === '0') { 
      const foundi = localSecret.indexOf(c);
      if (foundi >= 0) {
        s = setCharAt(s, i, '1');
        localSecret[foundi] = '_';
      }
    }
  });
  return s;
}


export function getWordCountsByLetter(words: string[]): NumberByString {
  const c = <NumberByString>{};

  words.forEach(w => {
    const a = new Set([...w]);
    a.forEach(l => c[l] = (c[l] ?? 0) + 1);
  });

  return c;
}

export function getLetterCountsByPosition(words: string[], index: number): NumberByString {
  const c = <NumberByString>{};

  words.forEach(w => {
    const l = w[index];
    c[l] = (c[l] ?? 0) + 1;
  });

  return c;
}

export function logLetterCounts(counts: NumberByString) {
  const byChar = Object.entries(counts).map(([k, v]: [String, number]) => ({
    char: k,
    count: v,
  }));

  byChar.sort((a: any, b: any): number => (a.count < b.count)? 1 : (a.count > b.count)? -1 : 0);

  byChar.forEach((v:any) => {
    console.log(`${v.char}: ${v.count}`);
  }); 

}


//====================================================
// Private functions
//====================================================
function setCharAt(str: string, index: number, c: string): string {
  if(index > str.length - 1) return str;
  return str.substring(0,index) + c + str.substring(index+1);
}

