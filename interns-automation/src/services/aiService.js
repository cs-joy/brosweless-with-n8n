import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateComment = async (postText) => {
    const prompt = `
You are a professional expat community member.

Analyze the following post and write a natural, friendly, human-like comment.

Post:
"${postText}"

Comment:
`;

    const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
};

export const generatePost = async (topic = "expat life") => {
    const prompt = `
Write a natural post for an expat community like InterNations.

Topic: ${topic}

Requirements:
- Friendly tone
- Not promotional
- Encourage discussion
- 2–4 sentences max
`;

    const res = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content.trim();
};