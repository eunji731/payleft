import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { kakaoUserEmail, kakaoUserId } from "@/lib/kakao";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.KAKAO_CLIENT_ID!,
      client_secret: process.env.KAKAO_CLIENT_SECRET ?? "",
      redirect_uri: `${origin}/auth/callback`,
      code,
    }),
  });

  if (!tokenRes.ok) {
    console.error("[kakao callback] token exchange failed", await tokenRes.text());
    return NextResponse.redirect(`${origin}/login`);
  }

  const { access_token } = await tokenRes.json();

  const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!profileRes.ok) {
    console.error("[kakao callback] profile fetch failed", await profileRes.text());
    return NextResponse.redirect(`${origin}/login`);
  }

  const profile = await profileRes.json();
  const kakaoId = String(profile.id);
  const nickname: string =
    profile.kakao_account?.profile?.nickname ?? profile.properties?.nickname ?? "사용자";

  const userId = kakaoUserId(kakaoId);
  const email = kakaoUserEmail(kakaoId);

  const admin = createAdminClient();

  const { data: existing } = await admin.auth.admin.getUserById(userId);

  if (existing?.user) {
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { kakao_id: kakaoId, nickname, provider: "kakao" },
    });
  } else {
    const { error: createError } = await admin.auth.admin.createUser({
      id: userId,
      email,
      email_confirm: true,
      user_metadata: { kakao_id: kakaoId, nickname, provider: "kakao" },
    });

    if (createError) {
      console.error("[kakao callback] createUser failed", createError);
      return NextResponse.redirect(`${origin}/login`);
    }
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkError || !linkData) {
    console.error("[kakao callback] generateLink failed", linkError);
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
  });

  if (verifyError) {
    console.error("[kakao callback] verifyOtp failed", verifyError);
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}/`);
}
