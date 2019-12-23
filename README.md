# Efficiently manage large lists in Cloud Firestore
A huge tenant of any mobile application is displaying, filtering, and very likely full-text searching across large lists of data. Querying is relatively straightforward in Cloud Firestore, but full-text searching is not (which is another issue entirely). The cost of reading ever-increasing amounts of documents (even using paginated queries) can quickly add up with a traditional 'query all documents in a collection' approach that would be the go-to in most applications.

This repository is companion code to the [following article](https://medium.com/@danahartweg/efficiently-manage-large-lists-in-cloud-firestore-6a100f000a3).

## Quick setup
```bash
yarn global add firebase-tools@7.3.0

cd server
yarn install
yarn lint && yarn validate
```

## Running the tests
If you want to run the cloud function tests, you **must** set a local firebase project that corresponds to the [project id found here](./server/test-helpers/firestore-helpers.ts#L19)

If you don't both use and specify an actual project id, cloud functions won't trigger in response to database writes. This tidbit slowed me down for the longest time, and I've confirmed it as expected behavior with firestore support.

```bash
yarn test
```
