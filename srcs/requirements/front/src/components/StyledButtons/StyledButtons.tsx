import React, { useState, useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react'
import SolidFrame from '../SolidFrame/SolidFrame';

interface ProfileUserButtonProps	{
	newID: number,
	ID: number
}


const ProfileUserButton = ({newID, ID}: ProfileUserButtonProps) => {

	function	handleSocialInteract()
		{ console.log('app-front: buttons action got triggered.') }

	function MouseOver(event: React.MouseEvent<HTMLButtonElement>) {
		const target = event.target as HTMLButtonElement;
		target.style.opacity = '1'
	}

	function MouseOut(event: React.MouseEvent<HTMLButtonElement>){
		const target = event.target as HTMLButtonElement;
		target.style.opacity = '0.8'
	}

	return (
		<div>
			{ newID === -1 || newID === ID ?
				null :
				<SolidFrame frameClass="button-interface-actions-user">
					<button onMouseOver={MouseOver} onMouseLeave={MouseOut} onClick={handleSocialInteract} className="button-interface-actions-user button-add-friend" >Add friend</button>
					<button onMouseOver={MouseOver} onMouseLeave={MouseOut} onClick={handleSocialInteract} className="button-interface-actions-user button-remove-friend" >Remove Friend</button>
					<button onMouseOver={MouseOver} onMouseLeave={MouseOut} onClick={handleSocialInteract} className="button-interface-actions-user button-block-user" >Block User</button>
					<button onMouseOver={MouseOver} onMouseLeave={MouseOut} onClick={handleSocialInteract} className="button-interface-actions-user button-make-game" >Make Game</button>
			</SolidFrame>}
		</div>
	)
}

export default ProfileUserButton
