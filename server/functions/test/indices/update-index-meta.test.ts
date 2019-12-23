import { waitForCloudFunctionExecution } from '../../helpers/wait';
import {
  COLLECTIONS,
  documentPath,
  generateId,
  generateUserId,
} from '../../../test-helpers/contants';
import {
  Firestore,
  getAdminApp,
  setup,
  setUseRealProjectId,
  teardown,
} from '../../../test-helpers/firestore-helpers';

const USER_ID = generateUserId();
const INDEX = generateId();

describe('updateIndexMeta', () => {
  let db: Firestore;

  beforeAll(async () => {
    setUseRealProjectId();

    await setup(USER_ID, {
      [documentPath(COLLECTIONS.INDICES, INDEX)]: {
        indexName: 'index',
        isFull: false,
        parentId: 'root',
      },
    });

    db = getAdminApp();
  });

  afterAll(() => teardown());

  test('does nothing if the index has space', async () => {
    const indexRef = db.collection(COLLECTIONS.INDICES).doc(INDEX);
    await indexRef.update({ [generateId()]: { data: 'any' } });

    await waitForCloudFunctionExecution();

    const index = await indexRef.get();
    expect(index.get('isFull')).toBe(false);

    const indexQuery = await db
      .collection(COLLECTIONS.INDICES)
      .where('parentId', '==', 'root')
      .where('indexName', '==', 'index')
      .get();

    expect(indexQuery.size).toEqual(1);
  });

  // unable to test this at the moment, as the large dataset kills the function emulator
  test.skip('creates a new index when full', async () => {
    const indexRef = db.collection(COLLECTIONS.INDICES).doc(INDEX);
    await indexRef.update({
      [generateId()]: { data: 'x'.repeat(1 * 1024 * 1024) },
    });

    await waitForCloudFunctionExecution();

    const index = await indexRef.get();
    expect(index.get('isFull')).toBe(true);

    const newIndexQuery = await db
      .collection(COLLECTIONS.INDICES)
      .where('parentId', '==', 'root')
      .where('indexName', '==', 'index')
      .where('isFull', '==', false)
      .get();

    expect(newIndexQuery.size).toEqual(1);
  });
});
