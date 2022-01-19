// Thanks to https://github.com/TylerGlaiel/wordlebot for the wordle word lists

// Run in terminal with: ts-node main.ts

import { Engine } from "./dictionaries/engine";
import { Options } from "./types";



// options
const options: Options = {
  // Choose dictionaries
  useWordleSecretWords: true,
  useWordleAllWords: true,

  // Choose scoring method.
  // Currently only one supported.
  useWordleScoring: true,

  // Choose analyses.
  // Note some might take some time.
  wantLetterCounts: false,

  wantMaxProbIn3: false,
  wantMaxProbIn4: false,
  wantBestDistribution: false,

  // debug or interest
  analyzeWord: 'roate',
}

const wantLetterCounts = true;
//===============================================
interface ScoreCount {
  score: string;
  peak: number;
};

interface Best {
  word: string;
  count: ScoreCount;
}

//===============================================
const engine = new Engine(options);
engine.run();

// console.log("Secret words: ", secretWords)

// if (wantLetterCounts) {
//   reportOverallCount(secretWords);
// }

// // worstCaseSequence(allWords, allWords);

// // worstCaseSequence(words.filter(w => w !== "SERAI" && getScore("SERAI", w) === "20120"));

// //============================================================
// // For finding what happens if you specify the first few words
// //============================================================
// // let choice = "TIRES";
// // let peak = getPeak(choice, allWords);
// // console.log("==== peak for ", choice, peak);
// // let tmpWords = allWords.filter(w => w !== choice && getScore(choice, w) === peak.score);
// // console.log(tmpWords);
// // // choice = "CABOT";
// // // peak = getPeak(choice, tmpWords);
// // // console.log("==== peak", peak);
// // tmpWords = tmpWords.filter(w => w !== choice && getScore(choice, w) === peak.score);
// // worstCaseSequence(tmpWords, allWords);

// //============================================================
// // For finding alternate starting words
// //============================================================
// // let tmpWords = [...allWords];
// // for (let i = 0; i < 5; ++i) {
// //   const best: Best = chooseWord(tmpWords, allWords);
// //   tmpWords = tmpWords.filter(w => w !== best.word);
// // }

// // const peak = getPeak("TIRES", words);
// // console.log("TIRES: ", peak);

// //===============================================
// function worstCaseSequence(words: string[], allWords: string[]) {
//   console.log("Still have ", words.length, "words", words);
//   const best: Best = chooseWordByMinPeak(words, allWords);
//   console.log(best);
//   if (best.count.peak > 1) {
//     worstCaseSequence(words.filter(w => w !== best.word && getScore(best.word, w) === best.count.score), allWords);
//   }
// }




// function reportOverallCount(words: string[]) {
//   const counts = new Array(26).fill(0);
//   const countsByPosition: (number[])[] = new Array(5);
//   for (let i = 0; i < 5; ++i) countsByPosition[i] = [...counts];

//   words.forEach((s: string) => {
//     let alreadyCounted = "";
//     for (let i = 0; i < 5; ++i) {
//       const c = s[i];
//       const index = s.charCodeAt(i) - "A".charCodeAt(0);
//       if (index < 0 || index >= 26) {
//         console.log("Oops: ", s);
//       }
//       else {
//         const pos = countsByPosition[i];
//         ++pos[index];
//         if (!alreadyCounted.includes(c)) {
//           ++counts[index];
//           alreadyCounted = alreadyCounted + c;
//         }
//       }
//     }
//   });
//   countsByPosition.forEach((v: number[], index: number) => {
//     logCounts(`Counts for position ${index + 1}`, v);
//   });
//   logCounts('Overall:', counts);
// }


// function logCounts(text: string, counts: number[]) {
//   const byChar = counts.map((v: number, index: number) => ({
//     char: String.fromCharCode("A".charCodeAt(0) + index),
//     count: counts[index]
//   }));

//   // To log in alphabetical order:
//   // console.log();
//   // console.log(`${text}:`);
//   // console.log("-------");
//   // byChar.forEach((v:any) => {
//   //   console.log(`${v.char}: ${v.count}`);
//   // });

//   byChar.sort((a: any, b: any): number => (a.count < b.count)? 1 : (a.count > b.count)? -1 : 0);
//   console.log();
//   console.log(`${text}:`);
//   console.log("-------");
//   byChar.forEach((v:any) => {
//     console.log(`${v.char}: ${v.count}`);
//   }); 
// }






// //==========================================================================
// // An algorithm to choose a word.
// // We do minimum peak, no look-ahead,
// // where peak is the worst case # remaining words
// //==========================================================================
// function chooseWordByMinPeak(words: string[], allWords: string[]): Best {
//   const best = allWords.reduce((acc: Best, s: string) => {
//     const p = getPeak(s, words);
//     if (p.peak < acc.count.peak) {
//       console.log("Best so far: ", s, p);
//       return { word: s, count: { peak: p.peak, score: p.score } }
//     }
//     return acc;
//   }, <Best>{word: "", count: { peak: 100000, score: ""} });

//   console.log("Best: ", best);
//   return best;
// }


// function getPeak(playWord: string, words: string[]): ScoreCount {
//   const counts: {[s: string]: number} = {};
//   words.forEach((w: string) => {
//     if (w !== playWord) {
//       const score = getScore(playWord, w);
//       counts[score] = (counts[score] ?? 0) + 1;
//     }
//   });

//   return Object.entries(counts).reduce((a: ScoreCount, [score, peak]: [string, number]): ScoreCount => {
//     if (peak > a.peak) {
//       return {
//         score,
//         peak,
//       }
//     }
//     return a;
//   }, ({ score: "", peak: 0}) );

//   // return Object.values(counts).reduce((a: number, b:number) => {
//   //   return Math.max(a, b);
//   // }, 0);
// }