// AI analysis via NVIDIA NIM (primary) or OpenRouter (fallback)
export async function analyzeFile(content: string): Promise<string> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  const baseUrl = apiKey
    ? "https://integrate.api.nvidia.com/v1"
    : "https://openrouter.ai/api/v1";
  const key = apiKey ?? process.env.OPENROUTER_API_KEY;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: apiKey ? "deepseek-ai/deepseek-r1" : "deepseek/deepseek-r1",
      messages: [
        {
          role: "user",
          content: `Summarize this file content in 2-3 sentences:\n\n${content}`,
        },
      ],
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
