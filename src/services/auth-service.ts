interface AuthResponse {
  success: boolean;
  credentials?: {
    server: string;
    loginName: string;
    appPassword: string;
  };
  userInfo?: {
    id: string;
    userid: string;
    displayname: string;
    email: string;
    emailAddress: string;
    groups: string[];
    avatar: string;
  };
  error?: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  static async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error instanceof Error ? error.message : "Authentication failed");
    }
  }

  /**
   * Logout user and clean up app password
   */
  static async logout(username: string, appPassword: string): Promise<LogoutResponse> {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, appPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.warn("Logout cleanup failed, but proceeding with logout");
      }

      return data;
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the API call fails, we return success to allow local logout
      return {
        success: true,
        message: "Logout completed (cleanup may have failed)",
      };
    }
  }
}

export type { AuthResponse, LogoutResponse };
