// FILE PATH: src/dtos/auth.dto.ts

export class LoginDto {
  identifier: string;
  password: string;

  constructor(data: any) {
    this.identifier = data.identifier;
    this.password = data.password;
  }

  validate(): string[] {
    const errors: string[] = [];
    if (!this.identifier || this.identifier.trim().length === 0)
      errors.push("Username or email is required");
    if (!this.password || this.password.trim().length === 0)
      errors.push("Password is required");
    return errors;
  }
}

export class LoginResponseDto {
  success: boolean;
  token: string;
  user: {
    adminUserId: string;
    firstName: string;
    lastName: string;
    userName: string;
    userEmailAddress: string;
    userAccountStatus: string;
  };
  message: string;

  constructor(data: { token: string; user: any }) {
    this.success = true;
    this.token = data.token;
    this.user = data.user;
    this.message = "Login successful";
  }
}

export class LogoutResponseDto {
  success: boolean;
  message: string;

  constructor(message: string = "Logout successful") {
    this.success = true;
    this.message = message;
  }
}
