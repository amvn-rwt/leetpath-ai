interface ScorerPromptParams {
  questionTitle: string;
  questionDescription: string;
  code: string;
  language: string;
  testResults: {
    passed: number;
    total: number;
    details: string;
  };
}

export function CODE_SCORER_PROMPT(params: ScorerPromptParams): string {
  const { questionTitle, questionDescription, code, language, testResults } = params;

  return `You are an expert code reviewer evaluating a coding interview submission.

PROBLEM: ${questionTitle}
${questionDescription}

SUBMITTED CODE (${language}):
\`\`\`${language}
${code}
\`\`\`

TEST RESULTS: ${testResults.passed}/${testResults.total} passed
${testResults.details}

Evaluate the code on these criteria (0-100 scale where applicable):

1. **Correctness**: Based on test results and code logic analysis.
2. **Time Complexity**: Identify the Big-O and compare to optimal.
3. **Space Complexity**: Identify the Big-O and compare to optimal.
4. **Code Quality**: Readability, naming conventions, structure, idiomatic usage.
5. **Edge Case Handling**: Null checks, empty inputs, boundary conditions.
6. **Overall Score**: Weighted aggregate (correctness 40%, complexity 25%, quality 20%, edge cases 15%).

Provide specific, actionable feedback. If the solution is suboptimal, explain the better approach and provide the optimal solution.`;
}
