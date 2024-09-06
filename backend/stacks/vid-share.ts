import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambdaFn from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as s3Notification from "aws-cdk-lib/aws-s3-notifications";
import * as path from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as LambdaEnv from "../../lib/lambda-env";

export class VidShareCDAppStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// API Gateway
		const gateway = new apiGateway.RestApi(this, "VidshareCD_Gateway", {
			deploy: false,
		});

		// Deployment
		const vishareDeployment = new apiGateway.Deployment(this, "VidshareCD_Deployment", {
			api: gateway,
		});

		//Stage
		const vidshareStage = new apiGateway.Stage(this, "VidshareCD_Gateway_Dev_Stage", {
			stageName: "dev",
			deployment: vishareDeployment,
		});

		gateway.deploymentStage = vidshareStage;

		// DynamoDB
		//NOTE: Billing Mode is default value is OnDemand or PAY_PER_REQUEST so currently not adding this option first check then add

		const table = new dynamodb.TableV2(this, "VidshareCD_Table", {
			partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
			tableName: "vidshare-video-table",
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
		const bucket = new s3.Bucket(this, "VidshareCD_S3_Bucket", {
			bucketName: "my-s3-vidshare-bucket",
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		// S3Event Listener Handler Env
		const s3EventListenerEnvVariables: LambdaEnv.S3EventListenerEnvVariables = {
			VIDEO_TABLE_NAME: table.tableName,
			VIDEO_TABLE_REGION: this.region,
		};

		// Enviroment Variables
		const lambdaEnviromentVariables: LambdaEnv.EnviromentVariables = {
			VIDEO_TABLE_NAME: table.tableName,
			VIDEO_TABLE_REGION: this.region,
			S3_BUCKET_NAME: bucket.bucketName,
			S3_BUCKET_REGION: this.region,
		};

		// Lambda:PutHandler
		const putHandlerLambda = new lambdaFn.NodejsFunction(this, "VidshareCD_Put_Handler_Lambda", {
			entry: path.resolve(__dirname, "../../lambdas/putHandler.ts"),
			runtime: Runtime.NODEJS_20_X,
			functionName: "vidshare-put-handler-lambda",
			environment: lambdaEnviromentVariables,
		});

		// Lambda:S3EventListener

		const s3EventListenerLambda = new lambdaFn.NodejsFunction(this, "S3_Event_Listener_Lambda", {
			entry: path.resolve(__dirname, "../../lambdas/s3EventListener.ts"),
			functionName: "vidshare-s3-event-lambda",
			environment: s3EventListenerEnvVariables,
		});

		// Permissions
		gateway.root
			.addResource("video")
			.addMethod("PUT", new apiGateway.LambdaIntegration(putHandlerLambda));

		table.grantWriteData(putHandlerLambda);
		table.grantWriteData(s3EventListenerLambda);
		bucket.grantPut(putHandlerLambda);

		// S3EventListener Permission
		bucket.addObjectCreatedNotification(
			new s3Notification.LambdaDestination(s3EventListenerLambda)
		);
	}
}
