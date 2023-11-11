import {
	createSelector,
	createEntityAdapter //creates a set of reusable reducers and selectors to manage normalized data in Redux. Here, it's being used to manage a list of users
} from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice"

const usersAdapter = createEntityAdapter({})

const initialState = usersAdapter.getInitialState()

export const usersApiSlice = apiSlice.injectEndpoints({ //defining an API endpoint for fetching user data.
	endpoints: builder => ({
			getUsers: builder.query({ // actual API call. It's a function that returns the URL for the API endpoint
					query: () => '/users',
					validateStatus: (response, result) => {
							return response.status === 200 && !result.isError
				},
					// function that transforms the API response data before it's stored in the Redux store
					transformResponse: responseData => {
							const loadedUsers = responseData.map(user => {
									user.id = user._id
									return user
							});
							return usersAdapter.setAll(initialState, loadedUsers)
				},
					// after fetching the users, the cache for these entries is marked as outdated, and the next time these entries are accessed, a new fetch will be performed to get the latest data.
					providesTags: (result, error, arg) => {
							if (result?.ids) {
									return [
											{ type: 'User', id: 'LIST' },
											...result.ids.map(id => ({ type: 'User', id }))
									]
							} else return [{ type: 'User', id: 'LIST' }]
					}
			}),
			addNewUser: builder.mutation({
				query: initialUserData => ({
						url: '/users',
						method: 'POST',
						body: {
								...initialUserData,
						}
				}),
				// force the cache of redux-rtx to update. user list will be invalidated
				invalidatesTags: [
						{ type: 'User', id: "LIST" }
				]
			}),
			updateUser: builder.mutation({
				query: initialUserData => ({
						url: '/users',
						method: 'PATCH',
						body: {
								...initialUserData,
						}
				}),
				invalidatesTags: (result, error, arg) => [
						{ type: 'User', id: arg.id }
				]
			}),
			deleteUser: builder.mutation({
				query: ({ id }) => ({
						url: `/users`,
						method: 'DELETE',
						body: { id }
				}),
				invalidatesTags: (result, error, arg) => [
						{ type: 'User', id: arg.id }
				]
		}),
	}),
})


export const {
	useGetUsersQuery,
	useAddNewUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
} = usersApiSlice

// returns the query result object
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select()

// creates memoized selector
const selectUsersData = createSelector(
	selectUsersResult,
	usersResult => usersResult.data // normalized state object with ids & entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
	selectAll: selectAllUsers,
	selectById: selectUserById,
	selectIds: selectUserIds
	// Pass in a selector that returns the users slice of state
} = usersAdapter.getSelectors(state => selectUsersData(state) ?? initialState)