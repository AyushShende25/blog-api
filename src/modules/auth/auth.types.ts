export interface ActiveUserData {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  refreshTokenId: string;
}
