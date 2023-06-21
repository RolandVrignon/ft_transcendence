import React, { useState, useEffect } from 'react';
import axios from 'axios'

interface User {
	id: number;
	name: string;
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
			console.log(res.data)
			setUsers(res.data)
		}
		catch (error) {
			console.error('Error fetching user data:', error)
		}
	}

	useEffect(() => {
		askDataBaseForSearchBarContent()
	}
	, [searchTerm]);

	return (
		<ul>
			{users.map((user) => (
			<li
				key={user.id}>{user.name}
			</li>
			))}
		</ul>
	)
}

export default SearchList