import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Vérification stricte du mot de passe admin
    if (password === "0574263022Ga") {
      const cookieStore = cookies();
      cookieStore.set({
        name: "admin_session",
        value: "true",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 jour
        path: "/",
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}