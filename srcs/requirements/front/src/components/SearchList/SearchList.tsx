import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { Dispatch, SetStateAction } from 'react'
import './SearchList.scss'

interface User {
	id: number;
	username: string;
}

interface SearchListProps	{
	searchTerm: string,
	setNewID: Dispatch<SetStateAction<number>>
}

const SearchList = ({setNewID, searchTerm}: SearchListProps) => {
	const [users, setUsers] = useState<User[]>([])
	
	async function askDataBaseForSearchBarContent()	{
		try {
			const	searchResultURL = 'http://localhost:8080/search/users'
			const	res = await axios({
				url: searchResultURL,
				method: 'POST',
				data:	{ searched: searchTerm }
			})
			setUsers(res.data)
		}
		catch (error) {
			console.error('Error fetching user data:', error)
		}
	}

	useEffect(() => {
		if (searchTerm)
			askDataBaseForSearchBarContent()
	}
	, [searchTerm])

	async function	navigateToSelectedProfile(e: React.MouseEvent<HTMLLIElement>)	{
		const	liTag = e.target as HTMLLIElement
		const	text = liTag.textContent
		if (text)	{
			const user = users.filter(user => user.username.toLowerCase().includes(text.toLowerCase()))
			setNewID(user[0].id)
		}
	}

	return (
		<div className='search-list' >
			{searchTerm ? 
			<ul>
				{users.length ? users.map((user) => (
					<li onClick={(e) => navigateToSelectedProfile(e)} key={user.id}>
						{user.username}
					</li>
				)) : <li>No user matched your search</li>}
			</ul>
			: null }
		</div>
	)
}

export default SearchList