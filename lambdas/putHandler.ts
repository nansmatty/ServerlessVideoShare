import { z } from "zod";
import { S3 } from "../lib/s3";
import { VideoDB } from "../entity/video";
import { v4 } from "uuid";
import { withBodyValidation } from "../lib/handlers/apiWrapper";
import { EnviromentVariables } from "../lib/lambda-env";

const env = process.env as EnviromentVariables;

const video_db = new VideoDB({
	region: env.VIDEO_TABLE_REGION,
	tableName: env.VIDEO_TABLE_NAME,
});
const s3 = new S3({
	region: env.S3_BUCKET_REGION,
	bucketName: env.S3_BUCKET_NAME,
});

export const handler = withBodyValidation({
	schema: z.object({
		userId: z.string(),
		title: z.string(),
		description: z.string().optional(),
		tags: z.array(z.string()).optional(),
	}),
	async handler({ userId, title, description, tags }) {
		const id = v4();

		await video_db.save({
			id,
			status: "NOT_UPLOADED",
			title,
			userId,
			description,
			tags,
			uploadedDateTime: Date.now(),
		});

		return {
			uploadUrl: await s3.getUploadURL({
				key: id,
				expiresIn: 60 * 10,
			}),
		};
	},
});
