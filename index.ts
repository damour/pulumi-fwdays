import * as pulumi from "@pulumi/pulumi";
import { cluster } from "./k8s";
import { ApplicationDB } from "./db";
import { instanceName } from "./vm";

interface DBConfig {
    databaseVersion: string;
    postgresPassword: string;
    schemas: string[];
}

let config = new pulumi.Config();
let dbConfig = config.requireObject<DBConfig>("dbConfig");

export const db = new ApplicationDB("my-db", {
    schemas: dbConfig.schemas,
    postgresPassword: dbConfig.postgresPassword,
    databaseVersion: dbConfig.databaseVersion,
});

export const dbIP = db.publicIpAddress;
export const k8sCluster = cluster.name;
export const vmInstanceName = instanceName;
