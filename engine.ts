import { Best, NumberByString, Options, ScoreCount, ScoreDistribution } from "./types";
import { getLetterCountsByPosition, getWordCountsByLetter, getWordleScore, logDistribution, logLetterCounts, readAllWordleWords, readAltWords, readSecretWordleWords } from "./util";

export class Engine {
  allWords: string[];
  secretWords: string[];

  metricCache: {[key: string]: Best} = {};
  foundInCacheCount = 0;

  startTime = new Date();

  constructor(private options: Options) {
    this.allWords = options.useWordleAllWords? readAllWordleWords() : readAltWords();
    this.secretWords = options.useWordleSecretWords? readSecretWordleWords() : readAltWords();
  }


  run() {
    if (this.options.analyzeWord.length === 5) {
      this.action_analyzeWord(this.secretWords, this.options.analyzeWord);
    }

    if (this.options.wantLetterCounts) {
      this.action_logLetterCounts(this.secretWords);
    }

    if (this.options.wantMaxProbIn3) {
      this.action_logBestMaxProbIn(this.secretWords, 3);
    }

    if (this.options.wantMaxProbIn4) {
      this.action_logBestMaxProbIn(this.secretWords, 4);
    }

    if (this.options.wantBestDistribution) {
      this.action_logBestDistributions(this.allWords);
    }
  }

  //====================================================
  // Actions
  //====================================================
  action_analyzeWord(words: string[], guess: string) {
    const dist = this.getScoreCounts(words, guess);
    console.log("");
    console.log(`Distribution for guess ${guess}`);
    console.log("===============================");

    console.log("");
    logDistribution(dist);
  
    const best = this.getProbSolveByForWord(words, 2, guess); // 2 remaining guesses
    console.log(`Best for ${guess}: `, best);

    this.logDebugCounts();
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


  action_logBestMaxProbIn(words: string[], depth: number) {
    this.metricCache = {};
    this.foundInCacheCount = 0;

    const best = this.getProbSolveBy(words, depth);
    console.log();
    console.log(`Best word to maximize getting in ${depth}: ${best.guess} probability ${best.metric}`);
  
  
    this.logDebugCounts();
  }

  action_logBestDistributions(words: string[]) {
    const a = words.map(w => {
      const d = this.getScoreCounts(words, w);
      const metric = Object.values(d).reduce((acc: number, v: ScoreCount) => acc + v.count * v.count, 0);
      return <Best>{ guess: w, metric };
    });

    a.sort((a, b) => (a.metric < b.metric)? -1 : (a.metric > b.metric)? 1 : 0);

    console.log("Best 100 word distributions");
    console.log("===========================");
    a.slice(0, 100).forEach(s => console.log(`${s.guess}: ${s.metric}`));
    console.log();
    console.log("Some examples:");
    ['slate', 'soare', 'roate', 'tires', 'adieu'].forEach(w => {
      const i = a.findIndex(item => item.guess === w);
      const b = a[i];
      console.log(`${b.guess}: index ${i} score ${b.metric}`);
    });
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

  private getProbSolveBy(words: string[], numAllowedGuesses: number, recursing = false): Best {
    const len = words.length;

    const guess = words?.[0] ?? ''; // for the trivial cases

    if (len <= numAllowedGuesses) return { guess, metric: 1 };
    if (numAllowedGuesses === 0) return { guess, metric: 0 }; // out of guesses

    if (numAllowedGuesses === 1) {
      return { guess, metric: 1.0 / words.length }
    }

    const key = `p_${numAllowedGuesses}_${words.length}_${words.join()}`;
    const found = this.metricCache[key];
    if (found) {
      // console.log("Found for word length ", words.length, found, "Found count:", this.foundInCacheCount, "cached:", Object.keys(this.metricCache).length);
      ++this.foundInCacheCount;
      return found;
    }
    
    // No point looking at all words once we get close
    const guessWords = (numAllowedGuesses > 3)? this.allWords : this.secretWords;
  
    // To save work, we stop if we hit 1!
    let nextReport = recursing? 500 : 1;
    let best = <Best>{guess: '', metric: 0};
    guessWords.forEach((w, index) => {
      if (best.metric < 1.0) {
        const local = this.getProbSolveByForWord(words, numAllowedGuesses - 1, w);
        if (local > best.metric) {
          best = { guess: w, metric: local}
          if (!recursing) {
            console.log("Best so far: ", best, `${100*(index+1)/guessWords.length}%`);
          }
        }
      }
      if (!recursing) {
        const percent = 100 * (index+1) / guessWords.length;
        if (percent >= nextReport) {
          const reportTime = new Date();
          const elapsed = Math.round((reportTime.getTime() - this.startTime.getTime()) / 1000);
          console.log(`${nextReport}% time: ${elapsed}sec`);
          ++nextReport;
        }
      }
    });

    this.metricCache[key] = best;

    if (numAllowedGuesses > 2) console.log("===== Best for depth ", numAllowedGuesses, "word length ", words.length, ":", best, "found count:", this.foundInCacheCount);
    return best;
  }

  quickReject1Count = 0;
  count2 = 0;
  quickReject2Count = 0;

  // additionalGuesses is # remaining guesses after this guess
  private getProbSolveByForWord(words: string[], additionalGuesses: number, guess: string): number {
    if (additionalGuesses === 0 && !words.includes(guess)) {
      return 0;
    }

    const dist = this.getScoreCounts(words, guess);
    
    // Quick rejections: return worst value so that eliminated.
    const values = Object.values(dist);
    if (values.length === 1) {
      // No new information.  Reject.
      ++this.quickReject1Count;
      return 0;
    }
    if (words.length > 50 && values.length < 25) {
      const limit = words.length / 3;
      if (values.find(v => v.count > limit)) {
        ++this.quickReject2Count;
        return 0;
      }
    }

    const total = Object.values(dist).reduce((acc: number, v: ScoreCount) => {
      if (v.count > 0) {
        const p = this.getProbSolveBy(v.remainingWords, additionalGuesses, true);
        acc += (v.count * p.metric)
      }
      return acc;
    }, 0.0);

    const prob = total / (words.length ?? 1);
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

  private logDebugCounts() {
    console.log();
    console.log("Debug counts");
    console.log("============");
    console.log("Rejected type 1:", this.quickReject1Count);
    console.log("Rejected type 2:", this.quickReject2Count);
    console.log("Word cache size: ", Object.keys(this.metricCache).length);
    console.log("Word cache usage: ", this.foundInCacheCount);
  }
}