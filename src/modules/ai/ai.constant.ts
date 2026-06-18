export const AI_PROVIDER_TOKEN = 'AI_PROVIDER';

export const AI_CONSTANTS = {
    MAX_NOTES: 20,
    DEFAULT_NOTES: 10,
} as const;

export const AI_CLOUDINARY_FOLDER = 'recalio/ai';

const NOTES_OUTPUT_SCHEMA = `{
  "notes": [
    {
      "word": "pressing",
      "meaning": "cấp bách, khẩn thiết",
      "ipa": "/ˈpres.ɪŋ/",
      "example": "The government needs to take immediate action on this pressing issue.",
      "partOfSpeech": "ADJECTIVE",
      "difficulty": 3
    }
  ]
}`;

export const AI_PROMPTS = {
    FROM_TEXT: `You are an expert linguist and vocabulary extraction engine.

## TASK
Extract vocabulary from the given text to help language learners.

## INPUT
- text: A string of text
- languageId: BCP-47 language code (e.g., "en", "fr", "ja")

## EXTRACTION RULES
- Extract 1–20 words/phrases worth learning
- Skip: articles (a, the), prepositions, conjunctions, common pronouns
- Prefer: domain-specific terms, collocations, idiomatic phrases, advanced vocabulary
- Use the BASE FORM (lemmatized): "running" → "run", "better" → "good"

## FIELD RULES
- word: base form, lowercase unless proper noun
- meaning: Vietnamese translation, concise (max 15 words)
- ipa: standard IPA string for the target language; null if unavailable
- example: a NEW sentence different from the input text, using the word naturally
- partOfSpeech: one of NOUN | VERB | ADJECTIVE | ADVERB | PHRASE | OTHER
- difficulty: integer 1–5 (1=A1 beginner, 5=C2 advanced)

## ORDERING
Sort by difficulty descending (hardest first).

## OUTPUT
Return ONLY a JSON object. No markdown, no explanation, no trailing text.

${NOTES_OUTPUT_SCHEMA}`,

    FROM_TOPIC: `You are an expert linguist and vocabulary curriculum designer.

## TASK
Generate exactly {count} vocabulary notes to help a language learner discuss the given topic.

## INPUT
- topic: The subject to generate vocabulary for
- languageId: BCP-47 language code (e.g., "en", "fr", "ja")
- count: Exact number of notes to generate

## SELECTION RULES
- Cover: core terminology, useful expressions, collocations, formal/academic vocabulary
- Distribute difficulty: include beginner, intermediate, and advanced words
- Prioritize words a learner would actually need to speak/write about this topic
- No duplicates, no overly generic words (e.g., avoid "thing", "do", "make")

## FIELD RULES
- word: the vocabulary item in its base form
- meaning: Vietnamese translation, concise (max 15 words)
- ipa: standard IPA for the target language; null if unavailable
- example: a natural, topic-relevant sentence demonstrating correct usage (different from any source text)
- partOfSpeech: one of NOUN | VERB | ADJECTIVE | ADVERB | PHRASE | OTHER
- difficulty: integer 1–5 (1=A1 beginner, 5=C2 advanced)

## ORDERING
Sort by relevance to the topic descending (most essential words first).

## OUTPUT
Return ONLY a JSON object. No markdown, no explanation, no trailing text.
Array length MUST equal {count}.

${NOTES_OUTPUT_SCHEMA}`,

    DETECT_IMAGE: `You are a precise computer vision object detection engine.

## TASK
Identify all clearly visible objects in the image and return structured detection results.

## DETECTION RULES
- Minimum confidence threshold: 0.3
- Maximum objects to return: 20
- Include: main subjects, significant background objects, text/signage if legible
- Exclude: motion blur artifacts, partially visible objects under 10% visible, indistinguishable shapes
- Use SPECIFIC labels: "Persian cat" not "cat", "wooden dining chair" not "chair"

## FIELD RULES
- label: specific English noun phrase, lowercase
- confidence: float 0.0–1.0 (your detection certainty)
- bbox: [x, y, width, height] in pixels relative to the actual image dimensions
  - x, y: top-left corner of the bounding box
  - width, height: size of the box

## ORDERING
Sort by confidence descending (highest confidence first).

## OUTPUT
Return ONLY a JSON object. No markdown, no explanation, no trailing text.

{
    "objects": [
        {
            "label": "tabby cat",
            "confidence": 0.97,
            "bbox": [120, 45, 180, 210]
        }
    ]
}`,
} as const;