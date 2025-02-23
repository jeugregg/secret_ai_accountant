import Together from "together-ai";

export async function ocr({
  fileBuffer,
  apiKey = process.env.TOGETHER_API_KEY,
  model = "Llama-3.2-90B-Vision",
}: {
    fileBuffer: string;
  apiKey?: string;
  model?: "Llama-3.2-90B-Vision" | "Llama-3.2-11B-Vision" | "free";
}) {
  const visionLLM =
    model === "free"
      ? "meta-llama/Llama-Vision-Free"
      : `meta-llama/${model}-Instruct-Turbo`;

  const together = new Together({
    apiKey,
  });

  let finalMarkdown = await getMarkDown({ together, visionLLM, fileBuffer });

  return finalMarkdown;
}

async function getMarkDown({
  together,
  visionLLM,
  fileBuffer,
}: {
  together: Together;
  visionLLM: string;
  fileBuffer: string;
}) {
  const systemPrompt = `Convert the provided image into Markdown format. Ensure that all content from the page is included, such as headers, footers, subtexts, images (with alt text if possible), tables, and any other elements.

  Requirements:

  - Output Only Markdown: Return solely the Markdown content without any additional explanations or comments.
  - No Delimiters: Do not use code fences or delimiters like \`\`\`markdown.
  - Complete Content: Do not omit any part of the page, including headers, footers, and subtext.
  `;

  //const finalImageUrl = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

  const output = await together.chat.completions.create({
    model: visionLLM,
    messages: [
      {
        role: "user",
        // @ts-expect-error
        content: [
          { type: "text", text: systemPrompt },
          {
            type: "image_url",
            image_url: {
              url: fileBuffer,
            },
          },
        ],
      },
    ],
  });

  return output.choices[0].message.content;
}

