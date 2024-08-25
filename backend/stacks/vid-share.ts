import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambdaFn from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as LambdaEnv from "../../lib/lambda-env";

export class VidShareAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// API Gateway
		const gateway = new apiGateway.RestApi(this, "Vidshare_Gateway", {
			deploy: false,
		});

		// Deployment
		const vishareDeployment = new apiGateway.Deployment(this, "Vidshare_Deployment", {
			api: gateway,
		});

		//Stage
		const vidshareStage = new apiGateway.Stage(this, "Vidshare_Gateway_Dev_Stage", {
			stageName: "dev",
			deployment: vishareDeployment,
		});

		gateway.deploymentStage = vidshareStage;

		// DynamoDB
		//NOTE: Billing Mode is default value is OnDemand or PAY_PER_REQUEST so currently not adding this option first check then add

		const table = new dynamodb.TableV2(this, "Vidshare_Table", {
			partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
			tableName: "vidshare-table",
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			globalSecondaryIndexes: [
				{
					indexName: "byUserId",
					partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
					sortKey: { name: "uploadedDateTime", type: dynamodb.AttributeType.NUMBER },
				},
			],
		});

		// S3 Bucket
		const bucket = new s3.Bucket(this, "Vidshare_S3_Bucket", {
			bucketName: "s3-vidshare-bucket",
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		// Enviroment Variables
		const lambdaEnviromentVariables: LambdaEnv.EnviromentVariables = {
			VIDEO_TABLE_NAME: table.tableName,
			VIDEO_TABLE_REGION: this.region,
			S3_BUCKET_NAME: bucket.bucketName,
			S3_BUCKET_REGION: this.region,
		};

		// Lambda:PutHandler
		const putHandlerLambda = new lambdaFn.NodejsFunction(this, "Vidshare_PutHandler_Lambda", {
			entry: path.resolve(__dirname, "../../lambdas/putHandler.ts"),
			runtime: Runtime.NODEJS_20_X,
			functionName: "vidshare-put-lambda",
			environment: lambdaEnviromentVariables,
		});

		// Permissions

		gateway.root
			.addResource("video")
			.addMethod("PUT", new apiGateway.LambdaIntegration(putHandlerLambda));

		table.grantWriteData(putHandlerLambda);
		bucket.grantPut(putHandlerLambda);
	}
}
