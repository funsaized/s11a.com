import { z } from "zod";

// shared between browser and server
export const articleViewsInputSchema = z.object({
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});
