import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { text, targetLanguage } = await req.json();

        if (!text || !targetLanguage) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }
 
        const translatedText = `Traduction simulée en ${targetLanguage}: ${text}`;

        return NextResponse.json({ translatedText });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
