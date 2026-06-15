import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  const params = new URLSearchParams({
    client_id: process.env.KAKAO_CLIENT_ID!,
    redirect_uri: `${origin}/auth/callback`,
    response_type: "code",
  });

  return NextResponse.redirect(`https://kauth.kakao.com/oauth/authorize?${params.toString()}`);
}
