import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(request) {
    try {
        const { interview_id, conversation, questions } = await request.json();

        console.log(questions);

        if (!interview_id || !conversation || !questions) {
            return NextResponse.json(
                { message: "interview_id, conversation, and questions are required" },
                { status: 400 }
            );
        }

        const conversationText = conversation
            .map(msg => `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.text}`)
            .join('\n\n');

        const questionsList = questions
            .map((q, idx) => `Q${idx + 1}: ${q.question_text?.question || q.question}`)
            .join('\n');

        const prompt = `
You are an expert interview evaluator. 
Analyze the candidate's answers based on the questions asked.

${questionsList}

Conversation:
${conversationText}

RULES:
- Match each Q# to the first candidate response
- If no answer found, mark "Unable to answer"
- Score 0-10
- Give short, constructive feedback

RETURN ONLY VALID JSON. NO MARKDOWN, NO EXTRAS.

{
  "evaluations": [
    {
      "question_number": 1,
      "answer_text": "",
      "score": 0,
      "feedback": ""
    }
  ]
}
`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);

        let raw = result.response.text()
            .trim()
            .replace(/```json/g, "")
            .replace(/```/g, "");
        raw = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);

        const analysis = JSON.parse(raw);

        if (!analysis?.evaluations?.length) {
            throw new Error("Model returned no evaluations");
        }

        // 🔹 Save each question with logging
        const updateOps = analysis.evaluations.map(async (evaluation, index) => {
            console.log(index)
            const q = questions[index];
            if (!q) {
                console.warn(`⚠️ Question missing at index ${index}`);
                return null;
            }

            console.log(`💾 Updating question ID: ${q.id}, Score: ${evaluation.score}`);

            try {
                await adminDB.collection("interview_qna").doc(q.id).update({
                    answer_text: evaluation.answer_text,
                    score: evaluation.score,
                    feedback: evaluation.feedback,
                    answered_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                console.log(`✅ Question ID ${q.id} updated successfully`);
            } catch (err) {
                console.error(`❌ Failed to update question ID ${q.id}:`, err.message);
            }
        });

        await Promise.all(updateOps.filter(p => p !== null));

        const avgScore = Number(
            (analysis.evaluations.reduce((s, x) => s + x.score, 0) / analysis.evaluations.length).toFixed(1)
        );

        return NextResponse.json({
            success: true,
            message: "Interview analyzed successfully",
            stats: {
                average_score: avgScore,
                evaluations: analysis.evaluations
            }
        });
    } catch (err) {
        console.error("❌ Interview analysis failed", err);

        return NextResponse.json(
            {
                success: false,
                error: err.message
            },
            { status: 500 }
        );
    }
}
