import React, { useState, useEffect } from 'react';
import axios from 'axios'
import './SearchList.scss'

interface User {
	id: number;
	username: string;
}

interface SearchListProps	{
	searchTerm: string
}

const SearchList = ({searchTerm}: SearchListProps) => {
	const [users, setUsers] = useState<User[]>([])
	
	async function askDataBaseForSearchBarContent()	{
		try {
			const	searchResultURL = 'http://localhost:8080/search/users'
			const	res = await axios({
				url: searchResultURL,
				method: 'POST',
				data:	{
					searched: searchTerm
				}
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

	return (
		<div className='search-list' >
			{searchTerm ? 
			<ul>
				{users.map((user) => (
					<li
					key={user.id}>{user.username}
				</li>
				))}
			</ul>
			: null }
		</div>
	)
}

export default SearchList