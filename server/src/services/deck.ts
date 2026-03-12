import { PrismaClient } from "@prisma/client";
import type { DeckResponse, DeckCardResponse } from "../types.js";

interface CreateDeckInput {
  name: string;
  format: string;
}

interface UpdateDeckInput {
  name?: string;
  format?: string;
}

interface AddCardInput {
  scryfallId: string;
  name: string;
  qty: number;
  cardData: Record<string, unknown>;
}

interface UpdateCardInput {
  qty: number;
}

type CardResolver = (name: string) => Promise<Record<string, unknown>>;

function toDeckResponse(deck: {
  id: string;
  name: string;
  format: string;
  createdAt: Date;
  updatedAt: Date;
  cards: { id: string; scryfallId: string; name: string; qty: number; cardData: string }[];
}): DeckResponse {
  return {
    id: deck.id,
    name: deck.name,
    format: deck.format,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
    cards: deck.cards.map(toCardResponse),
  };
}

function toCardResponse(card: {
  id: string;
  scryfallId: string;
  name: string;
  qty: number;
  cardData: string;
}): DeckCardResponse {
  return {
    id: card.id,
    scryfallId: card.scryfallId,
    name: card.name,
    qty: card.qty,
    cardData: JSON.parse(card.cardData),
  };
}

export async function createDeck(
  prisma: PrismaClient,
  userId: string,
  input: CreateDeckInput
): Promise<DeckResponse> {
  const deck = await prisma.deck.create({
    data: {
      name: input.name,
      format: input.format,
      userId,
    },
    include: { cards: true },
  });
  return toDeckResponse(deck);
}

export async function getUserDecks(prisma: PrismaClient, userId: string): Promise<DeckResponse[]> {
  const decks = await prisma.deck.findMany({
    where: { userId },
    include: { cards: true },
    orderBy: { updatedAt: "desc" },
  });
  return decks.map(toDeckResponse);
}

export async function getDeck(
  prisma: PrismaClient,
  userId: string,
  deckId: string
): Promise<DeckResponse | null> {
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    include: { cards: true },
  });
  return deck ? toDeckResponse(deck) : null;
}

export async function updateDeck(
  prisma: PrismaClient,
  userId: string,
  deckId: string,
  input: UpdateDeckInput
): Promise<DeckResponse | null> {
  const existing = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!existing) return null;

  const deck = await prisma.deck.update({
    where: { id: deckId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.format !== undefined && { format: input.format }),
    },
    include: { cards: true },
  });
  return toDeckResponse(deck);
}

export async function deleteDeck(
  prisma: PrismaClient,
  userId: string,
  deckId: string
): Promise<boolean> {
  const existing = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!existing) return false;

  await prisma.deck.delete({ where: { id: deckId } });
  return true;
}

export async function addCardToDeck(
  prisma: PrismaClient,
  userId: string,
  deckId: string,
  input: AddCardInput
): Promise<DeckCardResponse> {
  // Verify deck belongs to user
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) throw new Error("Deck not found");

  // Upsert: if card already exists in deck, increment qty
  const existing = await prisma.deckCard.findUnique({
    where: { deckId_scryfallId: { deckId, scryfallId: input.scryfallId } },
  });

  if (existing) {
    const updated = await prisma.deckCard.update({
      where: { id: existing.id },
      data: { qty: existing.qty + input.qty },
    });
    return toCardResponse(updated);
  }

  const card = await prisma.deckCard.create({
    data: {
      deckId,
      scryfallId: input.scryfallId,
      name: input.name,
      qty: input.qty,
      cardData: JSON.stringify(input.cardData),
    },
  });
  return toCardResponse(card);
}

export async function updateDeckCard(
  prisma: PrismaClient,
  userId: string,
  deckId: string,
  cardId: string,
  input: UpdateCardInput
): Promise<DeckCardResponse | null> {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) return null;

  const card = await prisma.deckCard.findFirst({ where: { id: cardId, deckId } });
  if (!card) return null;

  const updated = await prisma.deckCard.update({
    where: { id: cardId },
    data: { qty: input.qty },
  });
  return toCardResponse(updated);
}

export async function removeCardFromDeck(
  prisma: PrismaClient,
  userId: string,
  deckId: string,
  cardId: string
): Promise<boolean> {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) return false;

  const card = await prisma.deckCard.findFirst({ where: { id: cardId, deckId } });
  if (!card) return false;

  await prisma.deckCard.delete({ where: { id: cardId } });
  return true;
}

export async function importDecklist(
  prisma: PrismaClient,
  userId: string,
  deckId: string,
  text: string,
  resolveCard: CardResolver
): Promise<DeckCardResponse[]> {
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId } });
  if (!deck) throw new Error("Deck not found");

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: DeckCardResponse[] = [];

  for (const line of lines) {
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (!match) continue;

    const qty = parseInt(match[1], 10);
    const name = match[2].trim();

    const cardData = await resolveCard(name);
    const scryfallId = (cardData as { id?: string }).id ?? name;

    const card = await addCardToDeck(prisma, userId, deckId, {
      scryfallId,
      name,
      qty,
      cardData,
    });
    results.push(card);
  }

  return results;
}
