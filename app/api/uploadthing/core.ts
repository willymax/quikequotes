import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { getDbUser } from "@/lib/auth";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  quotePhoto: f({ image: { maxFileSize: "4MB", maxFileCount: 6 } })
    .input(z.object({ quoteId: z.string() }))
    .middleware(async ({ input }) => {
      const user = await getDbUser();
      if (!user) throw new UploadThingError("Unauthorized");

      const quote = await db.quote.findUnique({
        where: { id: input.quoteId, userId: user.id },
      });
      if (!quote) throw new UploadThingError("Quote not found");

      return { quoteId: input.quoteId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { quoteId: metadata.quoteId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
