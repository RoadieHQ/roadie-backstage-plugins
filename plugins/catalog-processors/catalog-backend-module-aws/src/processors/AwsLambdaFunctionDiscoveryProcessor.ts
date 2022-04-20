import {
    CatalogProcessor,
    CatalogProcessorEmit,
    LocationSpec,
    processingResult
} from "@backstage/plugin-catalog-backend";
import { Lambda } from '@aws-sdk/client-lambda';
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers"
import { ComponentEntity } from "@backstage/catalog-model";

const LOCATION_TYPE = 'aws-lambda-functions';

export class AwsLambdaFunctionDiscoveryProcessor implements CatalogProcessor {
    getProcessorName(): string {
        return "AwsLambdaFunctionDiscoveryProcessor";
    }

    async readLocation(
        location: LocationSpec,
        _optional: boolean,
        emit: CatalogProcessorEmit,
    ): Promise<boolean> {
        if (location.type !== LOCATION_TYPE) {
            return false;
        }
        const targetArn = location.target;

        const lambda = new Lambda({
            credentials: fromTemporaryCredentials({ params: { RoleArn: targetArn } })
        });

        const functions = await lambda.listFunctions({});

        for (const lambdaFunction of (functions.Functions || [])) {
            if (lambdaFunction.FunctionName && lambdaFunction.FunctionArn) {
                const bucketEntity: ComponentEntity = {
                    kind: "Component",
                    apiVersion: "backstage.io/v1beta1",
                    metadata: {
                        annotations: {
                            "amazon.com/lambda-arn": lambdaFunction.FunctionArn
                        },
                        name: lambdaFunction.FunctionName
                    },
                    spec: {
                        owner: "unknown",
                        type: "lambda-function",
                        lifecycle: "production"
                    }
                }
                emit(processingResult.entity(location, bucketEntity))
            }
        }
        return true;
    }
}