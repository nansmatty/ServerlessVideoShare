import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

export class DB {
	private client: DynamoDBClient;
	private docClient: DynamoDBDocumentClient;

	constructor(
		private config: {
			tableName: string;
			region: string;
		}
	) {
		this.client = new DynamoDBClient({ region: this.config.region });
		this.docClient = DynamoDBDocumentClient.from(this.client, {
			marshallOptions: {
				removeUndefinedValues: true,
			},
		});
	}

	async save(doc: any) {
		return this.docClient.send(
			new PutCommand({
				TableName: this.config.tableName,
				Item: doc,
			})
		);
	}
}
