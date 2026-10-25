import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { and, desc, eq } from "drizzle-orm";
import {
  AddFavoriteBody,
  AddFavoriteResponse,
  ListFavoritesResponse,
  RemoveFavoriteParams,
} from "@workspace/api-zod";
import { db, favoritesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/favorites", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const favorites = await db
    .select({
      foodId: favoritesTable.foodId,
      createdAt: favoritesTable.createdAt,
    })
    .from(favoritesTable)
    .where(eq(favoritesTable.userId, userId))
    .orderBy(desc(favoritesTable.createdAt));

  res.json(ListFavoritesResponse.parse(favorites));
});

router.put("/favorites", async (req, res): Promise<void> => {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const parsed = AddFavoriteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [inserted] = await db
    .insert(favoritesTable)
    .values({ userId, foodId: parsed.data.foodId })
    .onConflictDoNothing()
    .returning({
      foodId: favoritesTable.foodId,
      createdAt: favoritesTable.createdAt,
    });

  const favorite =
    inserted ??
    (
      await db
        .select({
          foodId: favoritesTable.foodId,
          createdAt: favoritesTable.createdAt,
        })
        .from(favoritesTable)
        .where(
          and(
            eq(favoritesTable.userId, userId),
            eq(favoritesTable.foodId, parsed.data.foodId),
          ),
        )
        .limit(1)
    )[0];

  if (!favorite) {
    res.status(500).json({ error: "Could not save favorite" });
    return;
  }

  res.json(AddFavoriteResponse.parse(favorite));
});

router.delete("/favorites/:foodId", async (req, res): Promise<void> => {
  const parsed = RemoveFavoriteParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  await db
    .delete(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, userId),
        eq(favoritesTable.foodId, parsed.data.foodId),
      ),
    );

  res.sendStatus(204);
});

export default router;
