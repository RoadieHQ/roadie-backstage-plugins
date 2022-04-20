import {
    CatalogProcessor,
    CatalogProcessorEmit,
    LocationSpec,
    processingResult
} from "@backstage/plugin-catalog-backend";
import { S3 } from '@aws-sdk/client-s3';
import { STS } from '@aws-sdk/client-sts';

import { fromTemporaryCredentials } from "@aws-sdk/credential-providers"
import {ResourceEntity} from "@backstage/catalog-model";

const LOCATION_TYPE = 'aws-s3-buckets';

export class AwsS3BucketDiscoveryProcessor implements CatalogProcessor {
    getProcessorName(): string {
        return "AwsS3BucketDiscoveryProcessor";
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

        const credentials = fromTemporaryCredentials({ params: { RoleArn: targetArn } });
        const s3 = new S3({ credentials });
        const sts = new STS({ credentials });

        const account = await sts.getCallerIdentity({});

        const defaultAnnotations: {[name: string]: string } = {}

        if (account.Account) {
            defaultAnnotations['amazon.com/account-id'] = account.Account;
        }

        const buckets = await s3.listBuckets({});

        for (const bucket of (buckets.Buckets || [])) {
            if (bucket.Name) {
                const annotations = JSON.parse(JSON.stringify(defaultAnnotations));
                annotations["amazon.com/s3-bucket-arn"] = `arn:aws:s3:::bucket_name/${bucket.Name}`;
                const bucketEntity: ResourceEntity = {
                    kind: "Resource",
                    apiVersion: "backstage.io/v1beta1",
                    metadata: {
                        annotations,
                        name: bucket.Name
                    },
                    spec: {
                        owner: "unknown",
                        type: "s3-bucket",

                    }
                }
                emit(processingResult.entity(location, bucketEntity))
            }
        }
        return true;
    }
}