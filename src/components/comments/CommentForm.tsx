import React, { useState } from 'react';

interface CommentFormProps {
    tweetId: string;
    onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ tweetId, onCommentAdded }) => {
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle comment submission logic here
        console.log('Comment submitted:', comment);
        setComment('');
        onCommentAdded();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={4}
                    cols={50}
                />
            </div>
            <div>
                <button type="submit">Post Comment</button>
            </div>
        </form>
    );
};

export default CommentForm;