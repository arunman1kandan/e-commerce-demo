import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API });

export async function groqHandler( prompt : string ) {
  const chatCompletion = await getGroqChatCompletion( prompt );
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion( prompt : string ) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-8b-8192",
  });
}
