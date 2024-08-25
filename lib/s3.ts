import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3 {
	private client: S3Client;

	constructor(
		private config: {
			region: string;
			bucketName: string;
		}
	) {
		this.client = new S3Client({
			region: this.config.region,
		});
	}

	getUploadURL({ key, expiresIn }: { key: string; expiresIn: number }) {
		return getSignedUrl(
			this.client,
			new PutObjectCommand({
				Bucket: this.config.bucketName,
				Key: key,
			}),
			{
				expiresIn,
			}
		);
	}
}
