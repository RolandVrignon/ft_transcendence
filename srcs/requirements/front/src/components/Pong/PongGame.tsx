import { useEffect, useState, useRef } from 'react';
import { ReactP5Wrapper } from "@p5-wrapper/react";
import io from 'socket.io-client'; // Import the socket.io client
import { Socket } from 'socket.io-client'; // Import the socket.io client
import p5Type from '@p5-wrapper/react'; // This imports the type
// import { createNoSubstitutionTemplateLiteral } from 'typescript';

type Vector = any;

type PongGameProps = {
    userDbID: number;
};

export default function PongGame({userDbID}: PongGameProps) { 
    //possible states: undefined(didn't try anything), in queue, in game, Connection failed, Connection timeout, VICTORY, DEFEAT
    const [sessionState, setsessionState] = useState<string | undefined>(undefined)
    const socketRef = useRef<Socket | null>(null)
    const [playerIndex, setPlayerIndex] = useState<number | null>(null); // Store the player index, 0 = left, 1 = right
    const parentRef = useRef<HTMLDivElement | null>(null);

    // Connect to the socket server on component mount
    useEffect(() => {
        console.log("UseEffect")
        if (!socketRef.current) {
            socketRef.current = io('http://localhost:9090');;
            socketRef.current.on('connect', () => setsessionState('connected'));
            socketRef.current.on('in-queue', () => setsessionState('in-queue'));
            socketRef.current.on('start-game', (playerIndex) => {
                setsessionState('in-game')
                setPlayerIndex(playerIndex)
            });
            socketRef.current.on('connect_error', () => setsessionState('connection-failed'));
            socketRef.current.on('connect_timeout', () => setsessionState('connection-timeout'));

            console.log("Created new socketRef.current")
        }
        return () => {
            // console.log("closing connection")
        }
    }, []);

    const sketch = (p5: any) => {
        const playerWidthRatio = 0.0375; // proportion of canvas width
        const playerOffsetRatio = 0.0125; // proportion of canvas width
        const playerHeightRatio = 0.166666; // proportion of canvas height
        const ballRadiusRatio = 0.025; // proportion of canvas width
        const timeForPlayerToCrossCanvas = 0.6
        function getSideLength() {
            if (parentRef.current !== null)
                return Math.min(parentRef.current.offsetHeight, parentRef.current.offsetWidth)
            return 500
        }
        function getPlayerWidth() {
            return playerWidthRatio * getSideLength();
        }
        function getPlayerOffset() {
            return playerOffsetRatio * getSideLength();
        }
        function getPlayerHeight() {
            return playerHeightRatio * getSideLength();
        }
        function getBallRadius() {
            return ballRadiusRatio * getSideLength();
        }


        let playerLeft: Player;
        let playerRight: Player;
        let ball: Ball;

        class Player{
            posRelativeToCanvas: Vector;
            points: number = 0
            constructor(x: number)
            {
                this.posRelativeToCanvas = p5.createVector(x, 0.5)
                this.points = 0
            }
            draw(isLocal: boolean)
            {
                p5.rectMode(p5.CENTER)
                p5.fill(isLocal ? 'blue' : 'red')
                p5.rect(this.posRelativeToCanvas.x * getSideLength(), this.posRelativeToCanvas.y * getSideLength(), getPlayerWidth(), getPlayerHeight())
                p5.rectMode(p5.CORNER)
            }
            move(upKey: number, downKey: number)
            {
                //get the direction
                let direction = 0
                if (p5.keyIsDown(upKey))
                    direction = -1
                if (p5.keyIsDown(downKey))
                    direction = 1
                //move
                this.posRelativeToCanvas.y += direction * timeForPlayerToCrossCanvas * (p5.deltaTime / 1000)
                //clamp the position
                this.posRelativeToCanvas.y = Math.max(this.posRelativeToCanvas.y, playerHeightRatio / 2)
                this.posRelativeToCanvas.y = Math.min(this.posRelativeToCanvas.y, 1 - playerHeightRatio / 2)
                socketRef.current?.emit('player-move', { y: this.posRelativeToCanvas.y })
            }
        }

        class Ball{
            posRelativeToCanvas: Vector;
            constructor() {
                this.posRelativeToCanvas = p5.createVector(0.5, 0.5)
            }
            draw() {
                p5.circle(this.posRelativeToCanvas.x * getSideLength(), this.posRelativeToCanvas.y * getSideLength(), getBallRadius() * 2)
            }
        }
        

        p5.setup = () => {
            if (socketRef.current) { 
                socketRef.current?.emit('enter-queue', userDbID)

                // Your setup code here.
                p5.createCanvas(getSideLength(), getSideLength());

                playerLeft = new Player(playerOffsetRatio);
                playerRight = new Player(1 - playerOffsetRatio);
                ball = new Ball();

                socketRef.current.on('update-game', (gameState) => {
                    // console.log(gameState) 
                    if (playerIndex !== 0)//if we are not the left player we want to update the position of the remote left player
                        playerLeft.posRelativeToCanvas.y = gameState.players[0].y
                    if (playerIndex !== 1)//same for the right player
                        playerRight.posRelativeToCanvas.y = gameState.players[1].y
                    ball.posRelativeToCanvas.x = gameState.ball.posRelativeToCanvas.x
                    ball.posRelativeToCanvas.y = gameState.ball.posRelativeToCanvas.y
                    playerLeft.points = gameState.players[0].points
                    playerRight.points = gameState.players[1].points
                });
                socketRef.current.on('game-over', (outcome: any) => {
                    console.log("received 'game-over' event, won: ", outcome.won, ", reason: ", outcome.reason)
                    if (outcome.won)
                        setsessionState("VICTORY")
                    else
                        setsessionState("DEFEAT")
                })
            }
        };

        p5.windowResized = () => {
            p5.resizeCanvas(getSideLength(), getSideLength());
        };

        function drawGame() {
            p5.background(220);
            playerLeft.draw(playerIndex === 0);
            playerRight.draw(playerIndex === 1);
            ball.draw();
 
            if (playerIndex === 0)
                playerLeft.move(p5.UP_ARROW, p5.DOWN_ARROW);
            else 
                playerRight.move(p5.UP_ARROW, p5.DOWN_ARROW);

            p5.textSize(getSideLength() / 10);
            p5.fill('black')
            p5.text(playerLeft.points.toString(), getSideLength() / 5, getSideLength() / 6)
            p5.text(playerRight.points.toString(), getSideLength() - getSideLength() / 5, getSideLength() / 6)
            
        }
        function drawText() {
            p5.clear()
            p5.background(220);
            p5.textAlign(p5.CENTER)
            p5.textSize(20);
            if (typeof sessionState !== undefined && sessionState)
                p5.textSize(0.9 * getSideLength() / sessionState.length);
            if (sessionState === "VICTORY") 
                p5.fill('yellow')
            else 
                p5.fill('gray')
            p5.text(sessionState, getSideLength() / 10, getSideLength() / 10, getSideLength() * 0.9 , getSideLength() * 0.9)
        }
        p5.draw = () => {
            if (sessionState === 'in-game')
                drawGame()
            else
                drawText()
        };
    };
 
    return (
        <div ref={parentRef} className="solid-frame parentDiv">
            <ReactP5Wrapper sketch={sketch} />
        </div>
    );
}
