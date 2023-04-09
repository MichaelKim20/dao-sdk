/* MARKDOWN
---
title: Get DAOs
---

## Get Existing DAOs from the DAO Registry

Gets a list of DAOs from the BOSagora OSx DAO registry.
*/

import {
  Client,
  DaoListItem,
  DaoSortBy,
  IDaoQueryParams,
  SortDirection,
} from "@bosagora/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the BOSagora OSx SDK context.
const client: Client = new Client(context);

const queryParams: IDaoQueryParams = {
  skip: 0, // optional
  limit: 10, // optional,
  direction: SortDirection.ASC, // optional
  sortBy: DaoSortBy.CREATED_AT, //optional, alternatively "SUBDOMAIN" (and "POPULARITY" coming soon)
};

// Get a list of DAOs from the BOSagora DAO registry.
const daos: DaoListItem[] = await client.methods.getDaos(queryParams);
console.log(daos);

/* MARKDOWN
Returns:

```json
[
  {
    address: "0x12345...",
    ensDomain: "test.dao.eth",
    metadata: {
        name: "Test",
        description: "This is a description"
    };
    plugins: [
      {
        id: "token-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  },
  {
    address: "0x12345...",
    ensDomain: "test-1.dao.eth",
    metadata: {
        name: "Test 1",
        description: "This is a description 1"
    };
    plugins: [
      {
        id: "address-list-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  },
  {
    address: "0x12345...",
    ensDomain: "test-2.dao.eth",
    metadata: {
        name: "Test 2",
        description: "This is a description 2"
    };
    plugins: [
      {
        id: "token-voting.plugin.dao.eth",
        instanceAddress: "0x12345..."
      }
    ]
  }
]
  ```
*/
