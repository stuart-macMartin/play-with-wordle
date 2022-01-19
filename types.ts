export interface Options {
  useWordleSecretWords: boolean,
  useWordleAllWords: boolean,
  useWordleScoring: boolean,
  
  wantLetterCounts: boolean,

  wantMaxProbIn3: boolean, // Find word that gives best chance of winning in <= 3
  wantMaxProbIn4: boolean, // Find word that gives best chance of winning in <= 4
  wantLeastExpectedLength?: boolean,
  wantBestDistribution?: boolean
  useMinDepth?: boolean,
  


  analyzeWord: string,
}

export interface NumberByString {
  [key: string]: number;
}

export interface ScoreCount {
  count: number; // should be remainingWords.length unless remainingWords is suppressed
  remainingWords: string[];
}

export interface ScoreDistribution {
  [key: string]: ScoreCount;
}

export interface Best {
  guess: string;
  metric: number;
}