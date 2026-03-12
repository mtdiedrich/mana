import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createTestPrisma } from "../test-helpers.js";
import { createApp } from "../app.js";
import type { Express } from "express";

describe("API Routes", () => {
  let prisma: PrismaClient;
  let app: Express;

  beforeEach(async () => {
    const ctx = await createTestPrisma();
    prisma = ctx.prisma;
    app = createApp(prisma);
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe("Health check", () => {
    it("GET /api/health returns ok", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("Auth routes", () => {
    it("POST /api/auth/register creates a user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe("test@example.com");
      expect(res.body.token).toBeDefined();
    });

    it("POST /api/auth/register rejects invalid input", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "bad",
        password: "short",
        displayName: "",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it("POST /api/auth/login succeeds with valid credentials", async () => {
      await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("POST /api/auth/login rejects wrong credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nobody@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });

    it("GET /api/auth/me returns user for valid token", async () => {
      const reg = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${reg.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("test@example.com");
    });

    it("GET /api/auth/me rejects without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });

  describe("Deck routes", () => {
    let token: string;

    beforeEach(async () => {
      const reg = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });
      token = reg.body.token;
    });

    it("POST /api/decks creates a deck", async () => {
      const res = await request(app)
        .post("/api/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Burn", format: "modern" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Burn");
      expect(res.body.format).toBe("modern");
    });

    it("GET /api/decks lists user decks", async () => {
      await request(app)
        .post("/api/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Burn", format: "modern" });

      const res = await request(app)
        .get("/api/decks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it("GET /api/decks/:id returns a specific deck", async () => {
      const created = await request(app)
        .post("/api/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Burn", format: "modern" });

      const res = await request(app)
        .get(`/api/decks/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Burn");
    });

    it("PUT /api/decks/:id updates a deck", async () => {
      const created = await request(app)
        .post("/api/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Old", format: "casual" });

      const res = await request(app)
        .put(`/api/decks/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "New", format: "modern" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("New");
    });

    it("DELETE /api/decks/:id deletes a deck", async () => {
      const created = await request(app)
        .post("/api/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Burn", format: "modern" });

      const res = await request(app)
        .delete(`/api/decks/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it("POST /api/decks/:id/cards adds a card", async () => {
      const created = await request(app)
        .post("/api/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Burn", format: "modern" });

      const res = await request(app)
        .post(`/api/decks/${created.body.id}/cards`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          scryfallId: "scry-123",
          name: "Lightning Bolt",
          qty: 4,
          cardData: { mana_cost: "{R}" },
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Lightning Bolt");
      expect(res.body.qty).toBe(4);
    });

    it("DELETE /api/decks/:id/cards/:cardId removes a card", async () => {
      const deck = await request(app)
        .post("/api/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Burn", format: "modern" });

      const card = await request(app)
        .post(`/api/decks/${deck.body.id}/cards`)
        .set("Authorization", `Bearer ${token}`)
        .send({ scryfallId: "scry-123", name: "Lightning Bolt", qty: 4, cardData: {} });

      const res = await request(app)
        .delete(`/api/decks/${deck.body.id}/cards/${card.body.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it("rejects unauthenticated requests", async () => {
      const res = await request(app).get("/api/decks");
      expect(res.status).toBe(401);
    });
  });

  describe("Collection routes", () => {
    let token: string;

    beforeEach(async () => {
      const reg = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });
      token = reg.body.token;
    });

    it("GET /api/collection returns empty for new user", async () => {
      const res = await request(app)
        .get("/api/collection")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("POST /api/collection adds a card", async () => {
      const res = await request(app)
        .post("/api/collection")
        .set("Authorization", `Bearer ${token}`)
        .send({
          scryfallId: "scry-123",
          name: "Lightning Bolt",
          qty: 4,
          cardData: { mana_cost: "{R}" },
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("Lightning Bolt");
    });

    it("PUT /api/collection/:id updates quantity", async () => {
      const created = await request(app)
        .post("/api/collection")
        .set("Authorization", `Bearer ${token}`)
        .send({ scryfallId: "scry-123", name: "Lightning Bolt", qty: 2, cardData: {} });

      const res = await request(app)
        .put(`/api/collection/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ qty: 10 });

      expect(res.status).toBe(200);
      expect(res.body.qty).toBe(10);
    });

    it("DELETE /api/collection/:id removes a card", async () => {
      const created = await request(app)
        .post("/api/collection")
        .set("Authorization", `Bearer ${token}`)
        .send({ scryfallId: "scry-123", name: "Lightning Bolt", qty: 4, cardData: {} });

      const res = await request(app)
        .delete(`/api/collection/${created.body.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it("rejects unauthenticated requests", async () => {
      const res = await request(app).get("/api/collection");
      expect(res.status).toBe(401);
    });
  });
});
