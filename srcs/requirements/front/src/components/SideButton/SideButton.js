import React from 'react'
import './SideButton.css'
import ImgAsset from '../../public'
export default function SideButton (props) {
	return (
		<div className={`SideButton_SideButton ${props.className}`}>
			<img className='Menu' src = {ImgAsset.SideButton_Menu} />
		</div>
	)
}
