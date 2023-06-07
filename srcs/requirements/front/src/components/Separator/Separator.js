import React from 'react'
import './Separator.css'
import ImgAsset from '../../public'

export default function Separator (props) {
	return (
		<div className={`Separator_Separator ${props.className}`}>
			<img className='separator' src = {ImgAsset.Separator_separator} />
		</div>
	)
}
