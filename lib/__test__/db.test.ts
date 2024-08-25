import { DB } from "../db";

//as the name suggest skip method is used for skipping the test as well as entire describe block just use .skip

describe.skip("Test for DB", () => {
	test("Should save the data in the database", async () => {
		const db = new DB({
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
});
