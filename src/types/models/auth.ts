export type LoginModel = {
  email: string;
  password: string;
};

export type RegisterModel = {
  email: string;
  password: string;
  name: string;
  age: number;
  captcha: string;
};

export type CaptchaEmailModel = {
  email: string;
};

export type LoginResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
