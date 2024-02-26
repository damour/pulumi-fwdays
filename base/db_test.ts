import * as pulumi from "@pulumi/pulumi";
import "mocha";
import * as assert from 'assert';

// https://www.pulumi.com/docs/using-pulumi/testing/unit/
pulumi.runtime.setMocks({
    newResource: function(args: pulumi.runtime.MockResourceArgs): {id: string, state: any} {
        switch (args.type) {
            default:
                return {
                    id: args.inputs.name + "_id",
                    state: {
                        ...args.inputs,
                    },
                };
        }
    },
    call: function(args: pulumi.runtime.MockCallArgs) {
        switch (args.token) {
            default:
                return args;
        }
    },
});

describe("DB schemas", function() {
    let module: typeof import("./db");

    before(async function() {
        // It's important to import the program _after_ the mocks are defined.
        module = await import("./db");
    });

    describe("constructor", function() {
        it("should create a new database objects", function(done) {
            const appDB = new module.ApplicationDB("my-db", {
                databaseVersion: "POSTGRES_12",
                postgresPassword: "password",
                schemas: ["test1", "test2"],
            });

            pulumi.all([appDB.database.name, appDB.schemas[0].name, appDB.schemas[1].name]).apply(([dbName, schema1Name, schema2Name]) => {
                try {
                    assert.strictEqual(dbName, "application");
                    assert.strictEqual(schema1Name, "test1");
                    assert.strictEqual(schema2Name, "test2");
                    done();
                } catch(e) {
                    done(e);
                }
            });
        });
    });
});
