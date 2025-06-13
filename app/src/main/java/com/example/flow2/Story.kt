// Story.kt
package com.example.flow2

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Story(
    val id: Int, // int4

    @SerialName("user_id")
    val userId: String, // UUID de Profile.id

    val content: String? = null, // Texte associé

    @SerialName("media_url")
    val mediaUrl: String, // URL du média

    @SerialName("media_type")
    val mediaType: String, // "image" ou "video"

    val duration: Int? = null, // Durée d'affichage pour les images, en secondes

    @SerialName("created_at")
    val createdAt: String, // Timestamp

    @SerialName("expires_at")
    val expiresAt: String, // Timestamp

    // --- Champs supplémentaires pour les données jointes (optionnel) ---
    @SerialName("UserProfile") // Pour les détails de l'utilisateur qui a posté la story
    val userProfile: Profile? = null
)