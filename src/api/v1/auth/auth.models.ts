type User = {
    id: string;
    username: string;
    email: string | undefined;
    role: string;
    icon_url: string | undefined;
};

export interface UserRegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface UserRegisterResponse {
    user: User;
    accessToken: string | undefined;
    refreshToken: string | undefined;
}

export interface UserLoginRequest {
    email: string;
    password: string;
}

export interface UserLoginResponse {
    user: User;
    accessToken: string | undefined;
    refreshToken: string | undefined;
}
