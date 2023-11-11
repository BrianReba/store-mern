import {
	createSelector,
	createEntityAdapter //creates a set of reusable reducers and selectors to manage normalized data in Redux. Here, it's being used to manage a list of notes
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice"

//sort completed or open
const notesAdapter = createEntityAdapter({
	sortComparer: (a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1
})

const initialState = notesAdapter.getInitialState()

export const notesApiSlice = apiSlice.injectEndpoints({ //defining an API endpoint for fetching note data.
	endpoints: builder => ({
			getNotes: builder.query({ // actual API call. It's a function that returns the URL for the API endpoint
					query: () => '/notes',
					validateStatus: (response, result) => {
							return response.status === 200 && !result.isError
				},
					// function that transforms the API response data before it's stored in the Redux store
					transformResponse: responseData => {
							const loadedNotes = responseData.map(note => {
									note.id = note._id
									return note
							});
							return notesAdapter.setAll(initialState, loadedNotes)
				},
					// option that specifies the RTK Query tags for the endpoint. Tags are used by RTK Query to track which components are using which data, which enables features like automatic refetching and cache management
					providesTags: (result, error, arg) => {
							if (result?.ids) {
									return [
											{ type: 'Note', id: 'LIST' },
											...result.ids.map(id => ({ type: 'Note', id }))
									]
							} else return [{ type: 'Note', id: 'LIST' }]
					}
			}),
			addNewNote: builder.mutation({
				query: initialNote => ({
						url: '/notes',
						method: 'POST',
						body: {
								...initialNote,
						}
				}),
				invalidatesTags: [
						{ type: 'Note', id: "LIST" }
				]
			}),
			updateNote: builder.mutation({
				query: initialNote => ({
						url: '/notes',
						method: 'PATCH',
						body: {
								...initialNote,
						}
				}),
				invalidatesTags: (result, error, arg) => [
						{ type: 'Note', id: arg.id }
				]
			}),
			deleteNote: builder.mutation({
				query: ({ id }) => ({
						url: `/notes`,
						method: 'DELETE',
						body: { id }
				}),
				invalidatesTags: (result, error, arg) => [
						{ type: 'Note', id: arg.id }
				]
			}),
	}),
})

export const {
	useGetNotesQuery,
	useAddNewNoteMutation,
	useUpdateNoteMutation,
	useDeleteNoteMutation,
} = notesApiSlice

// returns the query result object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select()

// creates memoized selector
const selectNotesData = createSelector(
	selectNotesResult,
	notesResult => notesResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
	selectAll: selectAllNotes,
	selectById: selectNoteById,
	selectIds: selectNoteIds
	// Pass in a selector that returns the notes slice of state
} = notesAdapter.getSelectors(state => selectNotesData(state) ?? initialState)