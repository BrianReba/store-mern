import { store } from '../../app/store'
import { notesApiSlice } from '../notes/notesApiSlice'
import { usersApiSlice } from '../users/usersApiSlice';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

const Prefetch = () => {
	useEffect(() => {
		//Observables that emit the notes and users data. By default, the data is not fetched until you subscribe to the Observable. In this case, the initiate() function automatically subscribes to the Observable, so you don't need to call the subscribe() method explicitly.
		
		//Observables are objects that can emit multiple values over time
        console.log('subscribing')
        const notes = store.dispatch(notesApiSlice.endpoints.getNotes.initiate())
        const users = store.dispatch(usersApiSlice.endpoints.getUsers.initiate())

        return () => {
            console.log('unsubscribing')
            notes.unsubscribe()
            users.unsubscribe()
        }
    }, [])

    return <Outlet />
}
export default Prefetch