import { nextcloudConfig } from "@/config/nextcloud";

interface NextcloudLoginFlowResponse {
  poll: {
    token: string;
    endpoint: string;
  };
  login: string;
}

interface NextcloudCredentials {
  server: string;
  loginName: string;
  appPassword: string;
}

interface NextcloudAuthConfig {
  serverUrl: string;
  userAgent?: string;
}

export class NextcloudAuthService {
  private config: NextcloudAuthConfig;
  private pollInterval: NodeJS.Timeout | null = null;
  private maxPollAttempts = 120; // 20 minutes / 10 seconds per attempt
  private pollAttempts = 0;

  constructor(config: NextcloudAuthConfig) {
    this.config = {
      ...config,
      userAgent: config.userAgent || nextcloudConfig.userAgent,
    };
  }

  /**
   * Initiate Login Flow v2
   * Returns the login URL that should be opened in a new window/tab
   */
  async initiateLoginFlow(): Promise<{ loginUrl: string; pollToken: string }> {
    try {
      const response = await fetch(`${this.config.serverUrl}/index.php/login/v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": this.config.userAgent!,
          "Accept-Language": navigator.language || "en",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate login flow: ${response.status} ${response.statusText}`);
      }

      const data: NextcloudLoginFlowResponse = await response.json();

      return {
        loginUrl: data.login,
        pollToken: data.poll.token,
      };
    } catch (error) {
      console.error("Error initiating Nextcloud login flow:", error);
      throw new Error("Failed to connect to Nextcloud server. Please check the server URL.");
    }
  }

  /**
   * Poll for authentication completion
   * Should be called repeatedly until credentials are received or timeout
   */
  async pollForCredentials(token: string, endpoint: string): Promise<NextcloudCredentials | null> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": this.config.userAgent!,
        },
        body: `token=${encodeURIComponent(token)}`,
      });

      if (response.status === 404) {
        // Authentication not completed yet
        return null;
      }

      if (!response.ok) {
        throw new Error(`Polling failed: ${response.status} ${response.statusText}`);
      }

      const credentials: NextcloudCredentials = await response.json();
      return credentials;
    } catch (error) {
      console.error("Error polling for credentials:", error);
      return null;
    }
  }

  /**
   * Start polling for authentication completion
   * Returns a Promise that resolves when authentication is complete or times out
   */
  async waitForAuthentication(token: string, endpoint: string): Promise<NextcloudCredentials> {
    return new Promise((resolve, reject) => {
      this.pollAttempts = 0;

      const poll = async () => {
        this.pollAttempts++;

        if (this.pollAttempts > this.maxPollAttempts) {
          this.stopPolling();
          reject(new Error("Authentication timeout. Please try again."));
          return;
        }

        try {
          const credentials = await this.pollForCredentials(token, endpoint);

          if (credentials) {
            this.stopPolling();
            resolve(credentials);
            return;
          }

          // Continue polling after 10 seconds
          this.pollInterval = setTimeout(poll, 10000);
        } catch (error) {
          this.stopPolling();
          reject(error);
        }
      };

      // Start polling immediately
      poll();
    });
  }

  /**
   * Stop the polling process
   */
  stopPolling(): void {
    if (this.pollInterval) {
      clearTimeout(this.pollInterval);
      this.pollInterval = null;
    }
    this.pollAttempts = 0;
  }

  /**
   * Authenticate directly with username and password
   * This method converts regular credentials to app password if needed
   */
  async authenticateWithCredentials(username: string, password: string): Promise<NextcloudCredentials> {
    try {
      // First, try to convert to app password if this is a regular password
      const appPassword = await this.convertToAppPassword(username, password);

      const credentials: NextcloudCredentials = {
        server: this.config.serverUrl,
        loginName: username,
        appPassword: appPassword || password,
      };

      // Validate the credentials work
      const isValid = await this.validateCredentials(credentials);
      if (!isValid) {
        throw new Error("Invalid credentials");
      }

      return credentials;
    } catch (error) {
      console.error("Direct authentication error:", error);
      throw new Error("Authentication failed");
    }
  }

  /**
   * Convert username/password to app password
   */
  private async convertToAppPassword(username: string, password: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.config.serverUrl}/ocs/v2.php/core/getapppassword`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          "OCS-APIRequest": "true",
          Accept: "application/json",
          "User-Agent": this.config.userAgent!,
        },
      });

      if (response.status === 403) {
        // Already using app password
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get app password: ${response.status}`);
      }

      const data = await response.json();
      return data.ocs?.data?.apppassword || null;
    } catch (error) {
      console.error("Error converting to app password:", error);
      // Return null to indicate we should use the original password
      return null;
    }
  }

  /**
   * Validate Nextcloud credentials by making a test API call
   */
  async validateCredentials(credentials: NextcloudCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${credentials.server}/ocs/v1.php/cloud/user`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(`${credentials.loginName}:${credentials.appPassword}`)}`,
          "OCS-APIRequest": "true",
          Accept: "application/json",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error validating credentials:", error);
      return false;
    }
  }

  /**
   * Get user information from Nextcloud
   */
  async getUserInfo(credentials: NextcloudCredentials): Promise<any> {
    try {
      const response = await fetch(`${credentials.server}/ocs/v2.php/cloud/user`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${btoa(`${credentials.loginName}:${credentials.appPassword}`)}`,
          "OCS-APIRequest": "true",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json();
      return data.ocs.data;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  }

  /**
   * Delete the app password (cleanup when logging out)
   */
  async deleteAppPassword(credentials: NextcloudCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${credentials.server}/ocs/v2.php/core/apppassword`, {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${btoa(`${credentials.loginName}:${credentials.appPassword}`)}`,
          "OCS-APIRequest": "true",
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error deleting app password:", error);
      return false;
    }
  }
}

export type { NextcloudCredentials, NextcloudAuthConfig };
