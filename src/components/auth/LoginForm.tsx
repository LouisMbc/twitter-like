import React, { useState } from 'react';

const LoginForm: React.FC = () => {
    const [nomUtilisateur, setNomUtilisateur] = useState('');
    const [motDePasse, setMotDePasse] = useState('');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Gérer la logique de connexion ici
        console.log('Nom d\'utilisateur:', nomUtilisateur);
        console.log('Mot de passe:', motDePasse);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="nomUtilisateur">Nom d'utilisateur:</label>
                <input
                    type="text"
                    id="nomUtilisateur"
                    value={nomUtilisateur}
                    onChange={(e) => setNomUtilisateur(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="motDePasse">Mot de passe:</label>
                <input
                    type="password"
                    id="motDePasse"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Connexion</button>
        </form>
    );
};

export default LoginForm;