/**
 * kakao.ts — 카카오 사용자 ID/이메일 변환 유틸리티
 *
 * Supabase는 사용자를 UUID로 식별합니다.
 * 카카오는 사용자를 숫자 ID(예: 1234567890)로 식별합니다.
 *
 * 이 파일은 카카오 ID를 Supabase 호환 UUID로 결정론적(deterministic)으로 변환합니다.
 * "결정론적"이란, 같은 카카오 ID를 넣으면 항상 같은 UUID가 나온다는 뜻입니다.
 * 이를 통해 로그인할 때마다 동일한 Supabase 사용자 계정에 연결할 수 있습니다.
 *
 * 변환 알고리즘: UUID v5 (RFC 4122) — SHA-1 해시 기반
 */

import { createHash } from "crypto";

// 고정 네임스페이스 UUID: 카카오 ID를 UUID로 변환할 때 해시 입력에 포함되는 시드값입니다.
// 이 값이 바뀌면 기존 사용자들의 UUID가 모두 바뀌므로 절대 변경하면 안 됩니다.
const NAMESPACE = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

/**
 * 카카오 숫자 ID를 Supabase 호환 UUID v5로 변환합니다.
 *
 * 예: "1234567890" → "xxxxxxxx-xxxx-5xxx-yxxx-xxxxxxxxxxxx" 형태의 UUID
 */
export function kakaoUserId(kakaoId: string): string {
  const namespaceBytes = Buffer.from(NAMESPACE.replace(/-/g, ""), "hex");
  const nameBytes = Buffer.from(`kakao:${kakaoId}`, "utf8");

  // 네임스페이스 + 이름을 이어붙여 SHA-1 해시를 생성합니다
  const hash = createHash("sha1")
    .update(Buffer.concat([namespaceBytes, nameBytes]))
    .digest();

  // UUID v5 규격: 버전(5)과 변형(variant) 비트를 지정된 위치에 설정합니다
  hash[6] = (hash[6] & 0x0f) | 0x50; // 버전 5 표시
  hash[8] = (hash[8] & 0x3f) | 0x80; // RFC 4122 변형(variant) 표시

  // 16바이트 해시를 "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 형식의 UUID 문자열로 변환합니다
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * 카카오 ID로 가상의 이메일 주소를 생성합니다.
 *
 * Supabase auth는 이메일 기반으로 작동하기 때문에,
 * 카카오 로그인 사용자에게도 내부적으로 사용할 이메일이 필요합니다.
 * 실제로 존재하는 이메일이 아닌, 형식만 맞춘 가상 주소입니다.
 */
export function kakaoUserEmail(kakaoId: string): string {
  return `kakao-${kakaoId}@payleft.local`;
}
