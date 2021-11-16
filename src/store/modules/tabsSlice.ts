import { createAction, createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import api from "src/api";
import { RootState } from '../index';

interface TabsState {
  tabs: chrome.tabs.Tab[];
  checkedTabIds: number[];
  tabIndex: number;
}

const initialState: TabsState = {
  tabs: [],
  checkedTabIds: [],
  tabIndex: -1,
}

export const getTabs = createAsyncThunk(
  'TABS/GET_TABS',
  async () => {
    const tabs = await api.tabs.query({});
    return tabs.filter(tab => !tab.url?.match(/chrome:\/\/bookmarks/g));
  }
);

// actions
export const checkAll = createAction('CHECK_ALL');
export const uncheckAll = createAction('CLEAR');
export const toggleCheck = createAction(
  'TABS/TOGGLE_CHECK',
  (id: number) => ({ payload: id })
  );
export const toggleCheckAll = createAsyncThunk<void, void, { state: RootState}>(
  'TABS/TOGGLE_CHECK_ALL',
  (_, { dispatch, getState }) => {
    const { tabs, checkedTabIds } = getState().tabs;
    if (tabs.length === checkedTabIds.length) dispatch(uncheckAll());
    else dispatch(checkAll());
  }
);

export const closeCheckedTabs = createAsyncThunk<void, void, { state: RootState }>(
  'TABS/REMOVE_CHECKED',
  async (_, { getState, dispatch }) => {
    const tabIds = getState().tabs.checkedTabIds.slice();
    dispatch(uncheckAll());
    api.tabs.remove(tabIds);
  }
);

export const closeTab = createAsyncThunk(
  'TABS/CLOSE_TAB',
  async (id: number) => {
    api.tabs.remove(id);
  }
);

export const closeFocusTab = createAsyncThunk<void, void, { state: RootState }>(
  'TABS/CLOSE_TAB_HOTKEY',
  async (_, { dispatch, getState }) => {
    const targetId = selectFocusedId(getState());
    targetId && dispatch(closeTab(targetId));
  }
);

export const moveFocusIndex = createAction(
  'TABS/MOVE_FOCUS_INDEX',
  (diff: -1 | 1) => ({ payload: diff })
);

export const setFocusIndex = createAction(
  'TABS/SET_FOCUS_INDEX',
  (index: number) => ({ payload: index })
);

export const setFocusIndexEnd = createAction(
  'TABS/setFocusIndexEnd',
  (target: 'START' | 'END') => ({ payload: target })
);

export const toggleCheckFocused = createAsyncThunk<void, void, { state: RootState }>(
  'TABS/TOGGLE_CHECK_FOCUSED',
  (_, { dispatch, getState }) => {
    const id = selectFocusedId(getState());
    id && dispatch(toggleCheck(id));
  }
);

export const activateFocusedTab = createAsyncThunk<void, void, { state: RootState }>(
  'TABS/ACTIVATE_FOCUSED_TAB',
  (_, { getState }) => {
    const id = selectFocusedId(getState());
    id && api.tabs.update(id, { active: true });
  }
)

// selectors
export const selectAllChecked = ({ tabs }: RootState) => {
  return tabs.tabs.length === tabs.checkedTabIds.length;
};

export const selectFocusedId = createSelector(
   (state: RootState) => state.tabs,
   ({ tabs, tabIndex }) => tabs[tabIndex]?.id
);

export const selecFocusedNode = ({ tabs }: RootState) => tabs.tabs[tabs.tabIndex];

const slice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(
        getTabs.fulfilled,
        (state, action) => { 
          state.tabs = action.payload; 
          if (state.tabIndex >= state.tabs.length) {
            state.tabIndex = state.tabs.length - 1;
          }
        }
      )
      .addCase(
        checkAll,
        (state) => {
          state.checkedTabIds = state.tabs
            .filter(tab => tab.id)
            .map(tab => tab.id) as number[]
        }
      )
      .addCase(
        uncheckAll,
        (state) => { state.checkedTabIds = [] }
      )
      .addCase(
        toggleCheck,
        (state, action) => { 
          const id = action.payload;
          if (!state.checkedTabIds.includes(id)) state.checkedTabIds.push(id);
          else state.checkedTabIds = state.checkedTabIds.filter(item => item !== id);
        }
      )
      .addCase(
        closeCheckedTabs.fulfilled,
        (state) => {
          state.checkedTabIds = [];
        }
      )
      .addCase(
        moveFocusIndex,
        (state, action) => {
          const nextIndex = state.tabIndex + action.payload;
          if (nextIndex >= state.tabs.length || nextIndex < 0) return;
          else state.tabIndex = nextIndex;
        }
      )
      .addCase(
        setFocusIndex,
        (state, action) => { state.tabIndex = action.payload; }
      )
      .addCase(
        setFocusIndexEnd,
        (state, action) => {
          state.tabIndex = action.payload === 'START'
            ? 0
            : state.tabs.length -1;
        }
      )
  }
});

export const selectCheckedTabs = (state: RootState) => {
  const { tabs, checkedTabIds } = state.tabs;
  return tabs.filter(tab => tab.id && checkedTabIds.includes(tab.id));
};

export default slice.reducer;