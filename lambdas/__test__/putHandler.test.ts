/**
 * TODO for put handler
 * Should validate the body properly
 * Body should contain
 *    userId <string>
 *    title <string>
 *    description <string>
 *    tags? <string>
 * If the valid body is passed, save the data in the database
 * Create a pre-signed url
 * Send that url to the client
 */

import { DB } from "../../lib/db";
import { S3 } from "../../lib/s3";
import { handler } from "../putHandler";

describe("Test for the video put handler", () => {
	beforeEach(() => {
		jest.spyOn(DB.prototype, "save").mockImplementation((() => {}) as any);
		jest
			.spyOn(S3.prototype, "getUploadURL")
			.mockImplementation((() => "http://upload-url.com") as any);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test("Should return a 400 statusCode if empty object is passed", async () => {
		const res = await (handler as any)({ body: JSON.stringify({}) });
		expect(res.statusCode).toBe(400);
	});

	test("Should call db save function if proper body data is passed", async () => {
		const spySave = jest.spyOn(DB.prototype, "save");

		spySave.mockImplementation((async () => {}) as any);

		const res = await (handler as any)({
			body: JSON.stringify({
				userId: "user-123",
				title: "Cat video",
			}),
		});

		expect(spySave).toHaveBeenCalled();
	});

	test.skip("Should pass the proper values to the db save function", async () => {
		const spySave = jest.spyOn(DB.prototype, "save");

		spySave.mockImplementation((async () => {}) as any);

		const res = await (handler as any)({
			body: JSON.stringify({
				userId: "user-123",
				title: "Cat video",
			}),
		});

		// in video this is the line has been there because adding this line makes this test similar to previous test that's why this one skip
		// expect(spySave).toHaveBeenCalled();

		expect(spySave).toBe("user-123");
	});

	test("Should call the function to generate pre-signed url and send that in the body", async () => {
		const spyGetUploadUrl = jest.spyOn(S3.prototype, "getUploadURL");
		spyGetUploadUrl.mockImplementation(async () => "http://upload-url.com");

		const res = await (handler as any)({
			body: JSON.stringify({
				userId: "user-123",
				title: "Cat video",
			}),
		});

		expect(spyGetUploadUrl).toHaveBeenCalledTimes(1);
		expect(JSON.parse(res.body).uploadUrl).toBe("http://upload-url.com");
	});
});
