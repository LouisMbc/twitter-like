import React from 'react';
import { FaThumbsUp, FaThumbsDown, FaHeart, FaLaugh, FaAngry } from 'react-icons/fa';
import './ReactionsBar.css';

interface ReactionsBarProps {
    onReact: (reaction: string) => void;
}

const ReactionsBar: React.FC<ReactionsBarProps> = ({ onReact }) => {
    return (
        <div className="reactions-bar">
            <button onClick={() => onReact('like')}><FaThumbsUp /></button>
            <button onClick={() => onReact('dislike')}><FaThumbsDown /></button>
            <button onClick={() => onReact('love')}><FaHeart /></button>
            <button onClick={() => onReact('laugh')}><FaLaugh /></button>
            <button onClick={() => onReact('angry')}><FaAngry /></button>
        </div>
    );
};

export default ReactionsBar;