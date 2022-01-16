// Run in terminal with: ts-node words.ts

const fs = require('fs');

interface ScoreCount {
  score: string;
  peak: number;
};

interface Best {
  word: string;
  count: ScoreCount;
}

const allWords = readWords();

// reportOverallCount(words);

worstCaseSequence(allWords, allWords);

// worstSequence(words.filter(w => w !== "SERAI" && getScore("SERAI", w) === "20120"));

//============================================================
// For finding what happens if you specify the first few words
//============================================================
// let choice = "SERAI";
// let peak = getPeak(choice, allWords);
// console.log("==== peak", peak);
// let tmpWords = words.filter(w => w !== choice && getScore(choice, w) === peak.score);
// console.log(tmpWords);
// choice = "CABOT";
// peak = getPeak(choice, tmpWords);
// console.log("==== peak", peak);
// tmpWords = tmpWords.filter(w => w !== choice && getScore(choice, w) === peak.score);
// worstSequence(tmpWords, allWords);

//============================================================
// For finding alternate starting words
//============================================================
// let tmpWords = [...allWords];
// for (let i = 0; i < 5; ++i) {
//   const best: Best = chooseWord(tmpWords, allWords);
//   tmpWords = tmpWords.filter(w => w !== best.word);
// }

// const peak = getPeak("TIRES", words);
// console.log("TIRES: ", peak);

//===============================================
function worstCaseSequence(words: string[], allWords: string[]) {
  console.log("Still have ", words.length, "words", words);
  const best: Best = chooseWordByMinPeak(words, allWords);
  console.log(best);
  if (best.count.peak > 1) {
    worstCaseSequence(words.filter(w => w !== best.word && getScore(best.word, w) === best.count.score), allWords);
  }
}

function readWords(): string[] {
  const a = fs.readFileSync("./5letterwords-grid.txt", 'utf8');
  const all = a.toString();
  const all1 = a.replaceAll('\n', ' ').split(' ');
  console.log(`Read ${all1.length}`);
  return all1;
}


function reportOverallCount(words: string[]) {
  const counts = new Array(26).fill(0);
  const countsByPosition: (number[])[] = new Array(5);
  for (let i = 0; i < 5; ++i) countsByPosition[i] = [...counts];

  words.forEach((s: string) => {
    let alreadyCounted = "";
    for (let i = 0; i < 5; ++i) {
      const c = s[i];
      const index = s.charCodeAt(i) - "A".charCodeAt(0);
      if (index < 0 || index >= 26) {
        console.log("Oops: ", s);
      }
      else {
        const pos = countsByPosition[i];
        ++pos[index];
        if (!alreadyCounted.includes(c)) {
          ++counts[index];
          alreadyCounted = alreadyCounted + c;
        }
      }
    }
  });
  countsByPosition.forEach((v: number[], index: number) => {
    logCounts(`Counts for position ${index + 1}`, v);
  });
  logCounts('Overall:', counts);
}


function logCounts(text: string, counts: number[]) {
  const byChar = counts.map((v: number, index: number) => ({
    char: String.fromCharCode("A".charCodeAt(0) + index),
    count: counts[index]
  }));

  // To log in alphabetical order:
  // console.log();
  // console.log(`${text}:`);
  // console.log("-------");
  // byChar.forEach((v:any) => {
  //   console.log(`${v.char}: ${v.count}`);
  // });

  byChar.sort((a: any, b: any): number => (a.count < b.count)? 1 : (a.count > b.count)? -1 : 0);
  console.log();
  console.log(`${text}:`);
  console.log("-------");
  byChar.forEach((v:any) => {
    console.log(`${v.char}: ${v.count}`);
  }); 
}


//==========================================================================
// Score is:
// - 2 ("green") if exact match
// - 1 ("yellow") if secret word has the letter and not already counted
// - 0 otherwise
// Score is given by position, and we use as a key, so can just be a string
//==========================================================================
function getScore(inPlayWord: string, inDictWord: string): string {
  let s = '00000';

  let playWord = [...inPlayWord]; // Be sure it's a copy
  let secretWord = [...inDictWord];

  // Find exact matches first
  playWord.forEach((c: any, i: number) => {
    if (secretWord[i] === c) {
      s = setCharAt(s, i, '2');
      playWord[i] = '_';
      secretWord[i] = '_';
    }
  });

  playWord.forEach((c: any, i: number) => {
    if (s[i] === '0') { 
      const foundi = secretWord.indexOf(c);
      if (foundi >= 0) {
        s = setCharAt(s, i, '1');
        secretWord[foundi] = '_';
      }
    }
  });
  return s;
}


function setCharAt(str: string, index: number, c: string): string {
  if(index > str.length - 1) return str;
  return str.substring(0,index) + c + str.substring(index+1);
}


//==========================================================================
// An algorithm to choose a word.
// We do minimum peak, no look-ahead,
// where peak is the worst case # remaining words
//==========================================================================
function chooseWordByMinPeak(words: string[], allWords: string[]): Best {
  const best = allWords.reduce((acc: Best, s: string) => {
    const p = getPeak(s, words);
    if (p.peak < acc.count.peak) {
      console.log("Best so far: ", s, p);
      return { word: s, count: { peak: p.peak, score: p.score } }
    }
    return acc;
  }, <Best>{word: "", count: { peak: 100000, score: ""} });

  console.log("Best: ", best);
  return best;
}


function getPeak(playWord: string, words: string[]): ScoreCount {
  const counts: {[s: string]: number} = {};
  words.forEach((w: string) => {
    if (w !== playWord) {
      const score = getScore(playWord, w);
      counts[score] = (counts[score] ?? 0) + 1;
    }
  });

  return Object.entries(counts).reduce((a: ScoreCount, [score, peak]: [string, number]): ScoreCount => {
    if (peak > a.peak) {
      return {
        score,
        peak,
      }
    }
    return a;
  }, ({ score: "", peak: 0}) );

  // return Object.values(counts).reduce((a: number, b:number) => {
  //   return Math.max(a, b);
  // }, 0);
}