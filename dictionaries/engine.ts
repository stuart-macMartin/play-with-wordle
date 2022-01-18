import { Best, NumberByString, Options, ScoreCount, ScoreDistribution } from "../types";
import { getLetterCountsByPosition, getWordCountsByLetter, getWordleScore, logLetterCounts, readAllWordleWords, readAltWords, readSecretWordleWords } from "../util";

export class Engine {
  allWords: string[];
  secretWords: string[];

  constructor(private options: Options) {
    this.allWords = options.useWordleAllWords? readAllWordleWords() : readAltWords();
    this.secretWords = options.useWordleSecretWords? readSecretWordleWords() : readAltWords();
  }


  run() {
    if (this.options.getDistributionOn.length === 5) {
      this.action_logDistribution(this.secretWords, this.options.getDistributionOn);
    }

    if (this.options.wantLetterCounts) {
      this.action_logLetterCounts(this.secretWords);
    }

    if (this.options.wantMaxProbIn3) {
      this.action_logBestMaxProbIn3(this.secretWords);
    }
  }

  //====================================================
  // Actions
  //====================================================
  action_logDistribution(words: string[], guess: string) {
    const dist = this.getScoreCounts(words, guess);
    console.log("");
    console.log(`Distribution for guess ${guess}`);
    console.log("===============================");

    console.log("");
    Object.entries(dist).map(([k, v]: [string, ScoreCount]) => ({ score: k, count: v.count }))
                        .sort((d1, d2) => (d1.score < d2.score)? -1 : (d1.score > d2.score)? 1 : 0)
                        .forEach(d => console.log(d));
  
    const tmp = this.getProbSolveByForWord(words, 2, guess);
    console.log("tmp: ", tmp);
  }


  action_logLetterCounts(words: string[]) {
    this.logWordCountsByLetter(words);

    for (let i = 0; i < 5; ++i) {
      const counts = getLetterCountsByPosition(words, i);
      console.log();
      console.log(`Letter counts for position ${i+1}`);
      console.log("==============================");
      logLetterCounts(counts);
    }
  }


  action_logBestMaxProbIn3(words: string[]) {
    const best = this.getProbSolveBy(words, 3);
    console.log();
    console.log(`Best word to maximize getting in 3: ${best.guess} probability ${best.metric}`);
  }


  //====================================================
  // Private methods
  //====================================================
  private getScore(guess: string, secret: string): string {
    // TODO: support other scoring methods
    return getWordleScore(guess, secret);
  }

  private logWordCountsByLetter(words: string[]) {
    const counts = getWordCountsByLetter(this.secretWords);
    console.log("");
    console.log("Word counts by letter");
    console.log("=====================");
    logLetterCounts(counts);
  }

  private getProbSolveBy(words: string[], depth: number): Best {
    const len = words.length;

    const guess = words?.[0] ?? ''; // for the trivial cases

    if (len <= depth) return { guess, metric: 1 };
    if (depth === 0) return { guess, metric: 0 }; // out of guesses

    if (depth === 1) {
      return { guess, metric: 1.0 / words.length }
    }
    
    const probs = this.allWords.map(w => <Best>({
      guess: w,
      metric:  this.getProbSolveByForWord(words, depth - 1, w)
    }));
    console.log("==== getProbSolveBy ", words.length, depth, probs);

    const best = probs.reduce((acc: Best, v: Best) => {
      return (v.metric > acc.metric)? v : acc;
    }, {guess: '', metric: 0});

    console.log("===== getProbSolveBy length ", words.length, "depth", depth, ": ", best);
    return best;
  }

  private getProbSolveByForWord(words: string[], depth: number, guess: string): number {
    const dist = this.getScoreCounts(words, guess);
  
    const total = Object.values(dist).reduce((acc: number, v: ScoreCount) => {
      if (v.count > 0) {
        acc += (v.count * this.getProbSolveBy(v.remainingWords, depth - 1).metric)
      }
      return acc;
    }, 0);
    const prob = total / (words.length ?? 1);
    if (words.length !== 2315) {
      console.log("====== prob for length, depth, guess: ", words.length, depth, guess, prob);
    }
    return prob;
  }

  private getScoreCounts(words: string[], guess: string) {
    const counts = <ScoreDistribution>{};

    words.forEach((w: string) => { // (should use reduce)
      const score = this.getScore(guess, w);
      const acc = counts[score] ?? <ScoreCount>{count: 0, remainingWords: []};
      ++acc.count;
      acc.remainingWords.push(w);
      counts[score] = acc;
    });
    return counts;
  }
}