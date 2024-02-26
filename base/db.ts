import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";
import * as postgresql from "@pulumi/postgresql";

export interface ApplicationDBArgs {
    databaseVersion: string;
    postgresPassword: string;
    schemas: string[];
}

// https://www.pulumi.com/docs/concepts/resources/components/#component-resources
export class ApplicationDB extends pulumi.ComponentResource {
    public publicIpAddress: pulumi.Output<string>;
    public database: gcp.sql.Database;
    public postgresUser: gcp.sql.User;
    public schemas: postgresql.Schema[] = [];

    constructor(name: string,
                args: ApplicationDBArgs,
                opts: pulumi.ComponentResourceOptions = {}) {
        super("howly:gcp:ApplicationDB", name, args, opts);

        const parentOpts = { parent: this, ...opts };

        const dbInstance = new gcp.sql.DatabaseInstance("main", {
            databaseVersion: args.databaseVersion,
            region: "us-central1",
            settings: {
                tier: "db-f1-micro",
                ipConfiguration: {
                    authorizedNetworks: [{
                        value: "0.0.0.0/0",
                    }],
                },
            },
            deletionProtection: false,
        }, parentOpts);

        this.database = new gcp.sql.Database("application", {
            instance: dbInstance.name,
            name: "application",
        }, parentOpts);

        this.postgresUser = new gcp.sql.User("postgres", {
            instance: dbInstance.name,
            name: "postgres",
            password: args.postgresPassword,
        }, parentOpts);

        this.createDatabaseObjects(dbInstance, args, parentOpts);

        this.publicIpAddress = dbInstance.publicIpAddress;

        // https://github.com/pulumi/pulumi/issues/2653#issuecomment-1406965683
        this.registerOutputs({
            database: this.database,
            postgresUser: this.postgresUser,
            schemas: this.schemas,
        });
    }

    private createDatabaseObjects(instance: gcp.sql.DatabaseInstance, args: ApplicationDBArgs, parentOpts: pulumi.ComponentResourceOptions) {
        const pgProvider = new postgresql.Provider("postgres", {
            host: instance.publicIpAddress,
            username: this.postgresUser.name,
            password: args.postgresPassword,
            superuser: false,
            sslmode: "disable",
        }, parentOpts);

        args.schemas.forEach(schemaName => {
            let schema = new postgresql.Schema(schemaName, {
                name: schemaName,
                database: this.database.name,
            }, { provider: pgProvider, ...parentOpts})

            this.schemas.push(schema)
        });
    }
}
