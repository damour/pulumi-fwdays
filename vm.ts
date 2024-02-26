import * as gcp from "@pulumi/gcp";

const defaultInstance = new gcp.compute.Instance("example", {
    machineType: "n2-standard-2",
    zone: "us-central1-a",
    bootDisk: {
        initializeParams: {
            image: "debian-cloud/debian-11",
        },
    },
    networkInterfaces: [{
        network: "default",
    }],
});

export const instanceName = defaultInstance.name;
