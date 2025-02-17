import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <p>&copy; {new Date().getFullYear()} Twitter-Like. All rights reserved.</p>
            </div>
        </footer>
    );
};

const footerStyle: React.CSSProperties = {
    backgroundColor: '#f1f1f1',
    padding: '10px 0',
    position: 'fixed',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
};

const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
};

export default Footer;