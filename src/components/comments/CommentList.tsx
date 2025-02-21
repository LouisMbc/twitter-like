import React from 'react';

interface Comment {
    id: number;
    author: {
        id: string;
        nickname: string;
        profilePicture: string | null;
    };
    text: string;
}

interface CommentListProps {
    comments: Comment[];
    tweetId: string;
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
    return (
        <div>
            {comments.map(comment => (
                <div key={comment.id} className="comment">
                    <h4>{comment.author.nickname}</h4>
                    <p>{comment.text}</p>
                </div>
            ))}
        </div>
    );
};

export default CommentList;