import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("CMS Features", () => {
  let testCategoryId: number;
  let testSettingKey: string;

  describe("Categories", () => {
    it("should create a new category", async () => {
      const result = await db.createCategory({
        name: "Test Category",
        description: "This is a test category",
      });
      expect(result).toBeDefined();
    });

    it("should retrieve all categories", async () => {
      const categories = await db.getCategories();
      expect(Array.isArray(categories)).toBe(true);
    });

    it("should get a category by ID", async () => {
      const categories = await db.getCategories();
      if (categories.length > 0) {
        const category = await db.getCategoryById(categories[0].id);
        expect(category).toBeDefined();
        expect(category?.id).toBe(categories[0].id);
        testCategoryId = categories[0].id;
      }
    });

    it("should update a category", async () => {
      if (testCategoryId) {
        const result = await db.updateCategory(testCategoryId, {
          name: "Updated Category",
        });
        expect(result).toBeDefined();
      }
    });

    it("should delete a category", async () => {
      if (testCategoryId) {
        const result = await db.deleteCategory(testCategoryId);
        expect(result).toBeDefined();
      }
    });
  });

  describe("Settings", () => {
    it("should update or create a setting", async () => {
      const result = await db.updateSetting("test_key", "test_value");
      expect(result).toBeDefined();
      testSettingKey = "test_key";
    });

    it("should retrieve a setting by key", async () => {
      if (testSettingKey) {
        const setting = await db.getSetting(testSettingKey);
        expect(setting).toBeDefined();
        expect(setting?.key).toBe(testSettingKey);
        expect(setting?.value).toBe("test_value");
      }
    });

    it("should retrieve all settings", async () => {
      const settings = await db.getAllSettings();
      expect(Array.isArray(settings)).toBe(true);
    });

    it("should delete a setting", async () => {
      if (testSettingKey) {
        const result = await db.deleteSetting(testSettingKey);
        expect(result).toBeDefined();
      }
    });
  });

  describe("Portfolio with Categories", () => {
    let testCategoryId: number;
    let testPortfolioId: number;

    beforeAll(async () => {
      // Create a test category first
      const categoryResult = await db.createCategory({
        name: `Portfolio Test Category ${Date.now()}`,
        description: "For testing portfolio items",
      });
      const categories = await db.getCategories();
      if (categories.length > 0) {
        testCategoryId = categories[categories.length - 1].id;
      }
    });

    it("should create a portfolio work with category", async () => {
      if (testCategoryId) {
        const result = await db.createPortfolioWork({
          title: "Test Portfolio Item",
          description: "A test portfolio item",
          imageUrl: "https://example.com/image.jpg",
          categoryId: testCategoryId,
          price: 5000,
        });
        expect(result).toBeDefined();
      }
    });

    it("should retrieve portfolio works", async () => {
      const works = await db.getPortfolioWorks();
      expect(Array.isArray(works)).toBe(true);
      if (works.length > 0) {
        testPortfolioId = works[0].id;
      }
    });

    it("should update a portfolio work", async () => {
      if (testPortfolioId) {
        const result = await db.updatePortfolioWork(testPortfolioId, {
          title: "Updated Portfolio Item",
        });
        expect(result).toBeDefined();
      }
    });

    it("should delete a portfolio work", async () => {
      if (testPortfolioId) {
        const result = await db.deletePortfolioWork(testPortfolioId);
        expect(result).toBeDefined();
      }
    });

    afterAll(async () => {
      // Clean up test category
      if (testCategoryId) {
        await db.deleteCategory(testCategoryId);
      }
    });
  });

  describe("Settings Keys", () => {
    const testSettings = {
      phone: "213123456789",
      address: "123 Main St, Algiers",
      facebook: "https://facebook.com/printart",
      instagram: "https://instagram.com/printart",
      whatsapp: "213123456789",
      logo: "https://example.com/logo.png",
    };

    it("should store all required settings", async () => {
      for (const [key, value] of Object.entries(testSettings)) {
        const result = await db.updateSetting(key, value);
        expect(result).toBeDefined();
      }
    });

    it("should retrieve all stored settings", async () => {
      const settings = await db.getAllSettings();
      const settingKeys = settings.map((s) => s.key);
      
      for (const key of Object.keys(testSettings)) {
        expect(settingKeys).toContain(key);
      }
    });

    it("should retrieve specific setting values", async () => {
      const phoneSetting = await db.getSetting("phone");
      expect(phoneSetting?.value).toBe(testSettings.phone);

      const logoSetting = await db.getSetting("logo");
      expect(logoSetting?.value).toBe(testSettings.logo);
    });

    afterAll(async () => {
      // Clean up test settings
      for (const key of Object.keys(testSettings)) {
        await db.deleteSetting(key);
      }
    });
  });
});
