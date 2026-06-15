import { createHash } from "crypto";

// 고정 네임스페이스 UUID - 카카오 회원번호를 Supabase 사용자 UUID로 결정적으로 변환하기 위한 값
const NAMESPACE = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

export function kakaoUserId(kakaoId: string): string {
  const namespaceBytes = Buffer.from(NAMESPACE.replace(/-/g, ""), "hex");
  const nameBytes = Buffer.from(`kakao:${kakaoId}`, "utf8");
  const hash = createHash("sha1")
    .update(Buffer.concat([namespaceBytes, nameBytes]))
    .digest();

  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function kakaoUserEmail(kakaoId: string): string {
  return `kakao-${kakaoId}@payleft.local`;
}
