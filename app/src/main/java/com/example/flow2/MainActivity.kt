package com.example.flow2

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_main)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        // Récupérer les vues
        val usernameEditText: EditText = findViewById(R.id.editTextUsername)
        val passwordEditText: EditText = findViewById(R.id.editTextPassword)
        val connectButton: Button = findViewById(R.id.connect)

        // Récupérer la référence au nouveau bouton
        // Assurez-vous que l'ID dans activity_main.xml est bien "buttonGoToRegister"
        val goToRegisterButton: Button = findViewById(R.id.buttonGoToRegister) // CORRECTION ICI

        connectButton.setOnClickListener {
            // Récupérer le texte des EditText
            val username = usernameEditText.text.toString().trim() // Ajout de trim()
            val password = passwordEditText.text.toString().trim() // Ajout de trim()

            // Vérifier les identifiants
            if (username == "paul" && password == "1234") {
                // Identifiants corrects, naviguer vers Home
                val intent = Intent(this, Home::class.java)
                startActivity(intent)
                // Optionnel : fermer MainActivity pour que l'utilisateur ne puisse pas y revenir avec le bouton "retour"
                // finish()
            } else {
                // Identifiants incorrects, afficher un message d'erreur
                Toast.makeText(this, "Identifiant ou mot de passe incorrect", Toast.LENGTH_SHORT).show()
            }
        }

        // Gérer le clic sur le bouton "Créer un compte"
        goToRegisterButton.setOnClickListener { // Maintenant, goToRegisterButton est déclarée
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
    }
}