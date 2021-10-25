import { configureStore, combineReducers } from '@reduxjs/toolkit';
import api from 'src/api';
import { BookmarkNode } from 'src/constants/types';
import bookmarksReducer, { getTree, selectDir, nodeDictSelector } from './bookmarksSlice';


const reducer = combineReducers({ bookmarks: bookmarksReducer });
const store = configureStore({ reducer });
type RootState = ReturnType<typeof store.getState>;

describe('Store Bookmarks slice', () => {

  test('handle getTree async thunk', async () => {
    const action = await store.dispatch(getTree());
    store.dispatch(action);

    expect(store.getState().bookmarks.rootNode).not.toEqual({});
  });

  test('handle selectDir action', () => {
    store.dispatch(selectDir('2'));

    expect(store.getState().bookmarks.selectedDirId).toBe('2');
  });

  test('nodeDictSelector', async () => {
    const nodeDict = nodeDictSelector(store.getState());
    expect(Object.keys(nodeDict)).toHaveLength(9);
  });


});