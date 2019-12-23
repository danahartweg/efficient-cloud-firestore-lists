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
const HOMESTEAD_ID = generateId();

describe('createIndicesForHomestead', () => {
  let db: Firestore;

  beforeAll(async () => {
    setUseRealProjectId();

    await setup(USER_ID, {
      [documentPath(COLLECTIONS.USERS, USER_ID)]: {
        displayName: 'user',
      },
      [documentPath(COLLECTIONS.HOMESTEADS, HOMESTEAD_ID)]: {
        name: 'homestead',
        owner: USER_ID,
      },
    });

    db = getAdminApp();
    return waitForCloudFunctionExecution();
  });

  afterAll(() => teardown());

  test('only creates the needed indices', async () => {
    const indexQuery = await db
      .collection(COLLECTIONS.INDICES)
      .where('parentId', '==', HOMESTEAD_ID)
      .get();

    expect(indexQuery.size).toEqual(1);
  });

  test('creates a plant variety index', async () => {
    const plantVarietyIndexQuery = await db
      .collection(COLLECTIONS.INDICES)
      .where('parentId', '==', HOMESTEAD_ID)
      .where('indexName', '==', 'plant-varieties')
      .where('isFull', '==', false)
      .get();

    expect(plantVarietyIndexQuery.size).toEqual(1);
  });
});
