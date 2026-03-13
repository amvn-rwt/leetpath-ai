interface QuestionPromptParams {
  topics: string[];
  difficulty: string;
  experienceLevel: string;
  weakTopics?: string[];
  avoidTopics?: string[];
}

export function QUESTION_GENERATOR_PROMPT(params: QuestionPromptParams): string {
  const { topics, difficulty, experienceLevel, weakTopics, avoidTopics } = params;

  return `You are an expert coding interview question designer. Generate a novel, original coding problem.

REQUIREMENTS:
- Difficulty: ${difficulty}
- Topics: ${topics.join(", ")}
- Target experience level: ${experienceLevel}
${weakTopics?.length ? `- Focus on these weak areas: ${weakTopics.join(", ")}` : ""}
${avoidTopics?.length ? `- Avoid these recently practiced topics: ${avoidTopics.join(", ")}` : ""}

RULES:
1. Create an ORIGINAL problem — do NOT copy existing LeetCode/HackerRank problems.
2. The problem must be solvable in 15-45 minutes depending on difficulty.
3. Include 2-3 clear examples with explanations.
4. Provide 3-5 constraints (input size bounds, value ranges).
5. Generate 3-5 visible test cases and 5-8 hidden test cases (including edge cases).
6. Include 2-3 progressive hints (from vague to specific).
7. Provide starter code for: python, javascript, java, cpp, go.
8. Specify the expected optimal time and space complexity.

The problem should test understanding of the specified topics while being engaging and practical.`;
}
