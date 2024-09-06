import { S3Handler } from "aws-lambda";
import { VideoDB } from "../entity/video";
import { EnviromentVariables } from "../lib/lambda-env";

const env = process.env as EnviromentVariables;

const video_db = new VideoDB({
	region: env.VIDEO_TABLE_REGION,
	tableName: env.VIDEO_TABLE_NAME,
});

export const handler: S3Handler = async (event) => {
	const id = event.Records[0].s3.object.key;

	await video_db.update({
		id,
		attrs: {
			status: "UPLOADED",
		},
	});
};
