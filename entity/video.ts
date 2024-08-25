import { z } from "zod";
import { DB } from "../lib/db";

export const videoEntity = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	description: z.string().optional(),
	uploadedDateTime: z.number(),
	tags: z.array(z.string()).optional(),
	status: z.enum(["NOT_UPLOADED", "UPLOADED", "PROCESSING", "READY"]),
	// sizes: z.array(z.string()).optional(),
});

export const createDoc = (props: z.infer<typeof videoEntity>) => {
	return props;
};

export class VideoDB extends DB<z.infer<typeof videoEntity>> {}
