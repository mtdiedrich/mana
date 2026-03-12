import { PrismaClient } from "@prisma/client";
import type { CollectionCardResponse } from "../types.js";

interface AddCardInput {
  scryfallId: string;
  name: string;
  qty: number;
  cardData: Record<string, unknown>;
}

interface UpdateCardInput {
  qty: number;
}

function toResponse(card: {
  id: string;
  scryfallId: string;
  name: string;
  qty: number;
  cardData: string;
}): CollectionCardResponse {
  return {
    id: card.id,
    scryfallId: card.scryfallId,
    name: card.name,
    qty: card.qty,
    cardData: JSON.parse(card.cardData),
  };
}

export async function getCollection(
  prisma: PrismaClient,
  userId: string
): Promise<CollectionCardResponse[]> {
  const cards = await prisma.collectionCard.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return cards.map(toResponse);
}

export async function addToCollection(
  prisma: PrismaClient,
  userId: string,
  input: AddCardInput
): Promise<CollectionCardResponse> {
  const existing = await prisma.collectionCard.findUnique({
    where: { userId_scryfallId: { userId, scryfallId: input.scryfallId } },
  });

  if (existing) {
    const updated = await prisma.collectionCard.update({
      where: { id: existing.id },
      data: { qty: existing.qty + input.qty },
    });
    return toResponse(updated);
  }

  const card = await prisma.collectionCard.create({
    data: {
      userId,
      scryfallId: input.scryfallId,
      name: input.name,
      qty: input.qty,
      cardData: JSON.stringify(input.cardData),
    },
  });
  return toResponse(card);
}

export async function updateCollectionCard(
  prisma: PrismaClient,
  userId: string,
  cardId: string,
  input: UpdateCardInput
): Promise<CollectionCardResponse | null> {
  const card = await prisma.collectionCard.findFirst({
    where: { id: cardId, userId },
  });
  if (!card) return null;

  const updated = await prisma.collectionCard.update({
    where: { id: cardId },
    data: { qty: input.qty },
  });
  return toResponse(updated);
}

export async function removeFromCollection(
  prisma: PrismaClient,
  userId: string,
  cardId: string
): Promise<boolean> {
  const card = await prisma.collectionCard.findFirst({
    where: { id: cardId, userId },
  });
  if (!card) return false;

  await prisma.collectionCard.delete({ where: { id: cardId } });
  return true;
}
