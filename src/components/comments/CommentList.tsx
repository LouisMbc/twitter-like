import React from 'react';

interface Comment {
    id: number;
    author: string;
    text: string;
}

interface CommentListProps {
    comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
    return (
        <div>
            {comments.map(comment => (
                <div key={comment.id} className="comment">
                    <h4>{comment.author}</h4>
                    <p>{comment.text}</p>
                </div>
            ))}
        </div>
    );
};

export default CommentList;