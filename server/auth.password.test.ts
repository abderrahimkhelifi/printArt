import { describe, expect, it } from "vitest";
import { verifyAdminCredentials } from "./auth";

describe("admin password verification", () => {
  it("should verify admin credentials with bcrypt hashed password", async () => {
    // Test with correct credentials
    const result = await verifyAdminCredentials(
      "univ08000@gmail.com",
      "Tadjeddine08"
    );
    expect(result).toBe(true);
  });

  it("should reject incorrect password", async () => {
    // Test with incorrect password
    const result = await verifyAdminCredentials(
      "univ08000@gmail.com",
      "WrongPassword123"
    );
    expect(result).toBe(false);
  });

  it("should reject incorrect email", async () => {
    // Test with incorrect email
    const result = await verifyAdminCredentials(
      "wrong@example.com",
      "Tadjeddine08"
    );
    expect(result).toBe(false);
  });
});
