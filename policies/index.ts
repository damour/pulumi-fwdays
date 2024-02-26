import * as gcp from "@pulumi/gcp";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";
import {ResourceValidationPolicy} from "@pulumi/policy/policy";

// https://www.pulumi.com/docs/using-pulumi/crossguard/configuration/
const stackPolicy: ResourceValidationPolicy = {
    name: "prohibited-public-internet",
    description: "Google Cloud rules with public internet access are prohibited.",
    enforcementLevel: "advisory",
    validateResource: validateResourceOfType(gcp.sql.DatabaseInstance, (dbInstance, args, reportViolation) => {
        if (dbInstance?.settings?.ipConfiguration?.authorizedNetworks?.some(ranges => ranges.value === "0.0.0.0/0")) {
            reportViolation("CloudSQL rules with public internet access are prohibited.");
        }
    }),
}

const tests = new PolicyPack("tests-pack", {
    policies: [stackPolicy],
});
