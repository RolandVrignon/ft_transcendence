import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MatchHistory.scss';

interface GameSessionOutcome {
  Player1Name: string;
  Player2Name: string;
  winnerName: string;
  loserName: string;
}

interface MatchHistoryProps {
  userID: number;
  token: string; 
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ userID, token }) => {
  const [gameSessionOutcome, setGameSessionOutcome] = useState<GameSessionOutcome[]>([]);

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        const res = await axios.post('http://localhost:8080/search/user-match-history', { id: userID }, { 
            headers: { 'Authorization': `Bearer ${token}` 
            }
        });
        console.log(`Res of axios request: ${JSON.stringify(res, null, 2)}`)
        setGameSessionOutcome(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMatchHistory();
  }, [userID, token]);

  return (
    <div className='display-match-history'>
      {gameSessionOutcome.map((outcome, index) => (
        <div className='match-history-cell' key={index}>
          <p>{outcome.Player1Name} VS {outcome.Player2Name} || Winner &#9989; {outcome.winnerName} Loser &#x274C; {outcome.loserName}</p>
        </div>
      ))}
    </div>

    // <div className="match-history">
    //   <table>
    //     <thead>
    //       <tr>
    //         <th>Player 1 Name</th>
    //         <th>Player 2 Name</th>
    //         <th>Winner</th>
    //         <th>Loser</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {gameSessionOutcome.map((game, i) => (
    //         <tr key={i}>
    //           <td>{game.Player1Name}</td>
    //           <td>{game.Player2Name}</td>
    //           <td>{game.winnerName}</td>
    //           <td>{game.loserName}</td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
  );
  
};

export default MatchHistory;