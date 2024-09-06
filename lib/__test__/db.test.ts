import { DB } from "../db";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

//as the name suggest skip method is used for skipping the test as well as entire describe block just use .skip

describe("Test for DB", () => {
	test.skip("Should save the data in the database", async () => {
		const db = new DB<any>({
			region: "ap-south-1",
			tableName: "vidshare-video",
		});

		const doc = await db.save({
			id: "test-id-123",
			userId: "user-123",
			uplodedDateTime: Date.now(),
		});

		console.log(doc);
	});

	test("should pass proper input to the update method", async () => {
		const mockedUpdate = jest
			.spyOn(DynamoDBDocumentClient.prototype, "send")
			.mockImplementation(async () => {});

		const db = new DB<{
			id: string;
			title: string;
			description: string;
		}>({
			region: "ap-south-1",
			tableName: "vidshare-video",
		});

		await db.update({
			id: "test-id-123",
			attrs: {
				title: "new-title",
				description: "new-description",
			},
		});

		const input = mockedUpdate.mock.calls[0][0].input as any;

		expect(input.UpdateExpression).toBe("set #title = :title, #description = :description");
		expect(input.ExpressionAttributeNames).toEqual({
			"#title": "title",
			"#description": "description",
		});
		expect(input.ExpressionAttributeValues).toEqual({
			":title": "new-title",
			":description": "new-description",
		});
		expect(input.ReturnValues).toBe("ALL_NEW");
	});
});
