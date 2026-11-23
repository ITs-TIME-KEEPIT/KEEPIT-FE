// shortcut: 서버 주소를 그대로 둠, 배포 환경이 생기면 EXPO_PUBLIC_API_BASE_URL로 분리
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://43.203.239.171:8080';

// shortcut: 로그인 API 전까지 조회자 id 고정 (서버 기준 1=옷 주인, 2=대여자)
export const TEMP_USER_ID = 1;

/* 서버 공통 응답 형식 */
type ApiResponse<T> = {
  success: boolean;
  code: string;
  httpStatus: number;
  message: string;
  data: T;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

type Query = Record<string, string | number | undefined>;

// 성공이면 data만 돌려주고, 실패 응답과 네트워크 오류는 모두 ApiError로 던집니다
export async function apiGet<T>(path: string, query: Query = {}): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.append(key, String(value));
  }
  const qs = params.toString();

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}${qs ? `?${qs}` : ''}`);
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다.', 0);
  }

  return unwrapResponse<T>(res);
}

export async function apiPost<T>(path: string, payload: FormData | object): Promise<T> {
  const multipart = payload instanceof FormData;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: multipart ? undefined : { 'Content-Type': 'application/json' },
      body: multipart ? payload : JSON.stringify(payload),
    });
  } catch {
    throw new ApiError(
      '서버 응답을 확인할 수 없어요. 다시 신청하거나 등록하기 전에 처리 여부를 확인해주세요.',
      0,
    );
  }
  if (res.status === 401 || res.status === 403) {
    throw new ApiError('서버에서 인증 또는 권한을 확인할 수 없어요.', res.status);
  }
  return unwrapResponse<T>(res);
}

async function unwrapResponse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || !body?.success) {
    throw new ApiError(body?.message ?? '요청에 실패했습니다.', res.status, body?.code);
  }
  return body.data;
}
