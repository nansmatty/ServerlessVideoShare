import { S3 } from "../s3";

describe("Test for S3", () => {
	test("should return the signed-url properly", async () => {
		const s3 = new S3({
			bucketName: "test-bucket",
			region: "ap-south-1",
		});

		const url = await s3.getUploadURL({
			key: "test.png",
			expiresIn: 60,
		});

		expect(url.includes("test-bucket")).toBe(true);
		expect(url.includes("test.png")).toBe(true);
	});
});
