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
        // If API fails, fallback to mock authentication for development
        console.warn("API authentication failed, using mock authentication");
        return this.mockLogin(username, password);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      console.warn("API unavailable, using mock authentication");
      return this.mockLogin(username, password);
    }
  }

  /**
   * Mock authentication for development/testing
   */
  private static async mockLogin(username: string, password: string): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simple password validation for demo
    if (password.length < 3) {
      throw new Error("Invalid credentials");
    }

    let groups: string[] = ["users"];
    if (username.toLowerCase().includes("admin")) {
      groups = ["admin"];
    } else if (username.toLowerCase().includes("editor")) {
      groups = ["editors"];
    }

    return {
      success: true,
      credentials: {
        server: "mock-server",
        loginName: username,
        appPassword: "mock-app-password",
      },
      userInfo: {
        id: Math.floor(Math.random() * 1000).toString(),
        userid: username,
        displayname: username.charAt(0).toUpperCase() + username.slice(1),
        email: `${username}@example.com`,
        emailAddress: `${username}@example.com`,
        groups,
        avatar: "",
      },
    };
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
