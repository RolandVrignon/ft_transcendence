import React, { useState, useEffect } from 'react';
import { Dispatch, SetStateAction } from 'react'
import SolidFrame from '../SolidFrame/SolidFrame';

interface ProfileUserButtonProps	{
	newID: number,
	ID: number
}


const ProfileUserButton = ({newID, ID}: ProfileUserButtonProps) => {
	function	whichSendButton(e: React.MouseEvent<HTMLButtonElement>): number	{
		const target = e.target as HTMLButtonElement;
		if (target.className === 'button-interface-actions-user button-add-friend')
			return 0
		else if (target.className === 'button-interface-actions-user button-remove-friend')
			return 1
		else if (target.className === 'button-interface-actions-user button-block-user')
			return 2
		return 3
	}

	function	handleSocialInteract(e: React.MouseEvent<HTMLButtonElement>)	{
		switch (whichSendButton(e))	{
			case 0:
				console.log('button-add-friend')
				break
			case 1:
				console.log('button-remove-friend')
				break
			case 2:
				console.log('button-block-user')
				break
			case 3:
				console.log('button-make-game')

		}
	}

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
