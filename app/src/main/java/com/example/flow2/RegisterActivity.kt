// RegisterActivity.kt
package com.example.flow2

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity

import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.auth
//import io.github.jan.supabase.auth.provider.EmailAuth // <<< NOUVEL ESSAI D'IMPORT POUR EMAILAUTH


import kotlinx.coroutines.launch
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put


class RegisterActivity : AppCompatActivity() {

    private lateinit var emailEditText: EditText
    private lateinit var passwordEditText: EditText
    private lateinit var nicknameEditText: EditText
    private lateinit var createAccountButton: Button
    private lateinit var progressBar: ProgressBar
    private val supabase: SupabaseClient = MyApplication.supabaseClient


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContentView(R.layout.activity_register)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.register_main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }

        emailEditText = findViewById(R.id.editTextRegisterEmail)
        passwordEditText = findViewById(R.id.editTextRegisterPassword)
        nicknameEditText = findViewById(R.id.editTextRegisterNickname)
        createAccountButton = findViewById(R.id.buttonCreateAccount)
        progressBar = findViewById(R.id.progressBarRegister)

        createAccountButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()
            val nickname = nicknameEditText.text.toString().trim()

            if (email.isBlank() || password.isBlank()) {
                Toast.makeText(this, "L'email et le mot de passe ne peuvent pas être vides", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            if (password.length < 6) {
                Toast.makeText(this, "Le mot de passe doit contenir au moins 6 caractères", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            registerUser(email, password, nickname)
        }
    }

    private fun registerUser(emailValue: String, passwordValue: String, nickname: String?) { // Renommé les params pour éviter confusion avec this.email
        progressBar.visibility = View.VISIBLE
        createAccountButton.isEnabled = false

        lifecycleScope.launch {
            try {
                val userDataJson = if (nickname.isNullOrBlank()) { // Renommé userData en userDataJson
                    null
                } else {
                    buildJsonObject {
                        put("nickname", nickname)
                    }
                }

                // Bloc d'inscription Supabase
                // Si l'import io.github.jan.supabase.auth.provider.EmailAuth fonctionne,
                // alors EmailAuth ici devrait être résolu.
                //supabase.auth.signUpWith(EmailAuth) { // Ligne 87 (numérotation approx.)
                //    this.email = emailValue        // Ligne 88
                //    this.password = passwordValue  // Ligne 89
                //    this.userData = userDataJson   // Ligne 90
                //}

                progressBar.visibility = View.GONE
                Toast.makeText(
                    this@RegisterActivity,
                    "Compte créé ! Veuillez vérifier votre email pour confirmer (si activé).",
                    Toast.LENGTH_LONG
                ).show()
                finish()

            } catch (e: Exception) {
                progressBar.visibility = View.GONE
                createAccountButton.isEnabled = true
                Log.e("RegisterActivity", "Erreur d'inscription: ${e.message}", e)
                Toast.makeText(
                    this@RegisterActivity,
                    "Erreur d'inscription: ${e.localizedMessage ?: "Une erreur inconnue est survenue"}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}